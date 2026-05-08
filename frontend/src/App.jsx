import { useEffect, useState } from "react";
import { api } from "./api/client";

import FileUpload from "./components/FileUpload";
import CompaniesList from "./components/CompaniesList";
import DirectorCompanies from "./components/DirectorCompanies";
import CompanyDetails from "./components/CompanyDetails";

import "./styles.css";

export default function App() {
  const [companies, setCompanies] = useState([]);
  const [selectedDirectorId, setSelectedDirectorId] =
    useState(null);
  const [directorCompanyData, setDirectorCompanyData] =
    useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] =
    useState(null);
  const [loadingCompanies, setLoadingCompanies] =
    useState(false);

  async function fetchCompanies() {
    setLoadingCompanies(true);

    try {
      const response = await api.get("/companies");
      setCompanies(response.data.data || []);
    } catch (error) {
      console.error("Failed to load companies", error);
    } finally {
      setLoadingCompanies(false);
    }
  }

  async function fetchDirectorCompanies(id) {
    setSelectedDirectorId(id);
    setSelectedCompanyId(null);
    setCompanyData(null);

    try {
      const response = await api.get(
        `/directors/${id}/companies`
      );

      setDirectorCompanyData(response.data.data);
    } catch (error) {
      console.error("Failed to load companies", error);
    }
  }

  async function fetchCompanyDetails(id) {
    setSelectedCompanyId(id);
    setSelectedDirectorId(null);
    setDirectorCompanyData(null);

    try {
      const response = await api.get(`/companies/${id}`);
      setCompanyData(response.data.data);
    } catch (error) {
      console.error("Failed to load company details", error);
    }
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function handleUploadSuccess(uploadData) {
    await fetchCompanies();

    const uploadedCompanyId = uploadData?.company?.id;
    if (uploadedCompanyId) {
      await fetchCompanyDetails(uploadedCompanyId);
    }
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

          {loadingCompanies ? (
            <div className="card">Loading companies...</div>
          ) : (
            <CompaniesList
              companies={companies}
              selectedCompanyId={selectedCompanyId}
              onSelect={fetchCompanyDetails}
            />
          )}
        </section>

        <section className="right-panel">
          {companyData ? (
            <CompanyDetails data={companyData} />
          ) : (
            <DirectorCompanies data={directorCompanyData} />
          )}
        </section>
      </main>
    </div>
  );
}