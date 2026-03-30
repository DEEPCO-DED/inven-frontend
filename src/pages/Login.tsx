import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAPI } from "../Services/api";
import styles from "./login.module.css";


const BG_CONFIG = {
  // Example of a direct GIF link
  url: "https://images.pexels.com/photos/36292964/pexels-photo-36292964.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100",
  darkness: 0.2, 
};

const Login: React.FC = () => {
  const [view, setView] = useState<'about' | 'login'>('about');
  const [credentials, setCredentials] = useState({ employeeId: "", password: "" });
  const [ui, setUi] = useState({ loading: false, error: "" });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUi({ loading: true, error: "" });
    try {
      const { data } = await loginAPI(credentials.employeeId, credentials.password);
      login({
        employee_id: data.employee_id,
        full_name: data.full_name,
        role: data.role,
        must_change_password: data.must_change_password,
      });
      const routes: Record<string, string> = {
        hr: "/hr", area_manager: "/area-manager", cafe_manager: "/cafe-manager", 
        team_member: "/order", warehouse: "/warehouse"
      };
      navigate(data.must_change_password ? "/change-password" : (routes[data.role] || "/"));
    } catch (err: any) {
      setUi({ loading: false, error: "Access Denied" });
    }
  };

  return (
    <div 
      className={styles.pageWrapper} 
      style={{ backgroundImage: `linear-gradient(rgba(0,0,0,${BG_CONFIG.darkness}), rgba(0,0,0,${BG_CONFIG.darkness})), url(${BG_CONFIG.url})` }}
    >
      <nav className={styles.navbar}>
        <div className={styles.logo}>TECHIE<span>CAFE</span></div>
        <div className={styles.navLinks}>
          <button onClick={() => setView('about')} className={view === 'about' ? styles.activeLink : ''}>About</button>
          <button onClick={() => setView('login')} className={view === 'login' ? styles.activeLink : ''}>Login</button>
        </div>
      </nav>

      {view === 'about' ? (
        <section className={`${styles.aboutSection} ${styles.fadeIn}`}>
          <div className={styles.heroText}>
            <h1>Experience <br/><span>Hospitality</span></h1>
            <p>Seamless management for the modern brewing professional. Access your partner portal to manage orders, staff, and inventory in real-time.</p>
            <button onClick={() => setView('login')} className={styles.exploreBtn}>Get Started</button>
          </div>
        </section>
      ) : (
        <div className={`${styles.animatedBorderBox} ${styles.fadeIn}`}>
          <div className={styles.glassCard}>
            {/* ── SLEEK WHITE CLOSE BUTTON ── */}
            <button 
              className={styles.closeBtn} 
              onClick={() => setView('about')}
              title="Close"
            >
              &times;
            </button>

            <h1 className={styles.title}>Partner Portal</h1>
            <p className={styles.subtitle}>Secure Access</p>

            {ui.error && <div className={styles.errorMsg}>{ui.error}</div>}

            <form onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Employee ID</label>
                <input 
                  name="employeeId" type="text" className={styles.glassInput} 
                  placeholder="EMP-ID" value={credentials.employeeId} 
                  onChange={handleChange} required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input 
                  name="password" type="password" className={styles.glassInput} 
                  placeholder="••••••••" value={credentials.password} 
                  onChange={handleChange} required 
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={ui.loading}>
                {ui.loading ? "Checking..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;