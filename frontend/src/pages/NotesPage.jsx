import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import NoteFormModal from "../components/NoteFormModal";
import ViewNoteModal from "../components/ViewNoteModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import api from "../services/api";
import { clearAuth, isAuthenticated } from "../utils/auth";

function NotesPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    fetchNotes();
  }, []);

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

  async function handleCreateNote(data) {
    try {
      await api.post("/notes/", data);
      setModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create note");
    }
  }

  async function handleViewNote(note) {
    try {
      const response = await api.get(`/notes/${note.id}`);
      setViewingNote(response.data);
      setViewModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load note");
    }
  }

  async function handleEditClick(note) {
    try {
      const response = await api.get(`/notes/${note.id}`);
      setEditingNote(response.data);
      setModalOpen(true);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load note for editing");
    }
  }

  async function handleUpdateNote(data) {
    try {
      await api.put(`/notes/${editingNote.id}`, data);
      setEditingNote(null);
      setModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update note");
    }
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
      fetchNotes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete note");
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingNote(null);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setEditingNote(null);
  }

  function handleCloseViewModal() {
    setViewModalOpen(false);
    setViewingNote(null);
  }

  function handleCloseDeleteModal() {
    if (deleteLoading) return;
    setDeleteModalOpen(false);
    setNoteToDelete(null);
  }

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return notes;

    return notes.filter((note) =>
      note.title.toLowerCase().includes(query)
    );
  }, [notes, search]);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Notes</h1>
            <p className="opacity-70">Your encrypted notes stored securely</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search by title..."
              className="input input-bordered w-full sm:w-72"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="btn btn-primary" onClick={handleOpenCreate}>
              Create Note
            </button>
          </div>
        </div>

        {pageError && <div className="alert alert-error mb-4">{pageError}</div>}

        <div className="stats shadow bg-base-200 border border-base-300 mb-6 w-full">
          <div className="stat">
            <div className="stat-title">Total Notes</div>
            <div className="stat-value text-primary">{notes.length}</div>
            <div className="stat-desc">
              {search ? `${filteredNotes.length} shown after filtering` : "All stored notes"}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">
                {notes.length === 0 ? "No notes yet" : "No matching notes"}
              </h2>
              <p>
                {notes.length === 0
                  ? "Create your first secure note to get started."
                  : "Try a different search term."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onView={handleViewNote}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      <NoteFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
        initialData={editingNote}
      />

      <ViewNoteModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        note={viewingNote}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        noteTitle={noteToDelete?.title}
        loading={deleteLoading}
      />
    </div>
  );
}

export default NotesPage;
