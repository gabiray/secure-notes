import { useNavigate } from "react-router-dom";
import { clearAuth, getUser, isAuthenticated } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="navbar bg-base-200 border-b border-base-300 px-4">
      <div className="flex-1">
        <button
          className="btn btn-ghost text-xl"
          onClick={() => navigate("/notes")}
        >
          Secure Notes
        </button>
      </div>

      <div className="flex-none gap-2">
        {isAuthenticated() && (
          <>
            <span className="hidden sm:inline text-sm opacity-80">
              {user?.username}
            </span>
            <button className="btn btn-sm btn-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
