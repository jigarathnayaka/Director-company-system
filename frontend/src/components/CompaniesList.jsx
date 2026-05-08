export default function CompaniesList({
  companies,
  selectedCompanyId,
  onSelect
}) {
  return (
    <div className="card">
      <h2>Companies</h2>

      {companies.length === 0 && (
        <p className="muted">No companies found yet.</p>
      )}

      <div className="director-list">
        {companies.map((company) => (
          <button
            key={company.id}
            className={
              selectedCompanyId === company.id
                ? "director-item active"
                : "director-item"
            }
            onClick={() => onSelect(company.id)}
          >
            <strong>{company.company_name}</strong>
            <span>
              Registration No: {company.registration_no || "Not available"}
            </span>
            <small>
              {company.director_count} director / directors
            </small>
          </button>
        ))}
      </div>
    </div>
  );
}
