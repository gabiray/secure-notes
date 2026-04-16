import { useEffect, useState } from "react";
import { FiLock, FiX } from "react-icons/fi";

function UnlockNoteModal({ isOpen, onClose, onUnlock, loading, error, noteTitle }) {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#090a0d] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FiLock className="text-amber-300 text-[20px]" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Unlock Note</h3>
              <p className="text-xs text-white/45 mt-1">{noteTitle}</p>
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
          <p className="text-sm text-white/65 mb-4">
            This note is password protected. Enter the note password to continue.
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <input
            type="password"
            placeholder="Enter note password"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 outline-none text-sm placeholder:text-white/30 focus:border-white/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={() => onUnlock(password)}
              disabled={loading || !password.trim()}
              className="h-11 rounded-xl bg-white text-black hover:bg-white/90 transition text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Unlocking..." : "Unlock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnlockNoteModal;
