function DeleteConfirmModal({ isOpen, onClose, onConfirm, noteTitle, loading }) {
  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-2">Delete Note</h3>

        <p className="text-sm opacity-80">
          Are you sure you want to delete
          <span className="font-semibold"> {noteTitle || "this note"} </span>?
        </p>

        <p className="text-sm text-error mt-2">
          This action cannot be undone.
        </p>

        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default DeleteConfirmModal;
