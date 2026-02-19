import { useState, useTransition } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../../components/InputField/InputField";
import { register } from "../../api/auth";
import { getErrorMessage } from "../../utils/error";
import { validateSignUp } from "../../utils/validation";
import styles from "./SignUp.module.css";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationError = validateSignUp(formData.email, formData.password, formData.confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await register(formData.email, formData.password);
        navigate("/dashboard");
      } catch (err) {
        setError(getErrorMessage(err));
      }
    });
  };

  return (
    <div className={styles.main}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Create Account</h2>

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
        <InputField
          title="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit" disabled={isPending} className={styles.action_button}>
          {isPending ? "Creating Account..." : "Create Account"}
        </button>

        <div className={styles.separator}>
          <div className={styles.line} />
          <span className={styles.or}>or</span>
          <div className={styles.line} />
        </div>

        <p>
          Already have an account?{" "}
          <Link to="/signin" className={styles.link}>
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
