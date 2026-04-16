import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiEdit2,
  FiLock,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import UnlockNoteModal from "../components/UnlockNoteModal";
import Toast from "../components/Toast";
import api from "../services/api";

function ViewNotePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const editModeFromUrl = searchParams.get("mode") === "edit";

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(editModeFromUrl);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchNote();
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchNote() {
    try {
      setLoading(true);
      const response = await api.get(`/notes/${id}`);
      const data = response.data;

      if (data.locked) {
        setNote(data);
        setUnlockModalOpen(true);
        return;
      }

      setNote(data);
      setTitle(data.title);
      setContent(data.content);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Failed to load note",
      });
      navigate("/notes");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(password) {
    try {
      setUnlockLoading(true);
      setUnlockError("");

      const response = await api.post(`/notes/${id}/unlock`, { password });
      const data = response.data;

      setNote(data);
      setTitle(data.title);
      setContent(data.content);
      setUnlockModalOpen(false);
    } catch (err) {
      setUnlockError(err.response?.data?.error || "Failed to unlock note");
    } finally {
      setUnlockLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;

    try {
      setSaving(true);
      await api.put(`/notes/${id}`, {
        title: title.trim(),
        content: content.trim(),
      });

      await fetchNote();
      setIsEditing(false);
      navigate(`/notes/${id}`);
      setToast({ type: "success", message: "Note updated successfully." });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Failed to update note",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setDeleteLoading(true);
      await api.delete(`/notes/${id}`);
      navigate("/notes");
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Failed to delete note",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto">
        <div className="h-10 w-40 bg-white/5 rounded-xl animate-pulse mb-6" />
        <div className="h-[420px] sm:h-[500px] rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse" />
      </div>
    );
  }

  if (!note) return null;

  const isLocked = note.locked;

  return (
    <>
      <div className="max-w-[900px] mx-auto">
        <div className="flex flex-col gap-4 sm:gap-5 mb-7">
          <div>
            <button
              onClick={() => navigate("/notes")}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
            >
              <FiArrowLeft className="text-sm" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          {!isLocked && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setTitle(note.title);
                      setContent(note.content);
                      navigate(`/notes/${id}`);
                    }}
                    className="h-10 px-5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <FiX className="text-[15px]" />
                    <span>Cancel</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={saving || !title.trim() || !content.trim()}
                    className="h-10 px-5 rounded-xl bg-white text-black hover:bg-white/90 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <FiSave className="text-[15px]" />
                    <span>{saving ? "Saving..." : "Save Note"}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      navigate(`/notes/${id}?mode=edit`);
                    }}
                    className="h-10 px-5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <FiEdit2 className="text-[15px]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="h-10 px-5 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 transition text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <FiTrash2 className="text-[15px]" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090a0d] overflow-hidden">
          <div className="p-5 sm:p-7 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    className="w-full bg-transparent text-[22px] sm:text-[26px] md:text-[28px] font-semibold leading-tight outline-none border-none p-0"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                ) : (
                  <h1 className="text-[24px] sm:text-[28px] md:text-[30px] font-bold leading-tight break-words">
                    {note.title}
                  </h1>
                )}

                <div className="mt-4 space-y-2 text-sm text-white/50">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-[14px] shrink-0" />
                    <span className="break-words">
                      Created {new Date(note.created_at).toLocaleString("ro-RO")}
                    </span>
                  </div>

                  {note.updated_at && (
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-[14px] shrink-0" />
                      <span className="break-words">
                        Updated {new Date(note.updated_at).toLocaleString("ro-RO")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`shrink-0 rounded-full px-4 h-9 inline-flex items-center gap-2 text-sm font-medium self-start ${
                  note.is_password_protected
                    ? "bg-amber-500/10 text-amber-300"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <FiLock className="text-[14px]" />
                <span>{note.is_password_protected ? "Locked" : "Encrypted"}</span>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {isLocked ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <FiLock className="text-amber-300 text-[20px]" />
                </div>
                <h2 className="text-lg font-semibold">This note is locked</h2>
                <p className="text-white/55 mt-2 text-sm sm:text-base">
                  Enter the note password to view its content.
                </p>
                <button
                  onClick={() => setUnlockModalOpen(true)}
                  className="mt-5 h-10 px-5 rounded-xl bg-white text-black hover:bg-white/90 transition text-sm font-medium w-full sm:w-auto"
                >
                  Unlock Note
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <FiLock className="text-white/75 text-[15px]" />
                    </div>

                    <div>
                      <p className="text-sm font-medium">Decrypted Content</p>
                      <p className="text-xs text-white/45 mt-1 leading-5">
                        This note is stored encrypted and has been decrypted for viewing.
                      </p>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    className="w-full min-h-[260px] sm:min-h-[320px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none text-sm leading-7 resize-none focus:border-white/20"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                ) : (
                  <div className="whitespace-pre-wrap break-words text-sm leading-7 sm:leading-8 text-white/90">
                    {content}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (deleteLoading) return;
          setDeleteModalOpen(false);
        }}
        onConfirm={handleDelete}
        noteTitle={note?.title}
        loading={deleteLoading}
      />

      <UnlockNoteModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onUnlock={handleUnlock}
        loading={unlockLoading}
        error={unlockError}
        noteTitle={note?.title}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default ViewNotePage;
