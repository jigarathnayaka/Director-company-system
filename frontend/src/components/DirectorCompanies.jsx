export default function DirectorCompanies({ data }) {
  if (!data?.director) {
    return (
      <div className="card">
        <h2>Director Companies</h2>
        <p className="muted">
          Select a director to view related companies.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Director Details</h2>

      <div className="profile-box">
        <h3>{data.director.director_name}</h3>

        <p>
          <strong>ID:</strong>{" "}
          {data.director.id_number || "Not available"}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {data.director.director_address || "Not available"}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {data.director.email || "Not available"}
        </p>
      </div>

      <h2>Related Companies</h2>

      {data.companies.length === 0 && (
        <p className="muted">
          No companies linked to this director.
        </p>
      )}

      <div className="company-list">
        {data.companies.map((company) => (
          <div key={company.id} className="company-card">
            <h3>{company.company_name}</h3>

            <p>
              <strong>Registration No:</strong>{" "}
              {company.registration_no || "Not available"}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {company.company_address || "Not available"}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {company.role || "Director"}
            </p>

            <p>
              <strong>Source Document:</strong>{" "}
              {company.source_document || "Not available"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}