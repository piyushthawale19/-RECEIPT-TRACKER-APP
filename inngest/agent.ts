import { inngest } from "./client";
import Events from "./constants";
import convex from "@/lib/convexClient";
import { client } from "@/lib/schematic";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Type definitions for receipt data
interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface ReceiptData {
  merchant: {
    name: string;
    address: string;
    contact: string;
  };
  transaction: {
    date: string;
    receipt_number: string;
    payment_method: string;
  };
  items: ReceiptItem[];
  totals: {
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  };
}

// Validate extracted data structure
function validateReceiptData(data: unknown): ReceiptData {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid receipt data structure");
  }

  const d = data as Record<string, any>;
  const merchant = (d.merchant as Record<string, any>) || {};
  const transaction = (d.transaction as Record<string, any>) || {};
  const totals = (d.totals as Record<string, any>) || {};

  return {
    merchant: {
      name: String(merchant.name || "Unknown Merchant").trim(),
      address: String(merchant.address || "").trim(),
      contact: String(merchant.contact || "").trim(),
    },
    transaction: {
      date: String(
        transaction.date || new Date().toISOString().split("T")[0],
      ).trim(),
      receipt_number: String(
        transaction.receipt_number || `REC${Date.now()}`,
      ).trim(),
      payment_method: String(transaction.payment_method || "Unknown").trim(),
    },
    items: Array.isArray(d.items)
      ? d.items.map((item: any) => {
          return {
            name: String(item.name || "Item").trim(),
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            totalPrice: Number(item.totalPrice) || 0,
          };
        })
      : [],
    totals: {
      subtotal: Number(totals.subtotal) || 0,
      tax: Number(totals.tax) || 0,
      total: Number(totals.total) || 0,
      currency: String(totals.currency || "USD").toUpperCase(),
    },
  };
}

