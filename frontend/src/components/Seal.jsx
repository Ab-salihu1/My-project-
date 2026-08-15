import React from "react";
import { ShieldCheck } from "lucide-react";
import { TOKENS } from "../lib/tokens";

export default function Seal({ show }) {
  return (
    <div
      style={{
        width: 128,
        height: 128,
        borderRadius: "50%",
        border: `2px solid ${TOKENS.forest}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        margin: "0 auto",
        position: "relative",
        background: "radial-gradient(circle at 30% 30%, #ffffff, #EFEADA)",
        boxShadow: show ? "0 6px 18px rgba(14,92,52,0.25)" : "none",
        transform: show ? "rotate(-8deg) scale(1)" : "rotate(-8deg) scale(0.4)",
        opacity: show ? 1 : 0,
        transition: "transform 480ms cubic-bezier(.2,1.4,.4,1), opacity 380ms ease",
      }}
    >
      <div style={{ position: "absolute", inset: 6, borderRadius: "50%", border: `1px dashed ${TOKENS.gold}` }} />
      <ShieldCheck size={30} color={TOKENS.forest} strokeWidth={2.2} />
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8.5, letterSpacing: "0.12em", color: TOKENS.forestDeep, marginTop: 4, fontWeight: 600 }}>
        VERIFIED
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 6.5, letterSpacing: "0.08em", color: TOKENS.gold, marginTop: 1 }}>
        FUSTA RECORD
      </div>
    </div>
  );
}
