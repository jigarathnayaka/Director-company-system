import { query } from "../config/db.js";
import { normalizeText, normalizeId } from "../utils/normalize.js";

export async function createDocumentRecord(file) {
  const result = await query(
    `
    INSERT INTO documents
    (original_file_name, stored_file_name, file_path, mime_type, processing_status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      file.originalname,
      file.filename,
      file.path,
      file.mimetype,
      "uploaded"
    ]
  );

  return result.rows[0];
}

export async function updateDocumentRecord(documentId, data) {
  const result = await query(
    `
    UPDATE documents
    SET ocr_text = $1,
        extraction_json = $2,
        processing_status = $3
    WHERE id = $4
    RETURNING *
    `,
    [
      data.ocr_text || null,
      data.extraction_json || null,
      data.processing_status || "processed",
      documentId
    ]
  );

  return result.rows[0];
}

export async function upsertCompany(company) {
  const companyName = company.company_name;
  const normalizedCompanyName = normalizeText(companyName);

  if (!normalizedCompanyName) {
    throw new Error("Company name is required.");
  }

  const result = await query(
    `
    INSERT INTO companies
    (company_name, normalized_company_name, registration_no, company_address)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (normalized_company_name)
    DO UPDATE SET
      registration_no = COALESCE(EXCLUDED.registration_no, companies.registration_no),
      company_address = COALESCE(EXCLUDED.company_address, companies.company_address)
    RETURNING *
    `,
    [
      companyName,
      normalizedCompanyName,
      company.registration_no || null,
      company.company_address || null
    ]
  );

  return result.rows[0];
}

export async function upsertDirector(director) {
  const directorName = director.director_name;
  const normalizedDirectorName = normalizeText(directorName);
  const normalizedIdNumber = normalizeId(director.id_number);

  if (!normalizedDirectorName) {
    throw new Error("Director name is required.");
  }

  if (normalizedIdNumber) {
    const result = await query(
      `
      INSERT INTO directors
      (director_name, normalized_director_name, id_number, normalized_id_number, director_address, email)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (normalized_id_number)
      DO UPDATE SET
        director_name = EXCLUDED.director_name,
        normalized_director_name = EXCLUDED.normalized_director_name,
        director_address = COALESCE(EXCLUDED.director_address, directors.director_address),
        email = COALESCE(EXCLUDED.email, directors.email)
      RETURNING *
      `,
      [
        directorName,
        normalizedDirectorName,
        director.id_number || null,
        normalizedIdNumber,
        director.director_address || null,
        director.email || null
      ]
    );

    return result.rows[0];
  }

  const existing = await query(
    `
    SELECT *
    FROM directors
    WHERE normalized_director_name = $1
    LIMIT 1
    `,
    [normalizedDirectorName]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await query(
    `
    INSERT INTO directors
    (director_name, normalized_director_name, director_address, email)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      directorName,
      normalizedDirectorName,
      director.director_address || null,
      director.email || null
    ]
  );

  return result.rows[0];
}

export async function linkCompanyDirector(
  companyId,
  directorId,
  documentId,
  role = "Director"
) {
  const result = await query(
    `
    INSERT INTO company_directors
    (company_id, director_id, document_id, role)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (company_id, director_id)
    DO UPDATE SET
      document_id = COALESCE(EXCLUDED.document_id, company_directors.document_id),
      role = COALESCE(EXCLUDED.role, company_directors.role)
    RETURNING *
    `,
    [companyId, directorId, documentId, role]
  );

  return result.rows[0];
}

export async function getAllDirectors() {
  const result = await query(
    `
    SELECT
      d.id,
      d.director_name,
      d.id_number,
      d.director_address,
      d.email,
      COUNT(cd.company_id) AS company_count
    FROM directors d
    LEFT JOIN company_directors cd ON d.id = cd.director_id
    GROUP BY d.id
    ORDER BY d.director_name ASC
    `
  );

  return result.rows;
}

