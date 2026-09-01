import { useState } from "react";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { api } from "./services/api";
const Logo = () => (
  <div className="logo">
    <span className="logo-mark">
      <i className="bi bi-stars" aria-hidden="true" />
    </span>
    <span>AIveda</span>
  </div>
);
export default function AuthPage({
  mode,
  onNavigate,
  dark,
  setDark,
}: {
  mode: "login" | "register";
  onNavigate: (path: string) => void;
  dark: boolean;
  setDark: (value: boolean | ((current: boolean) => boolean)) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (
      !normalizedEmail ||
      !password ||
      (mode === "register" && !trimmedName)
    ) {
      setError(
        mode === "register"
          ? "Please complete all fields before continuing."
          : "Please enter your email and password.",
      );
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === "login"
          ? await api.login({ email: normalizedEmail, password })
          : await api.register({
              name: trimmedName,
              email: normalizedEmail,
              password,
            });
      localStorage.setItem("aiveda_token", result.token);
      localStorage.setItem("aiveda_user", JSON.stringify(result.user));
      onNavigate(mode === "login" ? "/dashboard" : "/onboarding");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to continue.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={dark ? "auth-page dark" : "auth-page"}>
      <div className="auth-aside">
        <Logo />
        <div>
          <span className="eyebrow">Your goals. Your skills.</span>
          <h1>Make progress feel personal.</h1>
          <p>
            One thoughtful next step at a time, with an AI coach that remembers
            what matters to you.
          </p>
        </div>
        <div className="auth-quote">
          “The first time a roadmap felt like mine.”
          <small>Learning built for real momentum</small>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-topbar">
          <button className="back-link" onClick={() => onNavigate("/")}>
            <ChevronRight size={15} style={{ transform: "rotate(180deg)" }} />{" "}
            Back home
          </button>
          <button
            className="landing-theme-toggle auth-theme-toggle"
            onClick={() => setDark((current: boolean) => !current)}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? "☀" : "☾"}
          </button>
        </div>
        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <span className="eyebrow">
            {mode === "login" ? "Welcome back" : "Start your path"}
          </span>
          <h2>
            {mode === "login"
              ? "Sign in to AIVeda"
              : "Create your learner profile"}
          </h2>
          <p>
            {mode === "login"
              ? "Pick up exactly where you left off."
              : "A clearer learning path starts with a few details."}
          </p>
          {mode === "register" && (
            <label>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </label>
          )}
          <label>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </label>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="primary-btn full" disabled={loading}>
            {loading
              ? "Working..."
              : mode === "login"
                ? "Continue to workspace"
                : "Create my path"}{" "}
            <ArrowRight size={16} />
          </button>
          <div className="auth-divider">
            <span>or</span>
          </div>
          <button type="button" className="social-btn">
            <span>G</span> Continue with Google
          </button>
          <small className="auth-switch">
            {mode === "login" ? "New to AIVeda?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                onNavigate(mode === "login" ? "/register" : "/login")
              }
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </small>
        </form>
      </div>
    </div>
  );
}
