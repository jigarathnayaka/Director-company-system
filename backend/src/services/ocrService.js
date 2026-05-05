import fs from "fs";
import dotenv from "dotenv";
import {
  AzureKeyCredential,
  DocumentAnalysisClient
} from "@azure/ai-form-recognizer";

dotenv.config();

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

  if (!endpoint || !key) {
    throw new Error("Azure Document Intelligence endpoint/key missing.");
  }

  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  const fileStream = fs.createReadStream(filePath);

  const poller = await client.beginAnalyzeDocument(
    "prebuilt-layout",
    fileStream
  );

  const result = await poller.pollUntilDone();

  return result.content || "";
}
