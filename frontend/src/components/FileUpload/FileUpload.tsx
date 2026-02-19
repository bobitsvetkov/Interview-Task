import { useRef } from "react";
import styles from "./FileUpload.module.css";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  accept?: string;
}

export default function FileUpload({ onFileSelected, disabled = false, accept = ".csv" }: Readonly<FileUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.wrapper}>
      <label className={`${styles.label} ${disabled ? styles.label_disabled : ""}`}>
        {disabled ? "Uploading..." : "Upload CSV"}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className={styles.hidden}
        />
      </label>
    </div>
  );
}