export async function getAllCompanies() {
  const result = await query(
    `
    SELECT
      c.id,
      c.company_name,
      c.registration_no,
      c.company_address,
      COUNT(cd.director_id) AS director_count
    FROM companies c
    LEFT JOIN company_directors cd ON c.id = cd.company_id
    GROUP BY c.id
    ORDER BY c.company_name ASC
    `
  );

  return result.rows;
}

export async function getCompaniesByDirector(directorId) {
  const directorResult = await query(
    `
    SELECT id, director_name, id_number, director_address, email
    FROM directors
    WHERE id = $1
    `,
    [directorId]
  );

  const companiesResult = await query(
    `
    SELECT
      c.id,
      c.company_name,
      c.registration_no,
      c.company_address,
      cd.role,
      doc.original_file_name AS source_document
    FROM company_directors cd
    JOIN companies c ON cd.company_id = c.id
    LEFT JOIN documents doc ON cd.document_id = doc.id
    WHERE cd.director_id = $1
    ORDER BY c.company_name ASC
    `,
    [directorId]
  );

  const companyIds = companiesResult.rows.map((row) => row.id);
  let boardMembersByCompany = {};

  if (companyIds.length > 0) {
    const boardResult = await query(
      `
      SELECT
        cd.company_id,
        d.id,
        d.director_name,
        d.id_number,
        d.director_address,
        d.email,
        cd.role
      FROM company_directors cd
      JOIN directors d ON cd.director_id = d.id
      WHERE cd.company_id = ANY($1::int[])
      ORDER BY d.director_name ASC
      `,
      [companyIds]
    );

    boardMembersByCompany = boardResult.rows.reduce(
      (acc, member) => {
        if (!acc[member.company_id]) {
          acc[member.company_id] = [];
        }

        acc[member.company_id].push({
          id: member.id,
          director_name: member.director_name,
          id_number: member.id_number,
          director_address: member.director_address,
          email: member.email,
          role: member.role || "Director"
        });

        return acc;
      },
      {}
    );
  }

  return {
    director: directorResult.rows[0] || null,
    companies: companiesResult.rows.map((company) => ({
      ...company,
      board_members: boardMembersByCompany[company.id] || []
    }))
  };
}

export async function getCompanyDetails(companyId) {
  const companyResult = await query(
    `
    SELECT id, company_name, registration_no, company_address
    FROM companies
    WHERE id = $1
    `,
    [companyId]
  );

  const directorsResult = await query(
    `
    SELECT
      d.id,
      d.director_name,
      d.id_number,
      d.director_address,
      d.email,
      cd.role
    FROM company_directors cd
    JOIN directors d ON cd.director_id = d.id
    WHERE cd.company_id = $1
    ORDER BY d.director_name ASC
    `,
    [companyId]
  );

  const directorIds = directorsResult.rows.map((row) => row.id);
  let otherCompaniesByDirector = {};

  if (directorIds.length > 0) {
    const otherCompaniesResult = await query(
      `
      SELECT
        cd.director_id,
        c.id,
        c.company_name,
        c.registration_no
      FROM company_directors cd
      JOIN companies c ON cd.company_id = c.id
      WHERE cd.director_id = ANY($1::int[])
        AND cd.company_id <> $2
      ORDER BY c.company_name ASC
      `,
      [directorIds, companyId]
    );

    otherCompaniesByDirector = otherCompaniesResult.rows.reduce(
      (acc, row) => {
        if (!acc[row.director_id]) {
          acc[row.director_id] = [];
        }

        acc[row.director_id].push({
          id: row.id,
          company_name: row.company_name,
          registration_no: row.registration_no
        });

        return acc;
      },
      {}
    );
  }

  return {
    company: companyResult.rows[0] || null,
    directors: directorsResult.rows.map((director) => ({
      ...director,
      other_companies: otherCompaniesByDirector[director.id] || []
    }))
  };
}
