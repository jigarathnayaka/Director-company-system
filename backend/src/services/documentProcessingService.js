import { extractTextFromDocument } from "./ocrService.js";
import { extractCompanyDirectorData } from "./llmExtractionService.js";
import {
  createDocumentRecord,
  updateDocumentRecord,
  upsertCompany,
  upsertDirector,
  linkCompanyDirector
} from "./databaseService.js";

export async function processUploadedDocument(file) {
  const documentRecord = await createDocumentRecord(file);

  try {
    const ocrText = await extractTextFromDocument(file.path);

    const extractedData = await extractCompanyDirectorData(ocrText);

    if (!extractedData?.company?.company_name) {
      throw new Error("Company name could not be extracted.");
    }

    const company = await upsertCompany(extractedData.company);

    const savedDirectors = [];

    for (const directorData of extractedData.directors || []) {
      if (!directorData.director_name) continue;

      const director = await upsertDirector(directorData);

      await linkCompanyDirector(
        company.id,
        director.id,
        documentRecord.id,
        directorData.role || "Director"
      );

      savedDirectors.push(director);
    }

    await updateDocumentRecord(documentRecord.id, {
      ocr_text: ocrText,
      extraction_json: extractedData,
      processing_status: "processed"
    });

    return {
      document: documentRecord,
      company,
      directors: savedDirectors,
      extracted_data: extractedData
    };
  } catch (error) {
    await updateDocumentRecord(documentRecord.id, {
      ocr_text: null,
      extraction_json: { error: error.message },
      processing_status: "failed"
    });

    throw error;
  }
}
