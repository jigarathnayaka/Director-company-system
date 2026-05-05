export default function DirectorsList({
  directors,
  selectedDirectorId,
  onSelect
}) {
  return (
    <div className="card">
      <h2>Directors</h2>

      {directors.length === 0 && (
        <p className="muted">No directors found yet.</p>
      )}

      <div className="director-list">
        {directors.map((director) => (
          <button
            key={director.id}
            className={
              selectedDirectorId === director.id
                ? "director-item active"
                : "director-item"
            }
            onClick={() => onSelect(director.id)}
          >
            <strong>{director.director_name}</strong>
            <span>
              ID: {director.id_number || "Not available"}
            </span>
            <small>
              {director.company_count} company / companies
            </small>
          </button>
        ))}
      </div>
    </div>
  );
}