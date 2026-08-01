import { Navigate } from "react-router-dom";
import { Flower2, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeToggle } from "../../components/ui";
import { useState } from "react";
export default function Auth() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("admin@bloomflow.id");
  if (user) return <Navigate to="/" replace />;
  return (
    <main className="auth">
      <div className="auth-copy">
        <div className="brand">
          <Flower2 /> BloomFlow
        </div>
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
            <Flower2 /> BloomFlow
          </div>
          <ThemeToggle />
        </div>
        <div>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p>Use any email address to access the demo.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login(email);
          }}
        >
          <label>
            Work email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input type="password" defaultValue="password" required />
          </label>
          <button className="button login-button">
            Continue to BloomFlow <ArrowRight size={18} />
          </button>
        </form>
        <small>
          Demo authentication · Your session is saved securely on this device.
        </small>
      </section>
    </main>
  );
}
