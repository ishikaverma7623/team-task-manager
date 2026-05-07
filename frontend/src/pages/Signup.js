import React, { useState } from "react";

function Signup({ goToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://team-task-manager-production-e55f.up.railway.app/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Account created! Please login.");
        setTimeout(goToLogin, 1500);
      } else {
        setError(data.msg || "Signup failed");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>🗂️ Team Task Manager</h2>
        <h3 style={styles.subtitle}>Create Account</h3>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <input style={styles.input} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={styles.input} placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <select style={styles.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button style={styles.btn} onClick={handleSignup} disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
        <p style={styles.link}>Already have an account? <span style={styles.linkText} onClick={goToLogin}>Login</span></p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1a2e" },
  card: { background: "#fff", padding: 40, borderRadius: 12, width: 380, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" },
  title: { textAlign: "center", color: "#e94560", marginBottom: 8 },
  subtitle: { textAlign: "center", color: "#333", marginBottom: 24, fontWeight: 400 },
  input: { display: "block", width: "100%", padding: "12px 14px", marginBottom: 14, border: "1px solid #ddd", borderRadius: 8, fontSize: 14 },
  btn: { width: "100%", padding: 12, background: "#e94560", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" },
  error: { background: "#ffe0e0", color: "#c00", padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13 },
  success: { background: "#e0ffe0", color: "#080", padding: 10, borderRadius: 8, marginBottom: 14, fontSize: 13 },
  link: { textAlign: "center", marginTop: 16, color: "#666", fontSize: 13 },
  linkText: { color: "#e94560", cursor: "pointer", fontWeight: "bold" }
};

export default Signup;