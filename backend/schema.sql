CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    original_file_name TEXT NOT NULL,
    stored_file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT,
    ocr_text TEXT,
    extraction_json JSONB,
    processing_status TEXT DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    company_name TEXT NOT NULL,
    normalized_company_name TEXT NOT NULL UNIQUE,
    registration_no TEXT,
    company_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS directors (
    id SERIAL PRIMARY KEY,
    director_name TEXT NOT NULL,
    normalized_director_name TEXT NOT NULL,
    id_number TEXT,
    normalized_id_number TEXT UNIQUE,
    director_address TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_directors (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    director_id INTEGER NOT NULL REFERENCES directors(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'Director',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (company_id, director_id)
);