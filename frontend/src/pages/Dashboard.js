import React, { useEffect, useState } from "react";

function Dashboard({ token, user }) {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          fetch("https://team-task-manager-production-e55f.up.railway.app/api/tasks/stats", { headers: { Authorization: "Bearer " + token } }),
          fetch("https://team-task-manager-production-e55f.up.railway.app/api/tasks", { headers: { Authorization: "Bearer " + token } })
        ]);
        const statsData = await statsRes.json();
        const tasksData = await tasksRes.json();
        setStats(statsData);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const overdueTasks = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "done");
  const myTasks = tasks.filter(t => t.assignedTo?._id === user.id || t.assignedTo === user.id);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div>
      <h2 style={styles.heading}>👋 Welcome back, {user.name}!</h2>

      {/* STAT CARDS */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, background: "#4361ee" }}>
          <div style={styles.statNum}>{stats?.total || 0}</div>
          <div style={styles.statLabel}>Total Tasks</div>
        </div>
        <div style={{ ...styles.statCard, background: "#2ec4b6" }}>
          <div style={styles.statNum}>{stats?.completed || 0}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={{ ...styles.statCard, background: "#f77f00" }}>
          <div style={styles.statNum}>{stats?.inProgress || 0}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={{ ...styles.statCard, background: "#e94560" }}>
          <div style={styles.statNum}>{stats?.overdue || 0}</div>
          <div style={styles.statLabel}>Overdue</div>
        </div>
      </div>

      {/* OVERDUE TASKS WARNING */}
      {overdueTasks.length > 0 && (
        <div style={styles.overdueBox}>
          <h3>⚠️ Overdue Tasks ({overdueTasks.length})</h3>
          {overdueTasks.map(task => (
            <div key={task._id} style={styles.overdueItem}>
              <strong>{task.title}</strong> — Due: {task.deadline?.substring(0, 10)}
              {task.assignedTo && <span style={styles.badge}>{task.assignedTo.name}</span>}
            </div>
          ))}
        </div>
      )}

      {/* MY TASKS (for members) */}
      {user.role === "member" && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 My Tasks ({myTasks.length})</h3>
          {myTasks.length === 0 ? (
            <p style={styles.empty}>No tasks assigned to you yet.</p>
          ) : (
            myTasks.map(task => (
              <div key={task._id} style={styles.taskCard}>
                <div style={styles.taskTitle}>{task.title}</div>
                <div style={styles.taskMeta}>
                  <span style={{ ...styles.statusBadge, background: task.status === "done" ? "#2ec4b6" : task.status === "in-progress" ? "#f77f00" : "#aaa" }}>
                    {task.status}
                  </span>
                  {task.deadline && <span>📅 {task.deadline.substring(0, 10)}</span>}
                  {task.project && <span>📁 {task.project.name}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ALL TASKS (for admin) */}
      {user.role === "admin" && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 All Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <p style={styles.empty}>No tasks yet. Go to Tasks page to create one.</p>
          ) : (
            tasks.map(task => (
              <div key={task._id} style={styles.taskCard}>
                <div style={styles.taskTitle}>{task.title}</div>
                <div style={styles.taskMeta}>
                  <span style={{ ...styles.statusBadge, background: task.status === "done" ? "#2ec4b6" : task.status === "in-progress" ? "#f77f00" : "#aaa" }}>
                    {task.status}
                  </span>
                  {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                  {task.deadline && <span>📅 {task.deadline.substring(0, 10)}</span>}
                  {task.project && <span>📁 {task.project.name}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  heading: { marginBottom: 24, color: "#1a1a2e" },
  loading: { padding: 40, textAlign: "center", color: "#888" },
  statsRow: { display: "flex", gap: 16, marginBottom: 30, flexWrap: "wrap" },
  statCard: { flex: 1, minWidth: 140, padding: 24, borderRadius: 12, color: "#fff", textAlign: "center" },
  statNum: { fontSize: 36, fontWeight: "bold" },
  statLabel: { fontSize: 14, marginTop: 4, opacity: 0.9 },
  overdueBox: { background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 10, padding: 20, marginBottom: 24 },
  overdueItem: { padding: "8px 0", borderBottom: "1px solid #ffe082", display: "flex", alignItems: "center", gap: 10 },
  badge: { background: "#e94560", color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 12 },
  section: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sectionTitle: { marginBottom: 16, color: "#1a1a2e" },
  taskCard: { padding: "12px 0", borderBottom: "1px solid #f0f0f0" },
  taskTitle: { fontWeight: "bold", marginBottom: 6, color: "#333" },
  taskMeta: { display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#666" },
  statusBadge: { color: "#fff", padding: "2px 10px", borderRadius: 20, fontSize: 12 },
  empty: { color: "#aaa", textAlign: "center", padding: 20 }
};

export default Dashboard;