import { FiAlertTriangle, FiX } from "react-icons/fi";

function DeleteConfirmModal({ isOpen, onClose, onConfirm, noteTitle, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#090a0d] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-red-500/10 flex items-center justify-center">
              <FiAlertTriangle className="text-red-400 text-[20px]" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Delete Note</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/60"
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-white/70 leading-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              {noteTitle || "this note"}
            </span>
            ? This action cannot be undone and the note will be permanently removed.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="h-11 rounded-xl bg-red-600 hover:bg-red-500 transition text-sm font-medium"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
