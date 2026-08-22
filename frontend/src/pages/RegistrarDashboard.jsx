import React, { useState } from "react";
import { LogOut, Search, UserPlus, CheckCircle2, KeyRound } from "lucide-react";
import { TOKENS, GRADE_COLOR, classOfDegree } from "../lib/tokens";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Seal from "../components/Seal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: `1px solid ${TOKENS.line}`, borderRadius: 4, fontSize: 13 };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4, color: "#6B7268" };

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
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 20 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Student Records</div>
      <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 18 }}>Enter an exact matriculation number.</div>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <input style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }} value={matric} onChange={(e) => setMatric(e.target.value)} placeholder="FUSTA/CSC/21/0452" />
        <button type="submit" disabled={loading} style={{ padding: "0 16px", background: TOKENS.forestDeep, color: TOKENS.paper, border: "none", borderRadius: 4, cursor: "pointer" }}>
          <Search size={14} /> {loading ? "..." : "Search"}
        </button>
      </form>

      {error && <div style={{ color: TOKENS.crimson, fontSize: 12.5 }}>{error}</div>}

      {data && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
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
                  <th key={h} style={{ padding: "8px 10px", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
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
  const [identifier, setIdentifier] = useState("");
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
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 20 }}>
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
        <input style={{ ...inputStyle, marginBottom: 14 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label style={labelStyle}>Temporary password</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {role !== "REGISTRAR" && (
          <>
            <label style={labelStyle}>Full name</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} value={fullName} onChange={(e) => setFullName(e.target.value)} required />

            <label style={labelStyle}>Department</label>
            <input style={{ ...inputStyle, marginBottom: 14 }} value={department} onChange={(e) => setDepartment(e.target.value)} required />

            <label style={labelStyle}>{role === "STUDENT" ? "Matric number" : "Staff ID"}</label>
            <input style={{ ...inputStyle, marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace" }} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />

            {role === "STUDENT" && (
              <>
              <label style={labelStyle}>Level</label>
<select style={{ ...inputStyle, marginBottom: 14 }} value={level} onChange={(e) => setLevel(e.target.value)}>
  {[
    { value: "100", label: "100 Level" },
    { value: "200", label: "200 Level" },
    { value: "300", label: "300 Level" },
    { value: "400", label: "400 Level" },
    { value: "500", label: "500 Level" },
    { value: "600", label: "600 Level (PGD)" },
    { value: "700", label: "700 Level (Masters)" },
    { value: "800", label: "800 Level (PhD)" },
  ].map((l) => (
    <option key={l.value} value={l.value}>{l.label}</option>
  ))}
</select>
              </>
            )}
          </>
        )}

        {status && (
          <div style={{ fontSize: 12.5, marginBottom: 14, color: status.type === "success" ? TOKENS.forest : TOKENS.crimson }}>
            {status.type === "success" && <CheckCircle2 size={14} />}
            {status.message}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "11px", background: TOKENS.forestDeep, color: TOKENS.paper, border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
          <UserPlus size={15} /> {submitting ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}

function CreateCourse() {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("3");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.createCourse({ code, title, unit: Number(unit), department });
      setStatus({ type: "success", message: `Course ${code} created.` });
      setCode("");
      setTitle("");
      setUnit("3");
      setDepartment("");
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 4, padding: 20 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Add course</div>
      <div style={{ fontSize: 12, color: "#6B7268", marginBottom: 18 }}>
        Adds a course to the catalogue so results can be published against it.
      </div>
      <form onSubmit={handleCreate}>
        <label style={labelStyle}>Course code</label>
        <input style={{ ...inputStyle, marginBottom: 14, fontFamily: "'IBM Plex Mono', monospace" }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSC 405" required />

        <label style={labelStyle}>Title</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Compiler Construction" required />

        <label style={labelStyle}>Unit</label>
        <select style={{ ...inputStyle, marginBottom: 14 }} value={unit} onChange={(e) => setUnit(e.target.value)}>
          {[1, 2, 3, 4, 5, 6].map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <label style={labelStyle}>Department</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" required />

        {status && (
          <div style={{ fontSize: 12.5, marginBottom: 14, color: status.type === "success" ? TOKENS.forest : TOKENS.crimson }}>
            {status.type === "success" && <CheckCircle2 size={14} />}
            {status.message}
          </div>
        )}

        <button type="submit" disabled={submitting} style={{ width: "100%", padding: "11px", background: TOKENS.forestDeep, color: TOKENS.paper, border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
          {submitting ? "Creating..." : "Add course"}
        </button>
      </form>
    </div>
  );
}

export default function RegistrarDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState("lookup");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: TOKENS.parchment, fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <div style={{ background: TOKENS.forestDeep, color: TOKENS.paper, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/fusta-logo.png" alt="FUSTA crest" style={{ width: 36, height: 36 }} />
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, lineHeight: 1 }}>FUSTA</div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.12em", color: TOKENS.goldBright, textTransform: "uppercase" }}>Registrar</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowPasswordModal(true)} style={{ background: "transparent", border: `1px solid ${TOKENS.gold}`, color: TOKENS.gold, borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}>
            <KeyRound size={13} /> Change Password
          </button>
          <button onClick={logout} style={{ background: "transparent", border: `1px solid ${TOKENS.gold}`, color: TOKENS.gold, borderRadius: 4, padding: "6px 12px", cursor: "pointer" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[{ id: "lookup", label: "Student Records" }, { id: "create", label: "Create Account" }, { id: "courses", label: "Add Course" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "8px 16px", borderRadius: 4, border: `1px solid ${TOKENS.line}`, background: tab === t.id ? TOKENS.forestDeep : TOKENS.paper, color: tab === t.id ? TOKENS.paper : TOKENS.forestDeep, cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "lookup" ? <TranscriptLookup /> : tab === "create" ? <CreateAccount /> : <CreateCourse />}
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}