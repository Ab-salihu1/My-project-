import React, { useState } from "react";
import { Lock, ArrowRight, GraduationCap, Users, Landmark } from "lucide-react";
import { TOKENS } from "../lib/tokens";
import { useAuth } from "../context/AuthContext";

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
      style={{ position: "absolute", top: "50%", left: "50%", width: 520, height: 520, transform: "translate(-50%, -50%)", opacity: 0.05, pointerEvents: "none" }}
    />
  );
}

export default function LoginPage() {
  const [roleHint, setRoleHint] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    await login(email, password);
    // Role-based redirect is driven by the returned user.role, not by roleHint
    // (roleHint only pre-fills the placeholder — the server is the source of truth).
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${TOKENS.parchment} 0%, #EFE9D8 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'IBM Plex Sans', sans-serif", padding: 24 }}>
      <Watermark />
      <form onSubmit={handleSubmit} style={{ position: "relative", background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: "40px 36px 32px", width: 380, maxWidth: "100%", boxShadow: "0 24px 60px -20px rgba(10,61,36,0.35)" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${TOKENS.forest}, ${TOKENS.gold})` }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <img src="/fusta-logo.png" alt="FUSTA crest" style={{ width: 86, height: 86, marginBottom: 12 }} />
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 22, color: TOKENS.forestDeep }}>FUSTA</div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: TOKENS.gold, textTransform: "uppercase", marginTop: 2, fontWeight: 600 }}>
            Result Management Portal
          </div>
        </div>

        <div style={{ display: "flex", border: `1px solid ${TOKENS.line}`, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
          {ROLE_HINTS.map((r) => {
            const Icon = r.icon;
            const active = roleHint === r.id;
            return (
              <button type="button" key={r.id} onClick={() => setRoleHint(r.id)} style={{ flex: 1, padding: "9px 4px", border: "none", cursor: "pointer", background: active ? TOKENS.forestDeep : "transparent", color: active ? TOKENS.paper : TOKENS.ink, fontSize: 12, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <Icon size={14} />
                {r.label}
              </button>
            );
          })}
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={ROLE_HINTS.find((r) => r.id === roleHint).placeholder} style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", marginBottom: 14, border: `1px solid ${TOKENS.line}`, borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, outline: "none" }} />

        <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Password</label>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Lock size={14} style={{ position: "absolute", left: 12, top: 12, opacity: 0.5 }} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 32px", border: `1px solid ${TOKENS.line}`, borderRadius: 3, fontSize: 13, outline: "none" }} />
        </div>

        {error && <div style={{ color: TOKENS.crimson, fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px 0", background: TOKENS.forest, color: TOKENS.paper, border: "none", borderRadius: 3, fontWeight: 600, fontSize: 13.5, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.7 : 1, marginTop: 8 }}>
          {loading ? "Signing in..." : "Access Results"} <ArrowRight size={15} />
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 10.5, color: "#6B7268", letterSpacing: "0.04em" }}>
          FEDERAL UNIVERSITY OF SCIENCE &amp; TECHNOLOGY · ANKPA, KOGI STATE
        </div>
      </form>
    </div>
  );
}