// Retry logic with exponential backoff
// Free tier has strict rate limits, so we use longer delays
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelayMs: number = 2000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a rate limit error
      const isRateLimit =
        lastError.message.includes("429") ||
        lastError.message.includes("rate") ||
        lastError.message.includes("quota");

      if (attempt < maxRetries - 1) {
        // Use longer delays for rate limit errors
        let delayMs = baseDelayMs * Math.pow(2, attempt);
        if (isRateLimit) {
          delayMs = Math.max(delayMs, 10000); // At least 10 seconds for rate limits
          console.warn(
            `⚠️ Rate limited. Attempt ${attempt + 1}/${maxRetries}. Waiting ${delayMs}ms...`,
          );
        } else {
          console.warn(
            `⚠️ Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delayMs}ms...`,
            lastError.message,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

export const extractAndSavePDF = inngest.createFunction(
  {
    id: "Extract PDF and Save in Database",
    retries: 3,
  },
  { event: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE },
  async ({ event, step }) => {
    // Step 1: Extract data from PDF using Gemini AI
    const extractedData = await step.run("extract-pdf-data", async () => {
      try {
        console.log("📄 Fetching PDF from:", event.data.url);

        // Fetch PDF with retry
        const pdfBuffer = await retryWithBackoff(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          try {
            const pdfResponse = await fetch(event.data.url, {
              signal: controller.signal,
            });
            if (!pdfResponse.ok) {
              throw new Error(
                `PDF fetch failed: ${pdfResponse.status} ${pdfResponse.statusText}`,
              );
            }
            return pdfResponse.arrayBuffer();
          } finally {
            clearTimeout(timeoutId);
          }
        });

        console.log(
          "✅ PDF fetched successfully, size:",
          pdfBuffer.byteLength,
          "bytes",
        );

        if (pdfBuffer.byteLength === 0) {
          throw new Error("PDF file is empty");
        }

        // Validate PDF header
        const pdfHeader = new Uint8Array(pdfBuffer).slice(0, 4);
        const pdfSignature = String.fromCharCode(...pdfHeader);
        if (!pdfSignature.startsWith("%PDF")) {
          console.warn(
            "⚠️ PDF header invalid. File may be corrupted or not a valid PDF.",
          );
        }

        // Convert PDF buffer to base64
        const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

        // Initialize Gemini AI
        const { GoogleGenerativeAI } = await import("@google/generative-ai");

        if (!process.env.GEMINI_API_KEY) {
          throw new Error(
            "GEMINI_API_KEY environment variable is not configured. Set it in .env.local",
          );
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Test network connectivity to Gemini API
        console.log("🔍 Testing Gemini API connectivity and quota...");
        try {
          const testResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models?key=" +
              process.env.GEMINI_API_KEY,
            { signal: AbortSignal.timeout(5000) },
          );
          if (!testResponse.ok) {
            const statusCode = testResponse.status;
            console.warn(
              `⚠️ Gemini API returned ${statusCode}: ${testResponse.statusText}`,
            );
            if (statusCode === 401 || statusCode === 403) {
              throw new Error(
                `API Key issue (${statusCode}): Check your GEMINI_API_KEY in .env.local`,
              );
            } else if (statusCode === 429) {
              console.warn(
                "⚠️ Rate limited (429): Free tier quota exceeded. Waiting before retry...",
              );
              // Add longer delay for rate limiting
              await new Promise((resolve) => setTimeout(resolve, 5000));
            }
          } else {
            console.log("✅ Gemini API connectivity confirmed");
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          if (errorMsg.includes("timeout") || errorMsg.includes("ENOTFOUND")) {
            console.error(
              "🔴 Network error: Cannot reach generativelanguage.googleapis.com",
            );
            console.error("   - Check your internet connection");
            console.error("   - Check firewall/proxy settings");
          }
          console.warn("⚠️ Connectivity test warning:", errorMsg);
        }

        // Model selection - use the fastest working model from our tests
        // Note: The test script confirmed "models/gemini-2.5-flash" works
        const modelName = process.env.GEMINI_MODEL || "models/gemini-2.5-flash";

        console.log(`🤖 Using Gemini model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        console.log(`✅ Model ${modelName} initialized`);

        // Enhanced extraction prompt for vision models
        const extractionPrompt = `You are an expert receipt data extraction AI. Analyze this receipt document image/PDF and extract ALL visible data.

Return ONLY a valid JSON object with NO markdown, NO code blocks, NO explanations:

{
  "merchant": {
    "name": "Store or business name",
    "address": "Full street address if visible",
    "contact": "Phone number or email if visible"
  },
  "transaction": {
    "date": "YYYY-MM-DD format (e.g., 2025-11-12)",
    "receipt_number": "Receipt, invoice, or order number",
    "payment_method": "Cash, Credit Card, Debit, Check, etc"
  },
  "items": [
    {
      "name": "Product or service name",
      "quantity": 1,
      "unitPrice": 10.99,
      "totalPrice": 10.99
    }
  ],
  "totals": {
    "subtotal": 100.00,
    "tax": 8.50,
    "total": 108.50,
    "currency": "USD"
  }
}

EXTRACTION RULES:
- Extract ONLY data visible in the document
- Do NOT fabricate or guess information
- For missing fields, use: empty string "" or 0
- Dates MUST be YYYY-MM-DD format
- All numbers MUST be numeric (not strings)
- Return ONLY the JSON object, nothing else
- If no items found, return empty array []
- Currency: detect from receipt or default to USD`;

        console.log("🤖 Extracting receipt data with model:", modelName);

        let result;
        try {
          result = await retryWithBackoff(async () => {
            return model.generateContent([
              {
                inlineData: {
                  data: base64Pdf,
                  mimeType: "application/pdf",
                },
              },
              extractionPrompt,
            ]);
          });
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error("🔴 Gemini extraction failed:", errorMsg);

          // Provide detailed error context
          if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
            throw new Error(
              "GEMINI_API_KEY is invalid or expired. Get a new key from https://makersuite.google.com/app/apikey",
            );
          } else if (
            errorMsg.includes("403") ||
            errorMsg.includes("Forbidden")
          ) {
            throw new Error(
              "GEMINI_API_KEY lacks permissions or quota is exhausted. Check your API quota.",
            );
          } else if (
            errorMsg.includes("429") ||
            errorMsg.includes("Rate limit")
          ) {
            throw new Error(
              "Rate limited by Gemini API. Waiting before retry...",
            );
          } else if (errorMsg.includes("Error fetching")) {
            throw new Error(
              "Cannot reach Gemini API. Check firewall/network access to generativelanguage.googleapis.com",
            );
          }
          throw error;
        }

        const response = await result.response;
        const text = response.text();

        console.log("📝 Raw AI response length:", text.length);

        // Parse and validate response
        const cleanedText = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        let parsedData;
        try {
          parsedData = JSON.parse(cleanedText);
        } catch (parseError) {
          console.error(
            "❌ JSON parse failed. Response:",
            cleanedText.substring(0, 500),
          );
          throw new Error(
            `AI response is not valid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
          );
        }

        // Validate and normalize data
        const receiptData = validateReceiptData(parsedData);

        console.log("✅ Receipt data extracted successfully:", {
          merchant: receiptData.merchant.name,
          itemCount: receiptData.items.length,
          total: receiptData.totals.total,
          currency: receiptData.totals.currency,
        });

        return receiptData;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("🔴 PDF extraction step failed:", errorMsg);
        throw error;
      }
    });

    // Step 2: Save extracted data to database
    const saveResult = await step.run("save-to-database", async () => {
      try {
        console.log("💾 Saving extracted data to database...");

        // Call the Convex mutation to update the receipt with extracted data
        const { userId } = await convex.mutation(
          api.receipts.updateReceiptWithExtractedData,
          {
            id: event.data.receiptId as Id<"receipts">,
            fileDisplayName: extractedData.merchant.name || "Receipt",
            merchantName: extractedData.merchant.name,
            merchantAddress: extractedData.merchant.address,
            merchantContact: extractedData.merchant.contact,
            transactionDate: extractedData.transaction.date,
            transactionAmount: extractedData.totals.total,
            receiptSummary: `Receipt from ${extractedData.merchant.name} on ${extractedData.transaction.date} for ${extractedData.totals.currency} ${extractedData.totals.total}. ${extractedData.items.length} item(s) purchased.`,
            currency: extractedData.totals.currency,
            items: extractedData.items,
          },
        );

        console.log("✅ Data saved to database for user:", userId);

        // Track event in schematic
        await client.track({
          event: "scan",
          company: {
            id: userId,
          },
          user: {
            id: userId,
          },
        });

        console.log("✅ Event tracked in Schematic");

        return {
          success: true,
          userId,
          receiptId: event.data.receiptId,
          merchantName: extractedData.merchant.name,
          totalAmount: extractedData.totals.total,
          currency: extractedData.totals.currency,
          itemCount: extractedData.items.length,
        };
      } catch (error) {
        console.error("❌ Error saving to database:", error);
        throw error;
      }
    });

    console.log("🎉 PDF extraction and save completed successfully!");

    // Generate AI Summary of the receipt
    const aiSummary = {
      overview: `Receipt from ${extractedData.merchant.name} dated ${extractedData.transaction.date}`,
      merchantInfo: `${extractedData.merchant.name}${extractedData.merchant.address ? ` located at ${extractedData.merchant.address}` : ""}${extractedData.merchant.contact ? ` (Contact: ${extractedData.merchant.contact})` : ""}`,
      transactionDetails: `Transaction #${extractedData.transaction.receipt_number} paid via ${extractedData.transaction.payment_method}`,
      itemsSummary:
        extractedData.items.length > 0
          ? `Purchased ${extractedData.items.length} item(s): ${extractedData.items.map((item) => `${item.name} (Qty: ${item.quantity}, Price: ${extractedData.totals.currency} ${item.totalPrice})`).join(", ")}`
          : "No items listed",
      financialBreakdown: {
        subtotal: `${extractedData.totals.currency} ${extractedData.totals.subtotal.toFixed(2)}`,
        tax: `${extractedData.totals.currency} ${extractedData.totals.tax.toFixed(2)}`,
        total: `${extractedData.totals.currency} ${extractedData.totals.total.toFixed(2)}`,
        description: `Subtotal: ${extractedData.totals.currency} ${extractedData.totals.subtotal.toFixed(2)}, Tax: ${extractedData.totals.currency} ${extractedData.totals.tax.toFixed(2)}, Grand Total: ${extractedData.totals.currency} ${extractedData.totals.total.toFixed(2)}`,
      },
      quickSummary: `${extractedData.merchant.name} - ${extractedData.items.length} item(s) totaling ${extractedData.totals.currency} ${extractedData.totals.total.toFixed(2)} on ${extractedData.transaction.date}`,
    };

    console.log("📊 AI Summary generated:", aiSummary.quickSummary);

    return {
      status: "completed",
      extractedData,
      saveResult,
      aiSummary,
    };
  },
);
