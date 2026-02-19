import { useState, useTransition } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../../components/InputField/InputField";
import { login } from "../../api/auth";
import { getErrorMessage } from "../../utils/error";
import styles from "./SignIn.module.css";

export default function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        await login(formData.email, formData.password);
        navigate("/dashboard");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  return (
    <div className={styles.main}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Welcome Back</h2>

        {error && <div className={styles.error}>{error}</div>}

        <InputField
          title="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <InputField
          title="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />

        <button type="submit" disabled={isPending} className={styles.action_button}>
          {isPending ? "Signing In..." : "Sign In"}
        </button>

        <div className={styles.separator}>
          <div className={styles.line} />
          <span className={styles.or}>or</span>
          <div className={styles.line} />
        </div>

        <p>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.link}>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
