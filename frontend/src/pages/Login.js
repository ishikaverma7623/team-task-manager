import React, { useState } from "react";

function Login({ onLogin, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://team-task-manager-production-e55f.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        onLogin(data.token, data.user);
      } else {
        setError(data.msg || "Login failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>🗂️ Team Task Manager</h2>
        <h3 style={styles.subtitle}>Login</h3>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p style={styles.link}>Don't have an account? <span style={styles.linkText} onClick={goToSignup}>Sign up</span></p>
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
  link: { textAlign: "center", marginTop: 16, color: "#666", fontSize: 13 },
  linkText: { color: "#e94560", cursor: "pointer", fontWeight: "bold" }
};

export default Login;