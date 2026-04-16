import { FiCalendar, FiEdit2, FiEye, FiLock, FiTrash2 } from "react-icons/fi";

function NoteCard({ note, onView, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#090a0d] p-4 sm:p-5 transition hover:border-white/20 hover:bg-[#0c0d11]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base sm:text-md font-semibold text-white leading-snug break-words">
          {note.title}
        </h3>

        <div
          className={`h-7 px-2 rounded-md flex items-center justify-center gap-1 text-xs shrink-0 ${
            note.is_password_protected
              ? "bg-amber-500/10 text-amber-300"
              : "bg-emerald-500/10 text-emerald-400"
          }`}
        >
          <FiLock className="text-[12px]" />
          <span>{note.is_password_protected ? "Locked" : "Encrypted"}</span>
        </div>
      </div>

      <p className="text-sm leading-6 text-white/60 line-clamp-3 min-h-[72px] mt-3">
        {note.is_password_protected
          ? "This note is password protected. Preview hidden."
          : note.content_preview || "No preview available."}
      </p>

      <div className="mt-2 flex items-center gap-2 text-xs text-white/45">
        <FiCalendar className="text-[13px]" />
        <span>{new Date(note.created_at).toLocaleString("ro-RO")}</span>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-2">
        <button
          onClick={() => onView(note)}
          className="h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-medium flex items-center justify-center gap-2"
        >
          <FiEye className="text-[13px]" />
          <span>View</span>
        </button>

        <button
          onClick={() => onEdit(note)}
          className="h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-medium flex items-center justify-center gap-2"
        >
          <FiEdit2 className="text-[13px]" />
          <span>Edit</span>
        </button>

        <button
          onClick={() => onDelete(note)}
          className="h-9 w-9 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition flex items-center justify-center text-red-400"
        >
          <FiTrash2 className="text-[15px]" />
        </button>
      </div>
    </div>
  );
}

export default NoteCard;
