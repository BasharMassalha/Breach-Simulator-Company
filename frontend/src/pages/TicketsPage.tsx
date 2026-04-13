import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../api/http";
import type { HttpError } from "../api/http";
import { useAuth } from "../state/auth/AuthProvider";

type Ticket = {
  id: string;
  created_by: string;
  assigned_to: string | null;
  status: "open" | "in_progress" | "closed";
  priority: "low" | "medium" | "high";
  subject: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export default function TicketsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => tickets.find((t) => t.id === selectedId) ?? null, [tickets, selectedId]);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // Patch form (works for both, with admin extras)
  const [patchSubject, setPatchSubject] = useState("");
  const [patchDescription, setPatchDescription] = useState("");
  const [patchStatus, setPatchStatus] = useState<Ticket["status"]>("open");
  const [patchPriority, setPatchPriority] = useState<Ticket["priority"]>("medium");
  const [patchAssignedTo, setPatchAssignedTo] = useState<string>("");

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ tickets: Ticket[] }>("/api/tickets", { token });
      setTickets(res.tickets);
      if (res.tickets.length && !selectedId) setSelectedId(res.tickets[0].id);
    } catch (e) {
      const err = e as HttpError;
      setError(
        (typeof err?.body === "object" && err?.body && "message" in err.body && String((err.body as any).message)) ||
          "Failed to load tickets"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (!selected) return;
    setPatchSubject(selected.subject);
    setPatchDescription(selected.description);
    setPatchStatus(selected.status);
    setPatchPriority(selected.priority);
    setPatchAssignedTo(selected.assigned_to ?? "");
  }, [selected?.id]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiFetch<{ ticket: Ticket }>("/api/tickets", {
        method: "POST",
        token,
        body: { subject, description, priority },
      });
      setSubject("");
      setDescription("");
      setPriority("medium");
      setTickets((prev) => [res.ticket, ...prev]);
      setSelectedId(res.ticket.id);
    } catch (e) {
      const err = e as HttpError;
      setError(
        (typeof err?.body === "object" && err?.body && "message" in err.body && String((err.body as any).message)) ||
          "Failed to create ticket"
      );
    }
  }

  async function onPatch(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      const body: any = {
        subject: patchSubject,
        description: patchDescription,
      };
      if (isAdmin) {
        body.status = patchStatus;
        body.priority = patchPriority;
        body.assigned_to = patchAssignedTo ? patchAssignedTo : null;
      }

      const res = await apiFetch<{ ticket: Ticket }>(`/api/tickets/${selected.id}`, {
        method: "PATCH",
        token,
        body,
      });

      setTickets((prev) => prev.map((t) => (t.id === selected.id ? res.ticket : t)));
    } catch (e) {
      const err = e as HttpError;
      setError(
        (typeof err?.body === "object" && err?.body && "message" in err.body && String((err.body as any).message)) ||
          "Failed to update ticket"
      );
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h2 style={{ marginTop: 0 }}>Tickets</h2>
        <button onClick={load} disabled={isLoading} style={{ padding: "6px 10px" }}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div style={{ background: "#2a1111", border: "1px solid #7a2b2b", padding: 10 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16, marginTop: 16 }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Create ticket</h3>
          <form onSubmit={onCreate} style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ padding: 10 }}
              required
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ padding: 10, minHeight: 100 }}
              required
            />
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 14 }}>Priority</span>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} style={{ padding: 10 }}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </label>
            <button style={{ padding: 10, width: 160 }} type="submit">
              Create
            </button>
          </form>

          <h3 style={{ marginTop: 24 }}>List</h3>
          <div style={{ border: "1px solid #333", borderRadius: 6, overflow: "hidden" }}>
            {tickets.length === 0 ? (
              <div style={{ padding: 10, opacity: 0.8 }}>No tickets yet.</div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  style={{
                    padding: 10,
                    cursor: "pointer",
                    background: t.id === selectedId ? "#1b1b1b" : "transparent",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{t.subject}</strong>
                    <span style={{ opacity: 0.8 }}>
                      {t.status} / {t.priority}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(t.created_at).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Selected ticket</h3>
          {!selected ? (
            <div style={{ padding: 10, opacity: 0.8 }}>Select a ticket.</div>
          ) : (
            <form onSubmit={onPatch} style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.75 }}>ID: {selected.id}</div>
              <input value={patchSubject} onChange={(e) => setPatchSubject(e.target.value)} style={{ padding: 10 }} />
              <textarea
                value={patchDescription}
                onChange={(e) => setPatchDescription(e.target.value)}
                style={{ padding: 10, minHeight: 140 }}
              />

              {isAdmin && (
                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>Status</span>
                    <select value={patchStatus} onChange={(e) => setPatchStatus(e.target.value as any)} style={{ padding: 10 }}>
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="closed">closed</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>Priority</span>
                    <select
                      value={patchPriority}
                      onChange={(e) => setPatchPriority(e.target.value as any)}
                      style={{ padding: 10 }}
                    >
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: 14 }}>Assigned to (user id or empty)</span>
                    <input
                      value={patchAssignedTo}
                      onChange={(e) => setPatchAssignedTo(e.target.value)}
                      placeholder="uuid"
                      style={{ padding: 10 }}
                    />
                  </label>
                </div>
              )}

              <button style={{ padding: 10, width: 160 }} type="submit">
                Update
              </button>
              {!isAdmin && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  Employees can update only <code>subject</code> and <code>description</code>.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

