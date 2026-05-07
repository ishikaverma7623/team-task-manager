import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setPage("dashboard");
    }
  }, []);

  const handleLogin = (tokenData, userData) => {
    setToken(tokenData);
    setUser(userData);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    setPage("dashboard");
  };

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("login");
  };

  if (!user) {
    return (
      <div>
        {page === "login" ? (
          <Login onLogin={handleLogin} goToSignup={() => setPage("signup")} />
        ) : (
          <Signup goToLogin={() => setPage("login")} />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* NAVBAR */}
      <nav style={styles.nav}>
        <span style={styles.navBrand}>🗂️ Team Task Manager</span>
        <div style={styles.navLinks}>
          <button style={page === "dashboard" ? styles.navBtnActive : styles.navBtn} onClick={() => setPage("dashboard")}>Dashboard</button>
          <button style={page === "projects" ? styles.navBtnActive : styles.navBtn} onClick={() => setPage("projects")}>Projects</button>
          <button style={page === "tasks" ? styles.navBtnActive : styles.navBtn} onClick={() => setPage("tasks")}>Tasks</button>
          <span style={styles.userInfo}>👤 {user.name} ({user.role})</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* PAGES */}
      <div style={styles.content}>
        {page === "dashboard" && <Dashboard token={token} user={user} />}
        {page === "projects" && <Projects token={token} user={user} />}
        {page === "tasks" && <Tasks token={token} user={user} />}
      </div>
    </div>
  );
}

const styles = {
  nav: { background: "#1a1a2e", padding: "14px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  navBrand: { color: "#e94560", fontSize: 20, fontWeight: "bold" },
  navLinks: { display: "flex", alignItems: "center", gap: 10 },
  navBtn: { background: "transparent", color: "#aaa", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 6, fontSize: 14 },
  navBtnActive: { background: "#e94560", color: "#fff", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 6, fontSize: 14 },
  userInfo: { color: "#aaa", fontSize: 13, marginLeft: 10 },
  logoutBtn: { background: "#333", color: "#fff", border: "none", cursor: "pointer", padding: "8px 16px", borderRadius: 6 },
  content: { padding: 30, background: "#f5f6fa", minHeight: "calc(100vh - 60px)" }
};

export default App;