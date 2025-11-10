"use server";

import { api } from "@/convex/_generated/api";
import convex from "@/lib/convexClient";
import { Id } from "@/convex/_generated/dataModel";

export async function getFileDownloadUrl(fileId: Id<"_storage"> | string) {
  try {
    const downloadUrl = await convex.query(api.receipts.getReceiptDownloadUrl, {
      fileId: fileId as Id<"_storage">,
    });
    if (!downloadUrl) {
      throw new Error("Download URL not found");
    }
    return {
      success: true,
      downloadUrl,
    };
  } catch (error) {
    console.error("Error getting file download URL:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
