import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { HttpError } from "../api/http";
import { useAuth } from "../state/auth/AuthProvider";

export default function LoginPage() {
  const nav = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) nav("/", { replace: true });
  }, [user, nav]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (e) {
      const err = e as HttpError;
      const msg =
        (typeof err?.body === "object" && err?.body && "message" in err.body && (err.body as any).message) ||
        "Login failed";
      setError(String(msg));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "64px auto", padding: 16 }}>
      <div className="card">
        <div className="card-body">
          <h1 style={{ marginBottom: 8, fontSize: 28 }}>Breach Simulator Company</h1>
          <p className="muted">Sign in to the internal portal.</p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 18 }}>
            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }} className="muted">
                Email
              </div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" required />
            </label>

            <label>
              <div style={{ fontSize: 14, marginBottom: 6 }} className="muted">
                Password
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="alert">{error}</div>}

            <button className="btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

