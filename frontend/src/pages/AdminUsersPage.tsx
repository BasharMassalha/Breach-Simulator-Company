import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../api/http";
import type { HttpError } from "../api/http";
import { useAuth } from "../state/auth/AuthProvider";

type UserRow = {
  id: string;
  email: string;
  role: "admin" | "employee";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type Profile = {
  user_id: string;
  full_name: string;
  title: string | null;
  department: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

function formatApiError(err: HttpError, fallback: string): string {
  const b = err.body as { message?: unknown; issues?: Array<{ path?: unknown; message?: unknown }> } | null | undefined;
  if (b?.issues && Array.isArray(b.issues) && b.issues.length > 0) {
    return b.issues
      .map((i) => {
        const path = Array.isArray(i.path) ? (i.path as unknown[]).join(".") : "request";
        return `${path}: ${String(i.message ?? "invalid")}`;
      })
      .join(" · ");
  }
  if (b && typeof b.message === "string") return b.message;
  return fallback;
}

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => users.find((u) => u.id === selectedId) ?? null, [users, selectedId]);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "employee">("employee");
  const [isActive, setIsActive] = useState(true);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Patch profile for selected
  const [pFullName, setPFullName] = useState("");
  const [pTitle, setPTitle] = useState("");
  const [pDepartment, setPDepartment] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pLocation, setPLocation] = useState("");

  async function loadUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ users: UserRow[] }>("/api/admin/users", { token });
      setUsers(res.users);
      setSelectedId(res.users[0]?.id ?? null);
    } catch (e) {
      const err = e as HttpError;
      setError(formatApiError(err, "Failed to load users"));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadProfile(userId: string) {
    try {
      const res = await apiFetch<{ user: UserRow; profile: Profile }>(`/api/admin/profiles/${userId}`, { token });
      setProfile(res.profile);
      setPFullName(res.profile.full_name ?? "");
      setPTitle(res.profile.title ?? "");
      setPDepartment(res.profile.department ?? "");
      setPPhone(res.profile.phone ?? "");
      setPLocation(res.profile.location ?? "");
    } catch {
      setProfile(null);
    }
  }

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selectedId) return;
    void loadProfile(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const body: any = {
        email: email.trim(),
        password,
        role,
        is_active: Boolean(isActive),
        full_name: fullName.trim(),
        title: title.trim() ? title.trim() : null,
        department: department.trim() ? department.trim() : null,
        phone: phone.trim() ? phone.trim() : null,
        location: location.trim() ? location.trim() : null,
      };
      const res = await apiFetch<{ user: UserRow; profile: Profile }>("/api/admin/users", {
        method: "POST",
        token,
        body,
      });
      setUsers((prev) => [res.user, ...prev]);
      setSelectedId(res.user.id);
      setEmail("");
      setPassword("");
      setRole("employee");
      setIsActive(true);
      setFullName("");
      setTitle("");
      setDepartment("");
      setPhone("");
      setLocation("");
    } catch (e) {
      const err = e as HttpError;
      setError(formatApiError(err, "Failed to create user"));
    }
  }

  async function toggleActive(u: UserRow) {
    setError(null);
    try {
      const res = await apiFetch<{ user: UserRow }>(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        token,
        body: { is_active: !u.is_active },
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? res.user : x)));
    } catch (e) {
      const err = e as HttpError;
      setError(formatApiError(err, "Failed to update user"));
    }
  }

  async function changeRole(u: UserRow, nextRole: "admin" | "employee") {
    setError(null);
    try {
      const res = await apiFetch<{ user: UserRow }>(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        token,
        body: { role: nextRole },
      });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? res.user : x)));
    } catch (e) {
      const err = e as HttpError;
      setError(formatApiError(err, "Failed to update role"));
    }
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      const body: any = {
        full_name: pFullName,
        title: pTitle || null,
        department: pDepartment || null,
        phone: pPhone || null,
        location: pLocation || null,
      };
      const res = await apiFetch<{ user: UserRow; profile: Profile }>(`/api/admin/profiles/${selected.id}`, {
        method: "PATCH",
        token,
        body,
      });
      setProfile(res.profile);
    } catch (e) {
      const err = e as HttpError;
      setError(formatApiError(err, "Failed to update profile"));
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h2 style={{ marginTop: 0 }}>Admin Users</h2>
        <button onClick={loadUsers} disabled={isLoading} style={{ padding: "6px 10px" }}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16, marginTop: 16 }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Create user</h3>
          <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
            <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10 }} required />
            <input
              placeholder="password (>=8)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 10 }}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 14 }}>Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value as any)} style={{ padding: 10 }}>
                  <option value="employee">employee</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 14 }}>Active</span>
                <select value={String(isActive)} onChange={(e) => setIsActive(e.target.value === "true")} style={{ padding: 10 }}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>
            </div>
            <input
              placeholder="full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ padding: 10 }}
              required
            />
            <input placeholder="title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 10 }} />
            <input
              placeholder="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ padding: 10 }}
            />
            <input placeholder="phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: 10 }} />
            <input
              placeholder="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ padding: 10 }}
            />
            <button style={{ padding: 10, width: 160 }} type="submit">
              Create
            </button>
          </form>

          <h3 style={{ marginTop: 24 }}>Users</h3>
          <div style={{ border: "1px solid #333", borderRadius: 6, overflow: "hidden" }}>
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                style={{
                  padding: 10,
                  cursor: "pointer",
                  background: u.id === selectedId ? "#1b1b1b" : "transparent",
                  borderBottom: "1px solid #333",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{u.email}</strong>
                  <span style={{ opacity: 0.8 }}>
                    {u.role} • {String(u.is_active)}
                  </span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>ID: {u.id}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Selected user</h3>
          {!selected ? (
            <div style={{ padding: 10, opacity: 0.8 }}>Select a user.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                <div>ID: {selected.id}</div>
                <div>Email: {selected.email}</div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => toggleActive(selected)} style={{ padding: "6px 10px" }}>
                  {selected.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => changeRole(selected, selected.role === "admin" ? "employee" : "admin")}
                  style={{ padding: "6px 10px" }}
                >
                  Make {selected.role === "admin" ? "employee" : "admin"}
                </button>
              </div>

              <hr />
              <h4 style={{ margin: 0 }}>Profile (admin edit)</h4>
              {!profile ? (
                <div style={{ opacity: 0.8 }}>No profile loaded.</div>
              ) : (
                <form onSubmit={saveProfile} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                  <input value={pFullName} onChange={(e) => setPFullName(e.target.value)} style={{ padding: 10 }} />
                  <input value={pTitle} onChange={(e) => setPTitle(e.target.value)} style={{ padding: 10 }} placeholder="title" />
                  <input
                    value={pDepartment}
                    onChange={(e) => setPDepartment(e.target.value)}
                    style={{ padding: 10 }}
                    placeholder="department"
                  />
                  <input value={pPhone} onChange={(e) => setPPhone(e.target.value)} style={{ padding: 10 }} placeholder="phone" />
                  <input
                    value={pLocation}
                    onChange={(e) => setPLocation(e.target.value)}
                    style={{ padding: 10 }}
                    placeholder="location"
                  />
                  <button type="submit" style={{ padding: 10, width: 160 }}>
                    Save profile
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

