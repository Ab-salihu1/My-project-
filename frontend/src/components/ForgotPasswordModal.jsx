import React, { useState } from "react";
import { X, KeyRound, CheckCircle2 } from "lucide-react";
import { TOKENS } from "../lib/tokens";
import { api } from "../lib/api";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: `1px solid ${TOKENS.line}`, borderRadius: 4, fontSize: 13 };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "#6B7268" };

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New password and confirmation don't match." });
      return;
    }

    setSubmitting(true);
    try {
      await api.forgotPassword({ email, identifier, newPassword });
      setStatus({ type: "success", message: "Password updated. You can close this and sign in." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ background: TOKENS.paper, borderRadius: 6, padding: 24, width: "100%", maxWidth: 380, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", cursor: "pointer", color: "#6B7268" }}>
          <X size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <KeyRound size={18} color={TOKENS.forestDeep} />
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 }}>Reset Password</div>
        </div>
        <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 18 }}>
          Enter your email and matric number (or staff ID) to verify it's you, then set a new password.
        </div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input style={{ ...inputStyle, marginBottom: 14 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@fusta.edu.ng" required />

          <label style={labelStyle}>Matric number (students) or Staff ID (lecturers/registrar)</label>
          <input style={{ ...inputStyle, marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace" }} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="FUSTA/CSC/21/0452" required />

          <label style={labelStyle}>New password</label>
          <input style={{ ...inputStyle, marginBottom: 14 }} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />

          <label style={labelStyle}>Confirm new password</label>
          <input style={{ ...inputStyle, marginBottom: 14 }} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />

          {status && (
            <div style={{ fontSize: 12.5, marginBottom: 14, color: status.type === "success" ? TOKENS.forest : TOKENS.crimson, display: "flex", alignItems: "center", gap: 6 }}>
              {status.type === "success" && <CheckCircle2 size={14} />}
              {status.message}
            </div>
          )}

          <button type="submit" disabled={submitting} style={{ width: "100%", padding: "11px", background: TOKENS.forestDeep, color: TOKENS.paper, border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
            {submitting ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}