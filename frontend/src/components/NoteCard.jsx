function NoteCard({ note, onView, onEdit, onDelete }) {
  return (
    <div className="card bg-base-200 shadow-md border border-base-300 hover:shadow-lg transition-shadow">
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h2 className="card-title line-clamp-2">{note.title}</h2>
          <div className="badge badge-outline shrink-0">Encrypted</div>
        </div>

        <div className="mt-2 space-y-1 text-sm opacity-70">
          <p>Created: {new Date(note.created_at).toLocaleString()}</p>
          <p>Updated: {new Date(note.updated_at).toLocaleString()}</p>
        </div>

        <div className="card-actions justify-end mt-5">
          <button className="btn btn-sm btn-info" onClick={() => onView(note)}>
            View
          </button>
          <button className="btn btn-sm btn-warning" onClick={() => onEdit(note)}>
            Edit
          </button>
          <button className="btn btn-sm btn-error" onClick={() => onDelete(note)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
