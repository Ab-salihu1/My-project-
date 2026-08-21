import React, { useEffect, useState } from "react";
import { LogOut, Search, CheckCircle2, KeyRound } from "lucide-react";
import { TOKENS } from "../lib/tokens";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import ChangePasswordModal from "../components/ChangePasswordModal";

function Header({ subtitle, onChangePassword }) {
  const { logout } = useAuth();
  return (
    <div style={{ background: TOKENS.forestDeep, color: TOKENS.paper, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${TOKENS.gold}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src="/fusta-logo.png" alt="FUSTA crest" style={{ width: 36, height: 36 }} />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>FUSTA</div>
          <div style={{ fontSize: 9.5, letterSpacing: "0.12em", color: TOKENS.goldBright, textTransform: "uppercase" }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onChangePassword} style={{ background: "transparent", border: `1px solid ${TOKENS.goldBright}`, color: TOKENS.goldBright, padding: "6px 12px", borderRadius: 3, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <KeyRound size={13} /> Change Password
        </button>
        <button onClick={logout} style={{ background: "transparent", border: `1px solid ${TOKENS.goldBright}`, color: TOKENS.goldBright, padding: "6px 12px", borderRadius: 3, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: `1px solid ${TOKENS.line}`, borderRadius: 3, fontSize: 13, outline: "none" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: TOKENS.ink };

export default function LecturerDashboard() {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [score, setScore] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    api.courses().then(setCourses).catch(() => {});
    api.semesters().then(setSemesters).catch(() => {});
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setMatches([]);
      return;
    }
    const timer = setTimeout(() => {
      api.searchStudents(query).then(setMatches).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  async function handlePublish(e) {
    e.preventDefault();
    setStatus(null);
    if (!selectedStudent || !courseId || !semesterId || score === "") {
      setStatus({ type: "error", message: "Fill in student, course, semester and score." });
      return;
    }
    setSubmitting(true);
    try {
      await api.publishResult({ studentId: selectedStudent.id, courseId, semesterId, score: Number(score) });
      setStatus({ type: "success", message: `Result published for ${selectedStudent.fullName}.` });
      setScore("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.parchment, fontFamily: "'IBM Plex Sans', sans-serif", color: TOKENS.ink }}>
      <Header subtitle="Lecturer Portal" onChangePassword={() => setShowPasswordModal(true)} />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 24 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Publish a Result</div>
          <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 20 }}>Search a student, then enter their score for one of your courses.</div>

          <label style={labelStyle}>Search student</label>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: 11, opacity: 0.5 }} />
            <input style={{ ...inputStyle, paddingLeft: 32 }} value={query} onChange={(e) => { setQuery(e.target.value); setSelectedStudent(null); }} placeholder="Name or matric number" />
          </div>

          {matches.length > 0 && !selectedStudent && (
            <div style={{ border: `1px solid ${TOKENS.line}`, borderRadius: 3, marginBottom: 14, overflow: "hidden" }}>
              {matches.map((s) => (
                <button key={s.id} type="button" onClick={() => { setSelectedStudent(s); setQuery(`${s.fullName} — ${s.matricNo}`); setMatches([]); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: TOKENS.paper, cursor: "pointer", fontSize: 12.5, borderBottom: `1px solid ${TOKENS.line}` }}>
                  <strong>{s.fullName}</strong> — {s.matricNo}
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div style={{ fontSize: 12, background: TOKENS.parchment, border: `1px solid ${TOKENS.line}`, borderRadius: 3, padding: "8px 12px", marginBottom: 14 }}>
              Selected: <strong>{selectedStudent.fullName}</strong> ({selectedStudent.matricNo})
            </div>
          )}

          <form onSubmit={handlePublish}>
            <label style={labelStyle}>Course</label>
            <select style={{ ...inputStyle, marginBottom: 14 }} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>

            <label style={labelStyle}>Semester</label>
            <select style={{ ...inputStyle, marginBottom: 14 }} value={semesterId} onChange={(e) => setSemesterId(e.target.value)}>
              <option value="">Select semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.session}</option>
              ))}
            </select>

            <label style={labelStyle}>Score (0–100)</label>
            <input style={{ ...inputStyle, marginBottom: 18, fontFamily: "'IBM Plex Mono', monospace" }} type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 72" />

            {status && (
              <div style={{ fontSize: 12.5, marginBottom: 14, color: status.type === "success" ? TOKENS.forest : TOKENS.crimson, display: "flex", alignItems: "center", gap: 6 }}>
                {status.type === "success" && <CheckCircle2 size={14} />}
                {status.message}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ width: "100%", padding: "11px 0", background: TOKENS.forest, color: TOKENS.paper, border: "none", borderRadius: 3, fontWeight: 600, fontSize: 13.5, cursor: submitting ? "wait" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Publishing..." : "Publish Result"}
            </button>
          </form>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}