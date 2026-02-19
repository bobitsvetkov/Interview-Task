export function validateSignUp(email: string, password: string, confirmPassword: string): string | null {
  if (!email.trim()) return "Email is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
}
