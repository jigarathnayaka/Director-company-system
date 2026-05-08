import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import pdfParse from "pdf-parse";
import { createWorker } from "tesseract.js";
import {
  AzureKeyCredential,
  DocumentAnalysisClient
} from "@azure/ai-form-recognizer";

dotenv.config();

async function extractTextWithLocalOcr(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const fileBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(fileBuffer);
    const text = parsed.text?.trim() || "";

    if (!text) {
      throw new Error(
        "No text found in PDF. Use Azure OCR for scanned PDFs."
      );
    }

    return text;
  }

  if ([".png", ".jpg", ".jpeg"].includes(ext)) {
    const worker = await createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    return data.text || "";
  }

  throw new Error("Unsupported file type for local OCR.");
}

function getContentTypeFromExt(ext) {
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

function validateFileBuffer(fileBuffer, filePath) {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("Uploaded file is empty or unreadable.");
  }

  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const signature = fileBuffer.slice(0, 5).toString();
    if (signature !== "%PDF-") {
      throw new Error("Uploaded PDF appears to be invalid or corrupted.");
    }
  }
}

export async function extractTextFromDocument(filePath) {
  if (process.env.MOCK_MODE === "true") {
    return `
      FORM 1
      Name of Proposed Company: ABC HOLDINGS (PRIVATE) LIMITED
      Company Registration No: PV00234567
      Registered Address: No 25, Colombo Road, Colombo

      INITIAL DIRECTORS
      Full Name: NIMAL PERERA
      NIC No: 901234567V
      Address: No 10, Kandy Road, Kandy

      Full Name: KAMAL SILVA
      NIC No: 881234567V
      Address: No 15, Galle Road, Galle
    `;
  }

  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  const useLocalOcr = process.env.USE_LOCAL_OCR === "true";

  if (!endpoint || !key || useLocalOcr) {
    return extractTextWithLocalOcr(filePath);
  }

  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  const ext = path.extname(filePath).toLowerCase();
  const contentType = getContentTypeFromExt(ext);
  const fileBuffer = fs.readFileSync(filePath);

  validateFileBuffer(fileBuffer, filePath);

  try {
    const poller = await client.beginAnalyzeDocument(
      "prebuilt-layout",
      fileBuffer,
      { contentType }
    );

    const result = await poller.pollUntilDone();

    return result.content || "";
  } catch (error) {
    const isInvalidContent =
      error?.details?.error?.innererror?.code === "InvalidContent" ||
      error?.details?.error?.code === "InvalidRequest";

    if (isInvalidContent) {
      return extractTextWithLocalOcr(filePath);
    }

    throw error;
  }
}
