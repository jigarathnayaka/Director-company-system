import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function extractCompanyDirectorData(ocrText) {
  if (process.env.MOCK_MODE === "true") {
    return {
      company: {
        company_name: "ABC HOLDINGS (PRIVATE) LIMITED",
        registration_no: "PV00234567",
        company_address: "No 25, Colombo Road, Colombo"
      },
      directors: [
        {
          director_name: "NIMAL PERERA",
          id_number: "901234567V",
          director_address: "No 10, Kandy Road, Kandy",
          email: null,
          role: "Director"
        },
        {
          director_name: "KAMAL SILVA",
          id_number: "881234567V",
          director_address: "No 15, Galle Road, Galle",
          email: null,
          role: "Director"
        }
      ]
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key missing.");
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const prompt = `
Extract company and director details from this OCR text.

Return only valid JSON. Do not return markdown. Do not return explanations.

JSON format:
{
  "company": {
    "company_name": "",
    "registration_no": "",
    "company_address": ""
  },
  "directors": [
    {
      "director_name": "",
      "id_number": "",
      "director_address": "",
      "email": "",
      "role": "Director"
    }
  ]
}

Rules:
- Do not invent missing data.
- If a value is missing, use null.
- id_number can be NIC, passport number, national ID, or another legal ID.
- Extract all current directors/secretaries mentioned in the notice.
- Include people from sections like INITIAL DIRECTORS, DIRECTORS, APPOINTMENT OF NEW DIRECTORS/SECRETARIES,
  and NAMES AND RESIDENTIAL ADDRESS OF EVERY PERSON WHO IS A DIRECTOR/SECRETARY.
- Preserve names as close as possible to the document.
- Company name should come from labels like Name of Proposed Company, Company Name, Name of Company, or similar.
- role should be "Director" or "Secretary" when indicated; default to "Director" if unclear.

OCR TEXT:
${ocrText}
`;

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: "You extract structured JSON from OCR text."
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const content = response.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error("LLM did not return valid JSON.");
  }
}
