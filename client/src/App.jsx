import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Palmtree,
  BriefcaseMedical,
  ClipboardList,
  CheckCircle2,
  Clock3,
  XCircle,
  Users,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";
const initialBalances = { "Casual Leave": 10, "Medical Leave": 10 };
const totalMax =
  initialBalances["Casual Leave"] + initialBalances["Medical Leave"];

const FILTERS = [
  { value: "All", label: "All" },
  { value: "Pending Approval", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function App() {
  const [page, setPage] = useState("employee");
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [days, setDays] = useState("1");
  const [reason, setReason] = useState("");
  const [employeeName, setEmployeeName] = useState("Employee");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const loadLeaves = async () => {
    try {
      const response = await fetch(`${API}/api/leaves`);
      if (!response.ok) throw new Error("API unavailable");
      setLeaves(await response.json());
    } catch {
      setMessage(
        "Unable to connect to the server. Check the backend URL and MongoDB connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const used = useMemo(() => {
    const totals = { "Casual Leave": 0, "Medical Leave": 0 };
    leaves
      .filter((item) => item.status === "Approved")
      .forEach((item) => {
        totals[item.leaveType] += Number(item.days || 0);
      });
    return totals;
  }, [leaves]);

  const balance = (type) => Math.max(0, initialBalances[type] - used[type]);
  const pending = leaves.filter(
    (item) => item.status === "Pending Approval",
  ).length;
  const approved = leaves.filter((item) => item.status === "Approved").length;
  const rejected = leaves.filter((item) => item.status === "Rejected").length;
  const counts = {
    All: leaves.length,
    "Pending Approval": pending,
    Approved: approved,
    Rejected: rejected,
  };
  const filteredLeaves =
    filter === "All" ? leaves : leaves.filter((item) => item.status === filter);

  async function submitLeave(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await fetch(`${API}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveType, days, reason, employeeName }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to submit request.");
      setReason("");
      setDays("1");
      setMessage("Leave request submitted successfully.");
      await loadLeaves();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(`${API}/api/leaves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Update failed.");
      setLeaves((current) =>
        current.map((item) => (item._id === id ? data : item)),
      );
      setMessage(`Request ${status.toLowerCase()}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const dateText = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const statusClass = (status) =>
    status === "Approved"
      ? "approved"
      : status === "Rejected"
        ? "rejected"
        : "pending";

  const isSuccess =
    message.includes("successfully") ||
    message.includes("approved") ||
    message.includes("rejected");

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <span className="logo" aria-hidden="true">
              L
            </span>
            <div className="brand-text">
              <h1>LeaveEase</h1>
              <p>Employee Leave Management System</p>
            </div>
          </div>
          <nav className="portal-switch" aria-label="Portal">
            <button
              className={page === "employee" ? "active" : ""}
              aria-current={page === "employee" ? "page" : undefined}
              onClick={() => setPage("employee")}
            >
              Employee
            </button>
            <button
              className={page === "admin" ? "active" : ""}
              aria-current={page === "admin" ? "page" : undefined}
              onClick={() => setPage("admin")}
            >
              Admin
            </button>
          </nav>
        </div>
      </header>

      <main className="container main-area">
        {page === "employee" ? (
          <>
            <section className="page-head">
              <p className="eyebrow">Employee portal</p>
              <h2>Welcome back, {employeeName || "Employee"}</h2>
              <p>Apply for leave and keep track of your balance.</p>
            </section>

            <div className="balance-grid">
              <BalanceCard
                icon={<Palmtree />}
                label="Casual Leave"
                value={balance("Casual Leave")}
                max={initialBalances["Casual Leave"]}
              />
              <BalanceCard
                icon={<BriefcaseMedical />}
                label="Medical Leave"
                value={balance("Medical Leave")}
                max={initialBalances["Medical Leave"]}
              />
              <BalanceCard
                icon={<CalendarDays />}
                label="Total Available"
                value={balance("Casual Leave") + balance("Medical Leave")}
                max={totalMax}
                total
              />
            </div>

            <div className="employee-grid">
              <section className="panel history-panel">
                <div className="panel-heading">
                  <h3>Leave history</h3>
                  <p>Your submitted leave applications.</p>
                </div>
                {loading ? (
                  <div className="empty-state" role="status">
                    Loading applications...
                  </div>
                ) : leaves.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon" aria-hidden="true">
                      <ClipboardList size={22} />
                    </span>
                    <strong>No applications yet</strong>
                    <span>Your leave requests will appear here.</span>
                  </div>
                ) : (
                  <div className="request-list">
                    {leaves.map((item) => (
                      <RequestCard
                        key={item._id}
                        item={item}
                        dateText={dateText}
                        statusClass={statusClass}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="panel form-panel">
                <div className="panel-heading">
                  <h3>Apply for leave</h3>
                  <p>Fill in the details to submit your request.</p>
                </div>
                <form onSubmit={submitLeave}>
                  <div className="field">
                    <label htmlFor="employeeName">Employee name</label>
                    <input
                      id="employeeName"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="leaveType">Leave type</label>
                      <select
                        id="leaveType"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                      >
                        <option>Casual Leave</option>
                        <option>Medical Leave</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="days">Days</label>
                      <input
                        id="days"
                        type="number"
                        min="1"
                        max={balance(leaveType)}
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        aria-describedby="days-hint"
                        required
                      />
                    </div>
                  </div>
                  <p className="hint" id="days-hint">
                    {balance(leaveType)} days available for {leaveType}
                  </p>
                  <div className="field">
                    <label htmlFor="reason">Reason</label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter your reason..."
                      rows="4"
                      required
                    />
                  </div>
                  <button
                    className="primary-btn"
                    type="submit"
                    disabled={
                      Number(days) < 1 || Number(days) > balance(leaveType)
                    }
                  >
                    Submit request
                  </button>
                </form>
              </section>
            </div>
          </>
        ) : (
          <>
            <section className="page-head">
              <p className="eyebrow">Admin portal</p>
              <h2>Admin dashboard</h2>
              <p>Review employee leave requests and update their status.</p>
            </section>

            <div className="stats-grid">
              <StatCard
                icon={<Clock3 />}
                label="Awaiting approval"
                value={pending}
                tone="pending"
              />
              <StatCard
                icon={<CheckCircle2 />}
                label="Approved"
                value={approved}
                tone="approved"
              />
              <StatCard
                icon={<XCircle />}
                label="Rejected"
                value={rejected}
                tone="rejected"
              />
            </div>

            <section className="panel admin-panel">
              <div className="panel-top">
                <div className="panel-heading">
                  <h3>Leave requests</h3>
                  <p>Review requests and update their status.</p>
                </div>
                <div
                  className="filters"
                  role="group"
                  aria-label="Filter requests"
                >
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      className={filter === f.value ? "active" : ""}
                      aria-pressed={filter === f.value}
                      onClick={() => setFilter(f.value)}
                    >
                      {f.label}
                      <span>{counts[f.value]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="empty-state" role="status">
                  Loading requests...
                </div>
              ) : filteredLeaves.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">
                    <Users size={22} />
                  </span>
                  <strong>No leave requests here</strong>
                  <span>
                    {filter === "All"
                      ? "New requests will show up as employees apply."
                      : "Try a different filter."}
                  </span>
                </div>
              ) : (
                <div className="request-list">
                  {filteredLeaves.map((item) => (
                    <article className="request-row" key={item._id}>
                      <div className="avatar" aria-hidden="true">
                        {initials(item.employeeName)}
                      </div>
                      <div className="request-body">
                        <div className="request-title">
                          <strong>{item.employeeName}</strong>
                          <span className="type-tag">{item.leaveType}</span>
                        </div>
                        <p className="request-meta">
                          {item.days} day(s) · Applied{" "}
                          {dateText(item.createdAt)}
                        </p>
                        <p className="reason">{item.reason}</p>
                      </div>
                      <div className="request-side">
                        <span className={`status ${statusClass(item.status)}`}>
                          {item.status}
                        </span>
                        {item.status === "Pending Approval" && (
                          <div className="actions">
                            <button
                              className="approve-btn"
                              onClick={() => updateStatus(item._id, "Approved")}
                              aria-label={`Approve request from ${item.employeeName}`}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => updateStatus(item._id, "Rejected")}
                              aria-label={`Reject request from ${item.employeeName}`}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <div className="toast-region" aria-live="polite">
          {message && (
            <div className={`notice ${isSuccess ? "success" : ""}`}>
              <span>{message}</span>
              <button
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <footer>LeaveEase · Employee Leave Management</footer>
      </main>
    </div>
  );
}

function BalanceCard({ icon, label, value, max, total }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <section className={`balance-card ${total ? "total" : ""}`}>
      <div className="balance-top">
        <div className="card-icon">{icon}</div>
        <p>{label}</p>
      </div>
      <div className="balance-number">
        {value}
        <span>{total ? "days available" : `of ${max} days left`}</span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label={`${label} remaining`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, tone }) {
  return (
    <section className={`stat-card ${tone}`}>
      <div className="stat-label">
        <span className="stat-icon" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </section>
  );
}

function RequestCard({ item, dateText, statusClass }) {
  const Icon =
    item.status === "Approved"
      ? CheckCircle2
      : item.status === "Rejected"
        ? XCircle
        : Clock3;
  return (
    <article className="history-item">
      <div
        className={`history-icon ${statusClass(item.status)}`}
        aria-hidden="true"
      >
        <Icon size={17} />
      </div>
      <div className="history-body">
        <div className="request-top">
          <strong>{item.leaveType}</strong>
          <span className={`status ${statusClass(item.status)}`}>
            {item.status}
          </span>
        </div>
        <p className="request-meta">
          {item.days} day(s) · Applied {dateText(item.createdAt)}
        </p>
        <p className="reason">{item.reason}</p>
      </div>
    </article>
  );
}

export default App;
