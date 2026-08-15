import React, { useState } from "react";
import { LogOut, Search, UserPlus, CheckCircle2 } from "lucide-react";
import { TOKENS, GRADE_COLOR, classOfDegree } from "../lib/tokens";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Seal from "../components/Seal";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: `1px solid ${TOKENS.line}`, borderRadius: 3, fontSize: 13, outline: "none" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: TOKENS.ink };

function TranscriptLookup() {
  const [matric, setMatric] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStamp, setShowStamp] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    setShowStamp(false);
    try {
      const result = await api.resultsByMatric(matric.trim());
      setData(result);
      setTimeout(() => setShowStamp(true), 200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 24 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Student Transcript Lookup</div>
      <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 18 }}>Enter an exact matriculation number to pull a full record.</div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }} value={matric} onChange={(e) => setMatric(e.target.value)} placeholder="FUSTA/CSC/21/0452" />
        <button type="submit" disabled={loading} style={{ padding: "0 16px", background: TOKENS.forest, color: TOKENS.paper, border: "none", borderRadius: 3, cursor: loading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Search size={14} /> {loading ? "..." : "Search"}
        </button>
      </form>

      {error && <div style={{ color: TOKENS.crimson, fontSize: 12.5 }}>{error}</div>}

      {data && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 20 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600 }}>{data.student.fullName}</div>
              <div style={{ fontSize: 12, color: "#6B7268", fontFamily: "'IBM Plex Mono', monospace" }}>{data.student.matricNo}</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>{data.student.department} · Level {data.student.level}</div>
              <div style={{ fontSize: 13, marginTop: 10 }}>
                CGPA: <strong style={{ color: TOKENS.forest }}>{data.cgpa.toFixed(2)}</strong>
                <span style={{ color: TOKENS.gold, marginLeft: 8, fontWeight: 600 }}>{classOfDegree(data.cgpa)}</span>
              </div>
            </div>
            <Seal show={showStamp} />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: TOKENS.parchment, textAlign: "left" }}>
                {["Code", "Title", "Semester", "Score", "Grade"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7268", borderBottom: `1px solid ${TOKENS.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.results.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${TOKENS.line}` }}>
                  <td style={{ padding: "8px 10px", fontFamily: "'IBM Plex Mono', monospace" }}>{r.course.code}</td>
                  <td style={{ padding: "8px 10px" }}>{r.course.title}</td>
                  <td style={{ padding: "8px 10px", fontSize: 11 }}>{r.semester.name} {r.semester.session}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "'IBM Plex Mono', monospace" }}>{r.score}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ color: GRADE_COLOR[r.grade], fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>{r.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [identifier, setIdentifier] = useState(""); // matricNo or staffId depending on role
  const [level, setLevel] = useState("100");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const profile =
        role === "REGISTRAR"
          ? undefined
          : {
              fullName,
              department,
              ...(role === "STUDENT" ? { matricNo: identifier, level: Number(level) } : { staffId: identifier }),
            };
      await api.register({ email, password, role, profile });
      setStatus({ type: "success", message: `Account created for ${email}.` });
      setEmail("");
      setPassword("");
      setFullName("");
      setDepartment("");
      setIdentifier("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 24, marginTop: 20 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Create Account</div>
      <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 18 }}>
        Creates the login and, for students/lecturers, the matching profile record in one step.
      </div>
      <form onSubmit={handleCreate}>
        <label style={labelStyle}>Role</label>
        <select style={{ ...inputStyle, marginBottom: 14 }} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="STUDENT">Student</option>
          <option value="LECTURER">Lecturer</option>
          <option value="REGISTRAR">Registrar</option>
        </select>

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@fusta.edu.ng" />

        <label style={labelStyle}>Temporary password</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />

        {role !== "REGISTRAR" && (
          <>
            <label style={labelStyle}>Full name</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Abubakar Salihu" />

            <label style={labelStyle}>Department</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />

            <label style={labelStyle}>{role === "STUDENT" ? "Matric number" : "Staff ID"}</label>
            <input style={{ ...inputStyle, marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace" }} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={role === "STUDENT" ? "FUSTA/CSC/24/0100" : "FUSTA/STF/0099"} />

            {role === "STUDENT" && (
              <>
                <label style={labelStyle}>Level</label>
                <select style={{ ...inputStyle, marginBottom: 14 }} value={level} onChange={(e) => setLevel(e.target.value)}>
                  {["100", "200", "300", "400", "500"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </>
            )}
          </>
        )}

        {status && (
          <div style={{ fontSize: 12.5, marginBottom: 14, color: status.type === "success" ? TOKENS.forest : TOKENS.crimson, display: "flex", alignItems: "center", gap: 6 }}>
            {status.type === "success" && <CheckCircle2 size={14} />}
            {status.message}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "11px 0", background: TOKENS.forestDeep, color: TOKENS.paper, border: "none", borderRadius: 3, fontWeight: 600, fontSize: 13.5, cursor: submitting ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <UserPlus size={15} /> {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default function RegistrarDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("lookup");

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.parchment, fontFamily: "'IBM Plex Sans', sans-serif", color: TOKENS.ink }}>
      <div style={{ background: TOKENS.forestDeep, color: TOKENS.paper, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `3px solid ${TOKENS.gold}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/fusta-logo.png" alt="FUSTA crest" style={{ width: 36, height: 36 }} />
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, lineHeight: 1.1 }}>FUSTA</div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.12em", color: TOKENS.goldBright, textTransform: "uppercase" }}>Registrar Portal</div>
          </div>
        </div>
        <button onClick={logout} style={{ background: "transparent", border: `1px solid ${TOKENS.goldBright}`, color: TOKENS.goldBright, padding: "6px 12px", borderRadius: 3, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[{ id: "lookup", label: "Student Records" }, { id: "create", label: "Create Account" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 16px", borderRadius: 3, border: `1px solid ${TOKENS.line}`, background: tab === t.id ? TOKENS.forestDeep : TOKENS.paper, color: tab === t.id ? TOKENS.paper : TOKENS.ink, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "lookup" ? <TranscriptLookup /> : <CreateAccount />}
      </div>
    </div>
  );
}
