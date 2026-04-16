import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";

function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed top-5 right-5 z-[100]">
      <div
        className={[
          "min-w-[300px] max-w-[420px] rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur",
          isSuccess
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
            : "border-red-500/20 bg-red-500/10 text-red-200",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            {isSuccess ? (
              <FiCheckCircle className="text-[18px]" />
            ) : (
              <FiAlertCircle className="text-[18px]" />
            )}
          </div>

          <div className="flex-1 text-sm leading-6">{toast.message}</div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition"
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toast;
