import React, { useEffect, useState } from "react";

function Projects({ token, user }) {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchProjects = async () => {
    const res = await fetch("https://team-task-manager-production-e55f.up.railway.app/api/projects", { headers: { Authorization: "Bearer " + token } });
    const data = await res.json();
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch("https://team-task-manager-production-e55f.up.railway.app/api/auth/users", { headers: { Authorization: "Bearer " + token } });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchProjects(); fetchUsers(); }, []);

  const createProject = async () => {
    if (!form.name) return setMsg("Project name is required");
    try {
      const res = await fetch("https://team-task-manager-production-e55f.up.railway.app/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Project created!");
        setForm({ name: "", description: "", members: [] });
        fetchProjects();
      } else {
        setMsg(data.msg || "Error");
      }
    } catch (err) {
      setMsg("Server error");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await fetch(`https://team-task-manager-production-e55f.up.railway.app/api/projects/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    fetchProjects();
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <h2 style={styles.heading}>📁 Projects</h2>

      {/* CREATE PROJECT FORM — Admin only */}
      {user.role === "admin" && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Project</h3>
          {msg && <div style={styles.msg}>{msg}</div>}
          <input style={styles.input} placeholder="Project Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label style={styles.label}>Add Members:</label>
          <select multiple style={{ ...styles.input, height: 100 }}
            onChange={e => setForm({ ...form, members: Array.from(e.target.selectedOptions).map(o => o.value) })}>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
          <small style={styles.hint}>Hold Ctrl/Cmd to select multiple members</small>
          <button style={styles.btn} onClick={createProject}>Create Project</button>
        </div>
      )}

      {/* PROJECTS LIST */}
      <div style={styles.grid}>
        {projects.length === 0 ? (
          <p style={styles.empty}>No projects yet.</p>
        ) : (
          projects.map(project => (
            <div key={project._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                {user.role === "admin" && (
                  <button style={styles.deleteBtn} onClick={() => deleteProject(project._id)}>🗑️</button>
                )}
              </div>
              {project.description && <p style={styles.cardDesc}>{project.description}</p>}
              <div style={styles.memberRow}>
                <span style={styles.memberLabel}>👥 Members:</span>
                {project.members?.length > 0
                  ? project.members.map(m => <span key={m._id} style={styles.memberBadge}>{m.name}</span>)
                  : <span style={styles.noMembers}>None assigned</span>}
              </div>
              {project.createdBy && <div style={styles.createdBy}>Created by: {project.createdBy.name}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  heading: { marginBottom: 24, color: "#1a1a2e" },
  formCard: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: 500 },
  formTitle: { marginBottom: 16, color: "#333" },
  input: { display: "block", width: "100%", padding: "10px 12px", marginBottom: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 },
  label: { display: "block", fontSize: 13, color: "#555", marginBottom: 4 },
  hint: { color: "#aaa", fontSize: 12, display: "block", marginBottom: 12 },
  btn: { background: "#e94560", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  msg: { background: "#e0f0ff", color: "#005", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardTitle: { color: "#1a1a2e", margin: 0 },
  cardDesc: { color: "#666", fontSize: 14, marginBottom: 12 },
  memberRow: { display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 10 },
  memberLabel: { fontSize: 13, color: "#555" },
  memberBadge: { background: "#e8f4fd", color: "#1a73e8", padding: "2px 10px", borderRadius: 20, fontSize: 12 },
  noMembers: { color: "#aaa", fontSize: 13 },
  createdBy: { fontSize: 12, color: "#aaa", marginTop: 6 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18 },
  empty: { color: "#aaa", textAlign: "center", padding: 40, gridColumn: "1/-1" }
};

export default Projects;