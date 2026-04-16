function ViewNoteModal({ isOpen, onClose, note }) {
  if (!isOpen || !note) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-xl mb-2">{note.title}</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className={`badge ${note.integrity_ok ? "badge-success" : "badge-error"}`}>
            {note.integrity_ok ? "Integrity OK" : "Integrity Failed"}
          </div>

          <div className="badge badge-outline">
            Created: {new Date(note.created_at).toLocaleString()}
          </div>

          <div className="badge badge-outline">
            Updated: {new Date(note.updated_at).toLocaleString()}
          </div>
        </div>

        <div className="bg-base-300 rounded-xl p-4 border border-base-200">
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {note.content}
          </p>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default ViewNoteModal;
