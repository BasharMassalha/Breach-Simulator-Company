import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../state/auth/AuthProvider";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: 16 }}>
      <div className="card">
        <div className="card-body">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <strong>Breach Simulator Company</strong>
          <Link to="/">Home</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/tickets">Tickets</Link>
          <Link to="/documents">Documents</Link>
          {user?.role === "admin" && <Link to="/admin/users">Admin Users</Link>}
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span className="muted">
            {user?.email} ({user?.role})
          </span>
          <button onClick={logout} style={{ padding: "6px 10px" }}>
            Log out
          </button>
        </div>
      </div>

          <hr style={{ margin: "16px 0", borderColor: "rgba(255,255,255,0.10)" }} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}

