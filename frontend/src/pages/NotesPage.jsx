import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiPlus } from "react-icons/fi";
import NoteCard from "../components/NoteCard";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Toast from "../components/Toast";
import api from "../services/api";
import { clearAuth } from "../utils/auth";

function NotesPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchNotes() {
    try {
      setLoading(true);
      setPageError("");

      const response = await api.get("/notes/");
      setNotes(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuth();
        navigate("/login");
        return;
      }

      setPageError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  function handleView(note) {
    navigate(`/notes/${note.id}`);
  }

  function handleEdit(note) {
    navigate(`/notes/${note.id}?mode=edit`);
  }

  function handleDeleteClick(note) {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!noteToDelete) return;

    try {
      setDeleteLoading(true);
      await api.delete(`/notes/${noteToDelete.id}`);
      setDeleteModalOpen(false);
      setNoteToDelete(null);
      setToast({ type: "success", message: "Note deleted successfully." });
      fetchNotes();
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Failed to delete note",
      });
    } finally {
      setDeleteLoading(false);
    }
  }

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;

    return notes.filter((note) => note.title.toLowerCase().includes(q));
  }, [notes, search]);

  return (
    <>
      <div className="max-w-[1120px] mx-auto">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-30 sm:text-[40px] lg:text-[35px] font-semibold leading-none tracking-tight">
            Your Notes
          </h1>
          <p className="mt-3 text-white/60 text-sm sm:text-base lg:text-md">
            All your notes are encrypted and secure
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/create")}
            className="h-10 sm:h-10 px-4 sm:px-5 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-white/90 transition font-medium flex items-center gap-2 w-full sm:w-fit justify-center"
          >
            <FiPlus className="text-[16px] sm:text-[18px]" />
            <span>Create Note</span>
          </button>

          <input
            type="text"
            placeholder="Search notes..."
            className="h-10 sm:h-10 w-full lg:max-w-[320px] rounded-xl sm:rounded-2xl border border-white/10 bg-transparent px-4 outline-none text-sm placeholder:text-white/35 focus:border-white/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {pageError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {pageError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[220px] rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
              />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#090a0d] p-8 sm:p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FiFileText className="text-white/50 text-[22px]" />
            </div>

            <h2 className="text-lg sm:text-xl font-semibold">
              {notes.length === 0 ? "No secure notes yet" : "No matching notes"}
            </h2>

            <p className="text-white/55 mt-2 max-w-md mx-auto text-sm sm:text-base">
              {notes.length === 0
                ? "Create your first encrypted note to get started."
                : "Try a different search term or clear the search input."}
            </p>

            {notes.length === 0 && (
              <button
                onClick={() => navigate("/create")}
                className="mt-6 h-10 px-5 rounded-xl bg-white text-black hover:bg-white/90 transition font-medium inline-flex items-center gap-2"
              >
                <FiPlus className="text-[16px]" />
                <span>Create Note</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            if (deleteLoading) return;
            setDeleteModalOpen(false);
            setNoteToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          noteTitle={noteToDelete?.title}
          loading={deleteLoading}
        />
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default NotesPage;
