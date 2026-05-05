import { useEffect, useState } from "react";
import { api } from "./api/client";

import FileUpload from "./components/FileUpload";
import DirectorsList from "./components/DirectorsList";
import DirectorCompanies from "./components/DirectorCompanies";

import "./styles.css";

export default function App() {
  const [directors, setDirectors] = useState([]);
  const [selectedDirectorId, setSelectedDirectorId] =
    useState(null);
  const [directorCompanyData, setDirectorCompanyData] =
    useState(null);
  const [loadingDirectors, setLoadingDirectors] =
    useState(false);

  async function fetchDirectors() {
    setLoadingDirectors(true);

    try {
      const response = await api.get("/directors");
      setDirectors(response.data.data || []);
    } catch (error) {
      console.error("Failed to load directors", error);
    } finally {
      setLoadingDirectors(false);
    }
  }

  async function fetchDirectorCompanies(id) {
    setSelectedDirectorId(id);

    try {
      const response = await api.get(
        `/directors/${id}/companies`
      );

      setDirectorCompanyData(response.data.data);
    } catch (error) {
      console.error("Failed to load companies", error);
    }
  }

  useEffect(() => {
    fetchDirectors();
  }, []);

  async function handleUploadSuccess() {
    await fetchDirectors();
  }

  return (
    <div className="app">
      <header>
        <h1>Director–Company Mapping System</h1>
        <p>
          Upload company registration documents and automatically
          map directors to related companies.
        </p>
      </header>

      <main className="layout">
        <section className="left-panel">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
          />

          {loadingDirectors ? (
            <div className="card">Loading directors...</div>
          ) : (
            <DirectorsList
              directors={directors}
              selectedDirectorId={selectedDirectorId}
              onSelect={fetchDirectorCompanies}
            />
          )}
        </section>

        <section className="right-panel">
          <DirectorCompanies data={directorCompanyData} />
        </section>
      </main>
    </div>
  );
}