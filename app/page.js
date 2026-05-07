"use client";
import { useEffect, useState, useCallback } from "react";

/* ── helpers ── */
const COLORS = ["#667eea","#764ba2","#f093fb","#4facfe","#43e97b","#fa709a","#f6ad55","#a18cd1"];
const avatarColor = (name) => COLORS[(name?.charCodeAt(0) || 0) % COLORS.length];
const initials    = (name) => (name || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const EMPTY_FORM = { name: "", email: "", age: "", course: "", phone: "" };

/* ── Toast ── */
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

export default function Home() {
  const [students, setStudents] = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editId,   setEditId]   = useState(null);
  const [modal,    setModal]    = useState(null); // "add" | "edit" | "delete"
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState(null);

  /* ── fetch all ── */
  const fetchStudents = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await fetch("/api/users");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load students", "error");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  /* ── open modals ── */
  const openAdd = () => {
    setForm(EMPTY_FORM); setEditId(null); setError(""); setModal("add");
  };
  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email, age: s.age || "", course: s.course || "", phone: s.phone || "" });
    setEditId(s._id); setError(""); setModal("edit");
  };
  const openDelete = (s) => { setDeleteTarget(s); setModal("delete"); };
  const closeModal = () => { setModal(null); setError(""); setDeleteTarget(null); };

  /* ── CREATE ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create"); return; }
      closeModal();
      fetchStudents();
      showToast(`✅ ${data.name} added successfully`);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  /* ── UPDATE ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/users/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update"); return; }
      closeModal();
      fetchStudents();
      showToast(`✏️ ${data.name} updated successfully`);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  /* ── DELETE ── */
  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/users/${deleteTarget._id}`, { method: "DELETE" });
      closeModal();
      fetchStudents();
      showToast(`🗑️ ${deleteTarget.name} deleted`, "error");
    } catch { showToast("Delete failed", "error"); }
    finally { setLoading(false); }
  };

  /* ── filtered list ── */
  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.course?.toLowerCase().includes(search.toLowerCase())
  );

  const avgAge = students.length
    ? Math.round(students.filter(s => s.age).reduce((a, s) => a + s.age, 0) / students.filter(s => s.age).length) || "—"
    : "—";

  return (
    <div className="container">

      {/* ── Header ── */}
      <div className="header">
        <div>
          <h1>🎓 Student Dashboard</h1>
          <p>Full CRUD — Create, Read, Update, Delete student records</p>
        </div>
        <button className="btn btn-header" onClick={openAdd}>+ Add Student</button>
      </div>

      {/* ── Stats ── */}
      <div className="stats">
        <div className="stat-card">
          <div className="label">Total Students</div>
          <div className="value">{students.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#48bb78" }}>
          <div className="label">Showing</div>
          <div className="value">{filtered.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#ed8936" }}>
          <div className="label">Avg Age</div>
          <div className="value">{avgAge}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#f093fb" }}>
          <div className="label">Courses</div>
          <div className="value">{new Set(students.map(s => s.course).filter(Boolean)).size}</div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        <div className="card-header">
          <h2>All Students</h2>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              placeholder="Search name, email, course..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          {fetching ? (
            <div className="empty"><p>Loading students...</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Course</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p>{search ? "No students match your search." : "No students yet. Click '+ Add Student' to get started."}</p>
                    </div>
                  </td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: "#a0aec0", fontWeight: 600 }}>{i + 1}</td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar" style={{ background: avatarColor(s.name) }}>{initials(s.name)}</div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#4a5568" }}>{s.email}</td>
                    <td>{s.age ? <span className="badge badge-blue">{s.age} yrs</span> : "—"}</td>
                    <td>{s.course ? <span className="badge badge-purple">{s.course}</span> : "—"}</td>
                    <td style={{ color: "#4a5568" }}>{s.phone || "—"}</td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(s)} style={{ marginRight: 6 }}>✏️ Edit</button>
                      <button className="btn btn-danger  btn-sm" onClick={() => openDelete(s)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ADD Modal ── */}
      {modal === "add" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">➕ Add New Student</div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" placeholder="20" min="1" max="100" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Course</label>
                <input placeholder="e.g. Computer Science" value={form.course} onChange={e => setForm({...form, course: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Add Student"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT Modal ── */}
      {modal === "edit" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">✏️ Edit Student</div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" placeholder="20" min="1" max="100" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="+91 9876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Course</label>
                <input placeholder="e.g. Computer Science" value={form.course} onChange={e => setForm({...form, course: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Student"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE Confirm Modal ── */}
      {modal === "delete" && deleteTarget && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🗑️ Delete Student</div>
            <div className="confirm-box">
              <p>Are you sure you want to delete <strong>{deleteTarget.name}</strong>?<br/>This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Yes, Delete"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  );
}
