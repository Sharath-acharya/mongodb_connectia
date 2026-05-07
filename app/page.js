"use client";
import { useEffect, useState } from "react";

const AVATAR_COLORS = ["#667eea","#764ba2","#f093fb","#4facfe","#43e97b","#fa709a","#fee140","#a18cd1"];
const getColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const getInitials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) : "?";

const emptyForm = { name: "", email: "", age: "" };

export default function Home() {
  const [students, setStudents] = useState([]);
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");

  const fetchStudents = async () => {
    const res  = await fetch("/api/users");
    const data = await res.json();
    setStudents(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchStudents(); }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditId(s._id);
    setForm({ name: s.name, email: s.email, age: s.age || "" });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = editId ? "PUT" : "POST";
    const url    = editId ? `/api/users/${editId}` : "/api/users";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age) }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Something went wrong");
    } else {
      closeModal();
      fetchStudents();
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchStudents();
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">

      {/* Header */}
      <div className="header">
        <div>
          <h1>🎓 Student Dashboard</h1>
          <p>Manage student records with ease</p>
        </div>
        <button className="btn btn-ghost" onClick={openAdd} style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
          + Add Student
        </button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div className="label">Total Students</div>
          <div className="value">{students.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#48bb78" }}>
          <div className="label">Search Results</div>
          <div className="value">{filtered.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: "#ed8936" }}>
          <div className="label">Avg Age</div>
          <div className="value">
            {students.length
              ? Math.round(students.reduce((a, s) => a + (s.age || 0), 0) / students.length) || "—"
              : "—"}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="card">
        <div className="card-header">
          <h2>All Students</h2>
          <input
            className="search-input"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Email</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <p>{search ? "No students match your search." : "No students yet. Add one to get started."}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: "#a0aec0", fontWeight: 600 }}>{i + 1}</td>
                    <td>
                      <div className="name-cell">
                        <div className="avatar" style={{ background: getColor(s.name) }}>
                          {getInitials(s.name)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#4a5568" }}>{s.email}</td>
                    <td>
                      {s.age ? (
                        <span className="badge badge-blue">{s.age} yrs</span>
                      ) : "—"}
                    </td>
                    <td><span className="badge badge-green">Active</span></td>
                    <td>
                      <button className="btn btn-warning btn-sm" onClick={() => openEdit(s)} style={{ marginRight: 6 }}>
                        ✏️ Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editId ? "✏️ Edit Student" : "➕ Add New Student"}</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  placeholder="e.g. 20"
                  min="1" max="100"
                  value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : editId ? "Update Student" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
