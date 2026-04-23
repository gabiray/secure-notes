import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiSave, FiShield, FiX } from "react-icons/fi";
import Toast from "../components/Toast";
import api from "../services/api";

function CreateNotePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notePassword, setNotePassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleSave() {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    const cleanPassword = notePassword.trim();

    if (!cleanTitle || !cleanContent) return;

    try {
      setSaving(true);
      await api.post("/notes/", {
        title: cleanTitle,
        content: cleanContent,
        note_password: showPasswordField ? cleanPassword : "",
      });
      navigate("/notes");
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || "Failed to save note",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="max-w-[900px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-[30px] sm:text-[34px] font-semibold leading-none tracking-tight">
              Create Note
            </h1>

            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm">
              <FiLock className="text-[14px]" />
              <span>This note will be encrypted before saving</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => navigate("/notes")}
              className="h-10 px-5 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <FiX className="text-[15px]" />
              <span>Cancel</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !title.trim() || !content.trim()}
              className="h-10 px-5 rounded-xl bg-white text-black hover:bg-white/90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiSave className="text-[15px]" />
              <span>{saving ? "Saving..." : "Save Note"}</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090a0d] p-4 sm:p-6">
          <div className="mb-5">
            <label className="block text-sm font-medium text-white mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter note title..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 outline-none text-base placeholder:text-white/30 focus:border-white/20"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <button
              type="button"
              onClick={() => setShowPasswordField((prev) => !prev)}
              className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-medium flex items-center gap-2"
            >
              <FiShield className="text-[15px]" />
              <span>{showPasswordField ? "Remove Password Field" : "Add Password"}</span>
            </button>
          </div>

          {showPasswordField && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-white mb-2">
                Note Password
              </label>
              <input
                type="password"
                placeholder="Set a password for this note"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-4 outline-none text-base placeholder:text-white/30 focus:border-white/20"
                value={notePassword}
                onChange={(e) => setNotePassword(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content
            </label>
            <textarea
              placeholder="Start writing your note..."
              className="w-full min-h-[260px] sm:min-h-[320px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 outline-none text-sm leading-7 placeholder:text-white/30 resize-none focus:border-white/20"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <p className="mt-4 text-xs text-white/40">
            Tip: You can add a password to your notes for extra security.
          </p>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default CreateNotePage;
