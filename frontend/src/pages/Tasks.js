import React, { useEffect, useState } from "react";

function Tasks({ token, user }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", project: "", assignedTo: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAll = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        fetch("https://team-task-manager-production-e55f.up.railway.app/api/tasks", { headers: { Authorization: "Bearer " + token } }),
        fetch("https://team-task-manager-production-e55f.up.railway.app/api/projects", { headers: { Authorization: "Bearer " + token } }),
        fetch("https://team-task-manager-production-e55f.up.railway.app/api/auth/users", { headers: { Authorization: "Bearer " + token } })
      ]);
      const tasksData = await tasksRes.json();
      const projectsData = await projectsRes.json();
      const usersData = await usersRes.json();
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const createTask = async () => {
    if (!form.title) return setMsg("Task title is required");
    try {
      const res = await fetch("https://team-task-manager-production-e55f.up.railway.app/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Task created!");
        setForm({ title: "", description: "", project: "", assignedTo: "", deadline: "" });
        fetchAll();
      } else {
        setMsg(data.msg || "Error creating task");
      }
    } catch (err) { setMsg("Server error"); }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`https://team-task-manager-production-e55f.up.railway.app/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchAll();
      else {
        const data = await res.json();
        alert(data.msg || "Cannot update this task");
      }
    } catch (err) { alert("Server error"); }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await fetch(`https://team-task-manager-production-e55f.up.railway.app/api/tasks/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
    fetchAll();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "all") return true;
    if (filter === "mine") return t.assignedTo?._id === user.id;
    return t.status === filter;
  });

  const statusColor = { "todo": "#aaa", "in-progress": "#f77f00", "done": "#2ec4b6" };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading tasks...</div>;

  return (
    <div>
      <h2 style={styles.heading}>✅ Tasks</h2>

      {/* CREATE TASK — Admin only */}
      {user.role === "admin" && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Create New Task</h3>
          {msg && <div style={styles.msg}>{msg}</div>}
          <input style={styles.input} placeholder="Task Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <select style={styles.input} value={form.project} onChange={e => setForm({ ...form, project: e.target.value })}>
            <option value="">Select Project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <select style={styles.input} value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Assign To</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
          </select>
          <input style={styles.input} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <button style={styles.btn} onClick={createTask}>Create Task</button>
        </div>
      )}

      {/* FILTER BUTTONS */}
      <div style={styles.filterRow}>
        {["all", "mine", "todo", "in-progress", "done"].map(f => (
          <button key={f} style={filter === f ? styles.filterBtnActive : styles.filterBtn} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "mine" ? "My Tasks" : f}
          </button>
        ))}
      </div>

      {/* TASKS LIST */}
      {filteredTasks.length === 0 ? (
        <div style={styles.empty}>No tasks found.</div>
      ) : (
        filteredTasks.map(task => (
          <div key={task._id} style={styles.taskCard}>
            <div style={styles.taskHeader}>
              <h3 style={styles.taskTitle}>{task.title}</h3>
              <span style={{ ...styles.statusDot, background: statusColor[task.status] }}>{task.status}</span>
            </div>
            {task.description && <p style={styles.taskDesc}>{task.description}</p>}
            <div style={styles.taskMeta}>
              {task.project && <span>📁 {task.project.name}</span>}
              {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
              {task.deadline && <span>📅 {task.deadline.substring(0, 10)}</span>}
            </div>

            {/* STATUS UPDATE */}
            <div style={styles.actionRow}>
              <span style={styles.actionLabel}>Change status:</span>
              {["todo", "in-progress", "done"].map(s => (
                <button key={s} disabled={task.status === s}
                  style={{ ...styles.statusBtn, opacity: task.status === s ? 0.4 : 1, background: statusColor[s] }}
                  onClick={() => updateStatus(task._id, s)}>{s}</button>
              ))}
              {user.role === "admin" && (
                <button style={styles.deleteBtn} onClick={() => deleteTask(task._id)}>🗑️ Delete</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  heading: { marginBottom: 24, color: "#1a1a2e" },
  formCard: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: 500 },
  formTitle: { marginBottom: 16, color: "#333" },
  input: { display: "block", width: "100%", padding: "10px 12px", marginBottom: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 },
  btn: { background: "#e94560", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  msg: { background: "#e0f0ff", color: "#005", padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13 },
  filterRow: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filterBtn: { background: "#fff", border: "1px solid #ddd", padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13 },
  filterBtnActive: { background: "#e94560", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13 },
  taskCard: { background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  taskTitle: { color: "#1a1a2e", margin: 0 },
  statusDot: { color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12 },
  taskDesc: { color: "#666", fontSize: 14, marginBottom: 10 },
  taskMeta: { display: "flex", gap: 16, fontSize: 13, color: "#888", marginBottom: 14, flexWrap: "wrap" },
  actionRow: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  actionLabel: { fontSize: 13, color: "#555" },
  statusBtn: { color: "#fff", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 },
  deleteBtn: { background: "#ffe0e0", color: "#c00", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, marginLeft: "auto" },
  empty: { textAlign: "center", color: "#aaa", padding: 40, background: "#fff", borderRadius: 12 }
};

export default Tasks;