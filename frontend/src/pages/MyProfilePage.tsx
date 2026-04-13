import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../api/http";
import type { HttpError } from "../api/http";
import { useAuth } from "../state/auth/AuthProvider";

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

export default function MyProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const res = await apiFetch<{ profile: Profile }>("/api/profiles/me", { token });
        setProfile(res.profile);
        setFullName(res.profile.full_name ?? "");
        setTitle(res.profile.title ?? "");
        setDepartment(res.profile.department ?? "");
        setPhone(res.profile.phone ?? "");
        setLocation(res.profile.location ?? "");
      } catch (e) {
        const err = e as HttpError;
        setError(
          (typeof err?.body === "object" && err?.body && "message" in err.body && String((err.body as any).message)) ||
            "Failed to load profile"
        );
      }
    })();
  }, [token]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const body: any = {
        full_name: fullName,
        title: title || null,
        department: department || null,
        phone: phone || null,
        location: location || null,
      };
      const res = await apiFetch<{ profile: Profile }>("/api/profiles/me", {
        method: "PATCH",
        token,
        body,
      });
      setProfile(res.profile);
    } catch (e) {
      const err = e as HttpError;
      setError(
        (typeof err?.body === "object" && err?.body && "message" in err.body && String((err.body as any).message)) ||
          "Failed to save profile"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>My Profile</h2>
      {error && <div style={{ background: "#2a1111", border: "1px solid #7a2b2b", padding: 10 }}>{error}</div>}

      {!profile ? (
        <div style={{ padding: 8 }}>Loading…</div>
      ) : (
        <form onSubmit={onSave} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Full name</div>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Title</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Department</div>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Phone</div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </label>
          <label>
            <div style={{ fontSize: 14, marginBottom: 6 }}>Location</div>
            <input value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%", padding: 10 }} />
          </label>

          <button type="submit" disabled={isSaving} style={{ padding: 10, width: 140 }}>
            {isSaving ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </div>
  );
}

