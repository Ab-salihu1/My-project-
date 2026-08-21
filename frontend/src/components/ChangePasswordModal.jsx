import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { TOKENS } from "../lib/tokens";
import { api } from "../lib/api";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: `1px solid ${TOKENS.line}`, borderRadius: 3, fontSize: 13, outline: "none" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: TOKENS.ink };

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    setSubmitting(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setStatus({ type: "success", message: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 100 }}>
      <div style={{ background: TOKENS.paper, borderRadius: 4, padding: 24, width: "100%", maxWidth: 380, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: "none", cursor: "pointer", color: TOKENS.ink }}>
          <X size={18} />
        </button>

        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Change Password</div>
        <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 18 }}>Enter your current password and choose a new one.</div>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Current password</label>
          <input style={{ ...inputStyle, marginBottom: 14 }} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />

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

          <button type="submit" disabled={submitting} style={{ width: "100%", padding: "11px 0", background: TOKENS.forest, color: TOKENS.paper, border: "none", borderRadius: 3, fontWeight: 600, fontSize: 13.5, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}