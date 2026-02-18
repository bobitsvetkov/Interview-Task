import { useState } from "react";
import styles from "./InputField.module.css";

interface InputFieldProps {
  title: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function InputField({
  title,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
}: Readonly<InputFieldProps>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={styles.main}>
      <div className={styles.title}>{title}</div>
      <div className={styles.input_wrapper}>
        <input
          className={`${styles.input_text} ${isPassword ? styles.password_input : ""}`}
          type={isPassword && showPassword ? "text" : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle_password}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  );
}
