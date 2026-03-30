import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
    const navigate = useNavigate();
    
    const BG_URL = "https://images.pexels.com/photos/36729732/pexels-photo-36729732.jpeg?auto=compress&cs=tinysrgb&w=3840&q=100";
    const DARKNESS = 0.4; // Slightly darker to make the guidelines readable

    const guidelines = [
        { title: "Eye Contact", desc: "Acknowledge every guest with a smile within 30 seconds." },
        { title: "Empathy First", desc: "Listen to concerns without interrupting. Make them feel heard." },
        { title: "The 'Extra' Touch", desc: "Remember a regular's name or favorite drink to spark joy." }
    ];

    return (
        <div className={styles.container} style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,${DARKNESS}), rgba(0,0,0,${DARKNESS})), url(${BG_URL})` 
        }}>
            
            <nav className={styles.navbar}>
                <div className={styles.logo}>TECHIE<span>CAFE</span></div>
                <button onClick={() => navigate("/login")} className={styles.logoutBtn}>Logout</button>
            </nav>

            <main className={styles.mainHero}>
                <span className={styles.badge}>Station Active</span>
                <h1 className={styles.title}>Welcome, <br/><span>Champ</span></h1>
                
                <button className={styles.startBtn} onClick={() => navigate("/order")}>
                    Start Taking Orders
                </button>

                {/* ── SERVICE GUIDELINES SECTION ── */}
                <div className={styles.guideGrid}>
                    {guidelines.map((guide, index) => (
                        <div key={index} className={styles.guideItem}>
                            <h3>{guide.title}</h3>
                            <p>{guide.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className={styles.footer}>
                Hospitality Mode: Enabled • Terminal TC-04
            </footer>
        </div>
    );
};

export default Dashboard;