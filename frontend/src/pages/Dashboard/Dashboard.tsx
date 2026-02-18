import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div className={styles.main}>
      <h1>Dashboard</h1>
      <p>You are logged in.</p>
      <button onClick={handleLogout} className={styles.logout_button}>
        Log out
      </button>
    </div>
  );
}
