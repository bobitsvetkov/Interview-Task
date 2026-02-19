import { useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";
import { useDashboard } from "../../hooks/useDashboard";
import FileUpload from "../../components/FileUpload/FileUpload";
import DatasetsTable from "../../components/DatasetsTable/DatasetsTable";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { datasets, uploadResult, isUploading, error, isProcessing, handleUpload } = useDashboard();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.header_actions}>
          <FileUpload onFileSelected={handleUpload} disabled={isUploading} />
          <button onClick={handleLogout} className={styles.logout_button}>
            Log out
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {uploadResult && (
        <div className={styles.banner}>
          {isProcessing ? (
            <span className={styles.banner_stat}>
              <span className={`${styles.status_badge} ${styles.status_processing}`}>Processing...</span>
            </span>
          ) : (
            <>
              <span className={styles.banner_stat}>
                <span className={styles.banner_label}>Rows imported:</span>
                {uploadResult.row_count}
              </span>
              <span className={styles.banner_stat}>
                <span className={styles.banner_label}>Duplicates removed:</span>
                {uploadResult.rows_dropped}
              </span>
            </>
          )}
        </div>
      )}

      <DatasetsTable datasets={datasets} onSelect={(id) => navigate(`/datasets/${id}`)} />
    </div>
  );
}
