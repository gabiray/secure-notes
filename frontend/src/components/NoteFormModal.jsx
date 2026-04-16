import { useEffect, useState } from "react";

function NoteFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setContent(initialData.content || "");
    } else {
      setTitle("");
      setContent("");
    }
  }, [initialData, isOpen]);

  function handleSubmit(e) {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) return;

    onSubmit({
      title: cleanTitle,
      content: cleanContent,
    });
  }

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-xl mb-1">
          {initialData ? "Edit Note" : "Create Note"}
        </h3>
        <p className="text-sm opacity-70 mb-4">
          {initialData
            ? "Update the contents of your encrypted note."
            : "Create a new encrypted note."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Content</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full min-h-56"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your secure note here..."
              required
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!title.trim() || !content.trim()}
            >
              {initialData ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export default NoteFormModal;
