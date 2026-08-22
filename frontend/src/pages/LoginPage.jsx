import React, { useState } from "react";
import { Lock, ArrowRight, GraduationCap, Users, Landmark } from "lucide-react";
import { TOKENS } from "../lib/tokens";
import { useAuth } from "../context/AuthContext";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

const ROLE_HINTS = [
  { id: "STUDENT", label: "Student", icon: GraduationCap, placeholder: "student@fusta.edu.ng" },
  { id: "LECTURER", label: "Lecturer", icon: Users, placeholder: "lecturer@fusta.edu.ng" },
  { id: "REGISTRAR", label: "Registrar", icon: Landmark, placeholder: "registrar@fusta.edu.ng" },
];

function Watermark() {
  return (
    <img
      src="/fusta-logo.png"
      alt=""
      aria-hidden="true"
      style={{ position: "absolute", top: "50%", left: "50%", width: 520, height: 520, transform: "translate(-50%, -50%)", opacity: 0.04, pointerEvents: "none" }}
    />
  );
}

export default function LoginPage() {
  const [roleHint, setRoleHint] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, logout, loading, error, setError } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const user = await login(email, password);
    if (!user) return; // login itself failed, error already set — "Forgot Password?" will now show

    if (user.role !== roleHint) {
      await logout();
      const roleLabel = ROLE_HINTS.find((r) => r.id === roleHint)?.label || roleHint;
      setError(`These credentials belong to a different account type, not ${roleLabel}. Please select the correct tab.`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${TOKENS.parchment} 0%, ${TOKENS.paper} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <Watermark />
      <form onSubmit={handleSubmit} style={{ position: "relative", background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 6, padding: "36px 32px", width: 360 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <img src="/fusta-logo.png" alt="FUSTA crest" style={{ width: 86, height: 86, marginBottom: 10 }} />
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: TOKENS.forestDeep, letterSpacing: "0.14em", textTransform: "uppercase" }}>FUSTA</div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: TOKENS.gold, textTransform: "uppercase" }}>Result Management Portal</div>
        </div>

        <div style={{ display: "flex", border: `1px solid ${TOKENS.line}`, borderRadius: 4, overflow: "hidden", marginBottom: 20 }}>
          {ROLE_HINTS.map((r) => {
            const Icon = r.icon;
            const active = roleHint === r.id;
            return (
              <button type="button" key={r.id} onClick={() => { setRoleHint(r.id); setError(null); }} style={{ flex: 1, padding: "9px 4px", border: "none", background: active ? TOKENS.forestDeep : "transparent", color: active ? TOKENS.paper : TOKENS.forestDeep, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <Icon size={14} />
                {r.label}
              </button>
            );
          })}
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={ROLE_HINTS.find((r) => r.id === roleHint)?.placeholder} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", border: `1px solid ${TOKENS.line}`, borderRadius: 4, fontSize: 13, marginBottom: 14 }} />

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Lock size={14} style={{ position: "absolute", left: 12, top: 12, opacity: 0.5 }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 32px", border: `1px solid ${TOKENS.line}`, borderRadius: 4, fontSize: 13 }} />
        </div>

        {error && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: TOKENS.crimson, fontSize: 12 }}>{error}</div>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{ background: "transparent", border: "none", padding: 0, marginTop: 4, color: TOKENS.forestDeep, fontSize: 12, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
            >
              Forgot Password?
            </button>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px 0", background: TOKENS.forestDeep, color: TOKENS.paper, border: "none", borderRadius: 4, fontWeight: 600, fontSize: 13.5, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {loading ? "Signing in..." : "Access Results"} <ArrowRight size={15} />
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 10.5, color: "#6B7268", letterSpacing: "0.02em" }}>
          FEDERAL UNIVERSITY OF SCIENCE &amp; TECHNOLOGY, ANKPA, KOGI STATE
        </div>
      </form>

      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </div>
  );
}