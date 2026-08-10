import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/Logo.png";

export default function Auth() {
  const { user, login, isRestoring } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isRestoring) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth-copy">
        <p className="eyebrow">FLOW WITH CLARITY</p>
        <h1>Freshness-led operations, beautifully managed.</h1>
        <p>
          One calm control center for every flower, farm, warehouse, and branch.
        </p>
        <div className="auth-art">
          <span>✿</span>
          <span>✾</span>
          <span>✿</span>
        </div>
      </div>
      <section className="login-card">
        <div className="login-top">
          <div className="brand">
            <img className="login-brand-logo" src={logo} alt="BloomFlow Logo" />
            <span>BloomFlow</span>
          </div>
          <ThemeToggle />
        </div>
        <div>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>Use your BloomFlow account to access your workspace.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button login-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Continue to BloomFlow"}
            <ArrowRight size={18} />
          </button>
        </form>
        <small>Your session is saved securely on this device.</small>
      </section>
    </main>
  );
}
