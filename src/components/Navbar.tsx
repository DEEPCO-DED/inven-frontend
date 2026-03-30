import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutAPI } from "../Services/api";
import styles from "./Navbar.module.css";

interface MenuItem {
  label: string;
  path: string;
}

const menuItems: Record<string, MenuItem[]> = {
  cafe_manager: [
    { label: "Order Taking", path: "/order" },
    { label: "Ordering", path: "/ordering" },
    { label: "Receiving", path: "/receiving" },
    { label: "Inventory", path: "/inventory" },
    { label: "Wastage", path: "/wastage" },
  ],
  area_manager: [
    { label: "Order Taking", path: "/order" },
    { label: "Ordering", path: "/ordering" },
    { label: "Receiving", path: "/receiving" },
    { label: "Inventory", path: "/inventory" },
    { label: "Wastage", path: "/wastage" },
  ],
  team_member: [{ label: "Order Taking", path: "/order" }],
  warehouse: [{ label: "Incoming Orders", path: "/warehouse" }],
};

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── HIDE NAVBAR ON LOGIN & DASHBOARD ──
  const hiddenPaths = ["/login", "/dashboard", "/"]; 
  if (hiddenPaths.includes(location.pathname)) {
    return null; 
  }

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutAPI();
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const items: MenuItem[] = user?.role ? menuItems[user.role] || [] : [];

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigate("/dashboard")}>
        Techie<span>cafe</span>
      </div>

      <div className={styles.menuItems}>
        {items.map((item) => (
          <button
            key={item.path}
            className={`${styles.menuBtn} ${
              location.pathname === item.path ? styles.menuBtnActive : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.searchBox}>
        <input type="text" className={styles.searchInput} placeholder="Search portal..." />
      </div>

      <div className={styles.actions}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className={styles.userInfo}>
              {user.full_name} 
              <span style={{ opacity: 0.5, fontSize: '11px', marginLeft: '6px' }}>
                #{user.employee_id}
              </span>
            </span>
            <button className={styles.loginBtn} onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={() => navigate("/login")}>Partner Login</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;