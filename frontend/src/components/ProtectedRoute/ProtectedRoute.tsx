import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../../api/auth";
import Spinner from "../Spinner/Spinner";

export default function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    getMe()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "loading") {
    return (
      <div style={{ height: "100vh" }}>
        <Spinner />
      </div>
    );
  }

  if (status === "unauthenticated") return <Navigate to="/signin" replace />;

  return children;
}
