"use server";

import { api } from "@/convex/_generated/api";
import convex from "@/lib/convexClient";
// import { revalidatePath } from "next/cache";
// import { inngest } from "@/inngest/client";
// import { uploadPDFEvent } from "@/inngest/events/uploadPDFEvent";

import { currentUser } from "@clerk/nextjs/server";
import { getFileDownloadUrl } from "./getFileDownloadUrl";
import { inngest } from "@/inngest/client";
// import { events } from "@schematichq/schematic-typescript-node/dist/api/resources";
import Events from "@/inngest/constants";

export async function uploadPDF(formData: FormData) {
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }
  try {
    // Get the file from the form data
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    if (
      !file.type.includes("pdf") &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return { success: false, error: "Only PDF files are allowed" };
    }

    const uploadUrl = await convex.mutation(api.receipts.generateUploadUrl, {});

    const arrayBuffer = await file.arrayBuffer();

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": file.type,
      },
      body: new Uint8Array(arrayBuffer),
    });
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file :${uploadResponse.statusText}`);
    }

    const { storageId } = await uploadResponse.json();

    const receiptId = await convex.mutation(api.receipts.storeReceipt, {
      userId: user.id,
      fileId: storageId,
      fileName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    const fileUrl = await getFileDownloadUrl(storageId);

    // Trigger inngest agent flow (optional - will fail gracefully if INNGEST_SIGNING_KEY is not set)
    try {
      await inngest.send({
        name: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE,
        data: {
          url: fileUrl.downloadUrl,
          receiptId,
        },
      });
    } catch (inngestError) {
      console.warn(
        "Inngest event failed (this is expected if INNGEST_SIGNING_KEY is not configured):",
        inngestError,
      );
      // Continue with upload success even if Inngest fails
    }

    return {
      success: true,
      data: {
        receiptId,
        fileName: file.name,
      },
    };
  } catch (error) {
    console.error("Server action upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
