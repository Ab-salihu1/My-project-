import React, { useEffect, useState } from "react";
import { LogOut, Download, KeyRound } from "lucide-react";
import { TOKENS, GRADE_COLOR, classOfDegree } from "../lib/tokens";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Seal from "../components/Seal";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [showStamp, setShowStamp] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    api
      .myResults()
      .then((d) => {
        setData(d);
        setTimeout(() => setShowStamp(true), 260);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: "'IBM Plex Sans', sans-serif", color: TOKENS.crimson }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans', sans-serif", color: TOKENS.ink }}>
        Loading your results...
      </div>
    );
  }

  const { student, results, semesterGpa, cgpa } = data;

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.parchment, fontFamily: "'IBM Plex Sans', sans-serif", color: TOKENS.ink }}>
      <div style={{ background: TOKENS.forestDeep, color: TOKENS.paper, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${TOKENS.gold}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/fusta-logo.png" alt="FUSTA crest" style={{ width: 36, height: 36 }} />
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>FUSTA</div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.12em", color: TOKENS.goldBright, textTransform: "uppercase" }}>Result Management Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowPasswordModal(true)} style={{ background: "transparent", border: `1px solid ${TOKENS.goldBright}`, color: TOKENS.goldBright, padding: "6px 12px", borderRadius: 3, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <KeyRound size={13} /> Change Password
          </button>
          <button onClick={logout} style={{ background: "transparent", border: `1px solid ${TOKENS.goldBright}`, color: TOKENS.goldBright, padding: "6px 12px", borderRadius: 3, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
        <div>
          <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.08em", color: "#6B7268", textTransform: "uppercase", marginBottom: 10 }}>
              {student.fullName} — {student.matricNo}
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 600, color: TOKENS.forestDeep, lineHeight: 1 }}>{cgpa.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: TOKENS.gold, fontWeight: 600, marginTop: 4 }}>CGPA · {classOfDegree(cgpa)}</div>
            <div style={{ height: 1, background: TOKENS.line, margin: "16px 0" }} />
            <div style={{ fontSize: 11, color: "#6B7268" }}>Department</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{student.department}</div>
          </div>
          <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: "24px 12px" }}>
            <Seal show={showStamp} />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", background: TOKENS.forest, color: TOKENS.paper, border: "none", borderRadius: 3, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              <Download size={13} /> Download Transcript
            </button>
          </div>

          <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: TOKENS.parchment, textAlign: "left" }}>
                  {["Code", "Course Title", "Unit", "Score", "Grade", "GP"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7268", borderBottom: `1px solid ${TOKENS.line}`, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i === results.length - 1 ? "none" : `1px solid ${TOKENS.line}` }}>
                    <td style={{ padding: "10px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>{r.course.code}</td>
                    <td style={{ padding: "10px 14px" }}>{r.course.title}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "'IBM Plex Mono', monospace" }}>{r.course.unit}</td>
                    <td style={{ padding: "10px 14px", fontFamily: "'IBM Plex Mono', monospace" }}>{r.score}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ display: "inline-block", minWidth: 22, textAlign: "center", padding: "2px 7px", borderRadius: 2, background: GRADE_COLOR[r.grade] + "20", color: GRADE_COLOR[r.grade], fontWeight: 700, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {r.grade}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "'IBM Plex Mono', monospace" }}>{r.gradePoint.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 14, padding: "12px 16px", background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4 }}>
            <div style={{ fontSize: 12 }}>Semester GPA: <strong style={{ color: TOKENS.forest }}>{semesterGpa.toFixed(2)}</strong></div>
          </div>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}