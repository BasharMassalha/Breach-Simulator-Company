import { useEffect, useState } from "react";
import { apiFetch } from "../api/http";
import type { HttpError } from "../api/http";
import { useAuth } from "../state/auth/AuthProvider";

type Document = {
  id: string;
  owner_user_id: string | null;
  name: string;
  category: string;
  sensitivity: "public" | "internal" | "confidential";
  created_at: string;
  updated_at: string;
};

export default function DocumentsPage() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Document | null>(null);

  const [category, setCategory] = useState("");
  const [sensitivity, setSensitivity] = useState("");
  const [ownerUserId, setOwnerUserId] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadList() {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (category) qs.set("category", category);
      if (sensitivity) qs.set("sensitivity", sensitivity);
      if (ownerUserId) qs.set("owner_user_id", ownerUserId);
      if (name) qs.set("name", name);
      const url = `/api/documents${qs.toString() ? `?${qs.toString()}` : ""}`;
      const res = await apiFetch<{ documents: Document[] }>(url, { token });
      setDocuments(res.documents);
      setSelectedId(res.documents[0]?.id ?? null);
    } catch (e) {
      const err = e as HttpError;
      setError(
        (typeof err?.body === "object" && err?.body && "message" in err.body && String((err.body as any).message)) ||
          "Failed to load documents"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    (async () => {
      if (!selectedId) {
        setSelected(null);
        return;
      }
      try {
        const res = await apiFetch<{ document: Document }>(`/api/documents/${selectedId}`, { token });
        setSelected(res.document);
      } catch {
        setSelected(null);
      }
    })();
  }, [selectedId, token]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
        <h2 style={{ marginTop: 0 }}>Documents (metadata)</h2>
        <button onClick={loadList} disabled={isLoading} style={{ padding: "6px 10px" }}>
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, marginTop: -8 }}>
        {isAdmin
          ? "Admin: you can see all documents."
          : "Employee: you can see public/internal docs, plus confidential docs you own."}
      </div>

      {error && <div style={{ background: "#2a1111", border: "1px solid #7a2b2b", padding: 10 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 16, marginTop: 16 }}>
        <div>
          <h3 style={{ marginTop: 0 }}>Filters</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <input placeholder="category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 10 }} />
            <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} style={{ padding: 10 }}>
              <option value="">(any sensitivity)</option>
              <option value="public">public</option>
              <option value="internal">internal</option>
              <option value="confidential">confidential</option>
            </select>
            <input
              placeholder="owner_user_id (uuid)"
              value={ownerUserId}
              onChange={(e) => setOwnerUserId(e.target.value)}
              style={{ padding: 10 }}
            />
            <input placeholder="name contains..." value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10 }} />
            <button onClick={loadList} style={{ padding: 10, width: 140 }}>
              Apply
            </button>
          </div>

          <h3 style={{ marginTop: 24 }}>List</h3>
          <div style={{ border: "1px solid #333", borderRadius: 6, overflow: "hidden" }}>
            {documents.length === 0 ? (
              <div style={{ padding: 10, opacity: 0.8 }}>No documents (or none accessible).</div>
            ) : (
              documents.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  style={{
                    padding: 10,
                    cursor: "pointer",
                    background: d.id === selectedId ? "#1b1b1b" : "transparent",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong>{d.name}</strong>
                    <span style={{ opacity: 0.8 }}>{d.sensitivity}</span>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {d.category} • {new Date(d.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Selected document</h3>
          {!selected ? (
            <div style={{ padding: 10, opacity: 0.8 }}>Select a document.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <div>
                <strong>Name:</strong> {selected.name}
              </div>
              <div>
                <strong>Category:</strong> {selected.category}
              </div>
              <div>
                <strong>Sensitivity:</strong> {selected.sensitivity}
              </div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                <div>ID: {selected.id}</div>
                <div>Owner: {selected.owner_user_id ?? "(none)"}</div>
                <div>Created: {new Date(selected.created_at).toLocaleString()}</div>
                <div>Updated: {new Date(selected.updated_at).toLocaleString()}</div>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Note: this app stores document <em>metadata only</em> in Phase 1 (no file uploads yet).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

