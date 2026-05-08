export default function CompanyDetails({ data }) {
  if (!data?.company) {
    return (
      <div className="card">
        <h2>Company Details</h2>
        <p className="muted">
          Upload a document to view company and director details.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Company Details</h2>

      <div className="profile-box">
        <h3>{data.company.company_name}</h3>

        <p>
          <strong>Registration No:</strong>{" "}
          {data.company.registration_no || "Not available"}
        </p>

        <p>
          <strong>Address:</strong>{" "}
          {data.company.company_address || "Not available"}
        </p>
      </div>

      <h2>Directors & Secretaries</h2>

      {data.directors.length === 0 && (
        <p className="muted">No directors found for this company.</p>
      )}

      <div className="director-details-list">
        {data.directors.map((director) => (
          <div key={director.id} className="director-detail-card">
            {director.other_companies?.length ? (
              <span
                className="other-company-indicator"
                title="Has other companies"
              />
            ) : null}

            <h3>{director.director_name}</h3>

            <p>
              <strong>Role:</strong> {director.role || "Director"}
            </p>

            <p>
              <strong>ID:</strong> {director.id_number || "Not available"}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {director.director_address || "Not available"}
            </p>

            <p>
              <strong>Email:</strong> {director.email || "Not available"}
            </p>

            <details className="other-companies">
              <summary>Other companies</summary>
              {director.other_companies?.length ? (
                <ul>
                  {director.other_companies.map((company) => (
                    <li key={company.id}>
                      {company.company_name}
                      {company.registration_no
                        ? ` (${company.registration_no})`
                        : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No other companies found.</p>
              )}
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
