"use client";
import { useEffect, useState } from "react";

const emptyForm = { name: "", email: "", age: "" };

export default function Home() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/users/${editId}` : "/api/users";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, age: Number(form.age) }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    } else {
      setForm(emptyForm);
      setEditId(null);
      fetchUsers();
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditId(user._id);
    setForm({ name: user.name, email: user.email, age: user.age || "" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
    setError("");
  };

  return (
    <main>
      <h1>User CRUD App</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>{editId ? "Edit User" : "Add User"}</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          style={styles.input}
          placeholder="Age"
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Saving..." : editId ? "Update" : "Create"}
          </button>
          {editId && (
            <button style={{ ...styles.btn, background: "#888" }} type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Users Table */}
      <h2>Users ({users.length})</h2>
      {users.length === 0 ? (
        <p>No users yet. Add one above.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Age</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.age || "-"}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(user)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const styles = {
  form: { background: "#f5f5f5", padding: "1.5rem", borderRadius: 8, marginBottom: "2rem" },
  input: { display: "block", width: "100%", padding: "0.5rem", marginBottom: "0.75rem", fontSize: 16, borderRadius: 4, border: "1px solid #ccc", boxSizing: "border-box" },
  btn: { padding: "0.5rem 1.5rem", background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 16 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "0.75rem", borderBottom: "2px solid #ddd", background: "#f0f0f0" },
  td: { padding: "0.75rem", borderBottom: "1px solid #eee" },
  editBtn: { marginRight: 8, padding: "0.3rem 0.8rem", background: "#f0a500", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" },
  deleteBtn: { padding: "0.3rem 0.8rem", background: "#e00", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" },
};
