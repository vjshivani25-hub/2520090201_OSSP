import { useState } from "react";
import "./App.css";

const initialProcesses = [
  { pid: "P1", arrival: 0, burst: 5, priority: 4 },
  { pid: "P2", arrival: 0, burst: 3, priority: 1 },
  { pid: "P3", arrival: 0, burst: 4, priority: 5 },
];

const API_URL = "http://127.0.0.1:8000/api/schedule";

function App() {
  const [processes, setProcesses] = useState(initialProcesses);
  const [mode, setMode] = useState("preemptive");
  const [agingInterval, setAgingInterval] = useState(3);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("Not tested");
  const [comparison, setComparison] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");

  function updateProcess(index, field, value) {
    setProcesses((old) =>
      old.map((p, i) =>
        i === index
          ? {
              ...p,
              [field]:
                field === "pid" ? value : value === "" ? "" : Number(value),
            }
          : p
      )
    );
    setResult(null);
    setComparison(null);
    setError("");
    setCompareError("");
  }

  function addProcess() {
    let nextNumber = 1;
    const existingIds = new Set(processes.map((p) => p.pid.trim()));

    while (existingIds.has(`P${nextNumber}`)) nextNumber++;

    setProcesses((old) => [
      ...old,
      { pid: `P${nextNumber}`, arrival: 0, burst: 4, priority: 3 },
    ]);
    setResult(null);
    setComparison(null);
    setError("");
    setCompareError("");
  }

  function removeProcess(index) {
    setProcesses((old) => old.filter((_, i) => i !== index));
    setResult(null);
    setComparison(null);
    setError("");
    setCompareError("");
  }

  function validateProcesses() {
    if (processes.length === 0) {
      return "Please add at least one process.";
    }

    if (
      processes.some(
        (p) =>
          !p.pid.trim() ||
          p.arrival === "" ||
          p.burst === "" ||
          p.priority === "" ||
          !Number.isFinite(p.arrival) ||
          !Number.isFinite(p.burst) ||
          !Number.isFinite(p.priority) ||
          p.arrival < 0 ||
          p.burst <= 0 ||
          p.priority < 0 ||
          !Number.isInteger(p.arrival) ||
          !Number.isInteger(p.burst) ||
          !Number.isInteger(p.priority)
      )
    ) {
      return "Enter a process ID, integer arrival time >= 0, integer burst time > 0, and integer priority >= 0.";
    }

    if (
      new Set(processes.map((p) => p.pid.trim())).size !== processes.length
    ) {
      return "Each process must have a unique process ID.";
    }

    if (
      agingInterval === "" ||
      !Number.isFinite(Number(agingInterval)) ||
      !Number.isInteger(Number(agingInterval)) ||
      Number(agingInterval) <= 0
    ) {
      return "Priority aging interval must be a positive integer.";
    }

    return "";
  }

  async function requestSchedule(scheduleMode) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        processes: processes.map((p) => ({
          ...p,
          pid: p.pid.trim(),
        })),
        mode: scheduleMode,
        aging_interval: Number(agingInterval),
      }),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The backend returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : Array.isArray(data.detail)
            ? data.detail.map((item) => item.msg).join(", ")
            : "The scheduler request failed."
      );
    }

    if (data.error) {
      throw new Error(data.error);
    }

    if (!Array.isArray(data.processes) || !data.metrics) {
      throw new Error("The backend returned an unexpected response.");
    }

    return data;
  }

  async function runScheduler() {
    setError("");
    setCompareError("");
    setResult(null);
    setComparison(null);

    const validationError = validateProcesses();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const data = await requestSchedule(mode);
      setResult(data);
      setApiStatus("Connected");
    } catch (err) {
      setApiStatus("Connection issue");
      setError(
        `Scheduler request failed. Check that FastAPI is running at http://127.0.0.1:8000. Details: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  async function compareAlgorithms() {
    setCompareError("");
    setComparison(null);

    const validationError = validateProcesses();

    if (validationError) {
      setCompareError(validationError);
      return;
    }

    setCompareLoading(true);

    try {
      const [preemptiveResult, nonPreemptiveResult] = await Promise.all([
        requestSchedule("preemptive"),
        requestSchedule("non-preemptive"),
      ]);

      setComparison({
        preemptive: preemptiveResult,
        nonPreemptive: nonPreemptiveResult,
      });

      setApiStatus("Connected");
    } catch (err) {
      setApiStatus("Connection issue");
      setCompareError(
        `Comparison failed. Check that FastAPI is running. Details: ${err.message}`
      );
    } finally {
      setCompareLoading(false);
    }
  }

  function exportReport() {
    setError("");

    if (!result || !result.processes?.length) {
      setError("Please run the scheduler before exporting a report.");
      return;
    }

    const csvCell = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const headers = [
      "Process ID",
      "Arrival Time",
      "Burst Time",
      "Base Priority",
      "Completion Time",
      "Waiting Time",
      "Turnaround Time",
      "Response Time",
      "Effective Priority",
      "Priority Boost",
      "Maximum Priority Boost",
    ];

    const processRows = result.processes.map((p) => [
      p.pid,
      p.arrival,
      p.burst,
      p.priority,
      p.completion,
      p.waiting,
      p.turnaround,
      p.response,
      p.effective_priority,
      p.priority_boost,
      p.max_priority_boost,
    ]);

    const rows = [
      ["CorePilot Smart CPU Scheduler Report"],
      ["Scheduling Mode", result.mode],
      ["Priority Aging Interval", result.aging_interval],
      [],
      headers,
      ...processRows,
      [],
      ["Performance Metrics", "Value"],
      ["Average Waiting Time", result.metrics.average_waiting],
      ["Average Turnaround Time", result.metrics.average_turnaround],
      ["Average Response Time", result.metrics.average_response],
      ["CPU Utilization (%)", result.metrics.cpu_utilization ?? "N/A"],
      [
        "Throughput (processes per time unit)",
        result.metrics.throughput ?? "N/A",
      ],
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "CorePilot_Scheduling_Report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const colors = [
    "#7c6cf2",
    "#18a999",
    "#ef9b45",
    "#e76f9a",
    "#3995d8",
  ];

  function processColor(pid) {
    if (pid === "IDLE") return "#94a3b8";

    const number = Number(String(pid).replace(/\D/g, "")) || 1;
    return colors[(number - 1) % colors.length];
  }

  const totalTime =
    result?.timeline?.reduce(
      (max, segment) => Math.max(max, segment.end),
      0
    ) || 1;

  const agingResults = result?.processes ?? [];

  const totalPriorityBoost = agingResults.reduce(
    (sum, p) => sum + (p.priority_boost ?? 0),
    0
  );

  const processesHelped = agingResults.filter(
    (p) => (p.priority_boost ?? 0) > 0
  ).length;

  const statusText =
    apiStatus === "Connected"
      ? "FastAPI connected"
      : apiStatus === "Connection issue"
        ? "Connection issue"
        : "API not tested";

  function metricValue(data, key) {
    const value = data?.metrics?.[key];

    return value === undefined || value === null || !Number.isFinite(Number(value))
      ? "—"
      : Number(value).toFixed(2);
  }

  function winnerLabel(a, b, higherIsBetter = false) {
    const left = Number(a);
    const right = Number(b);

    if (!Number.isFinite(left) || !Number.isFinite(right)) {
      return "—";
    }

    if (left === right) return "Tie";

    if (higherIsBetter) {
      return left > right ? "Preemptive" : "Non-preemptive";
    }

    return left < right ? "Preemptive" : "Non-preemptive";
  }

  function comparisonRow(label, key, higherIsBetter = false) {
    const preemptive = comparison?.preemptive?.metrics?.[key];
    const nonPreemptive = comparison?.nonPreemptive?.metrics?.[key];

    return (
      <tr key={key}>
        <td>{label}</td>
        <td>{metricValue(comparison.preemptive, key)}</td>
        <td>{metricValue(comparison.nonPreemptive, key)}</td>
        <td>{winnerLabel(preemptive, nonPreemptive, higherIsBetter)}</td>
      </tr>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">◈</div>
          <div>
            <strong>CorePilot</strong>
            <span>CPU INTELLIGENCE</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <a className="nav-item active" href="#overview">
          ▦ <span>Overview</span>
        </a>
        <a className="nav-item" href="#processes">
          ▤ <span>Process Manager</span>
        </a>
        <a className="nav-item" href="#timeline">
          ◷ <span>Gantt Timeline</span>
        </a>
        <a className="nav-item" href="#aging">
          ↗ <span>Priority Aging</span>
        </a>
        <a className="nav-item" href="#metrics">
          ⌁ <span>Performance</span>
        </a>
        <a className="nav-item" href="#comparison">
          ⇄ <span>Compare Algorithms</span>
        </a>

        <div className="sidebar-bottom">
          <div
            className="status-dot"
            style={{
              background:
                apiStatus === "Connected"
                  ? "#18a999"
                  : apiStatus === "Connection issue"
                    ? "#ef5350"
                    : "#94a3b8",
            }}
          />

          <div>
            <strong>Scheduler API</strong>
            <span>{statusText}</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> CPU Scheduler
          </div>

          <div className="topbar-right">
            <span className="live-pill">
              <i
                style={{
                  background:
                    apiStatus === "Connected"
                      ? "#18a999"
                      : apiStatus === "Connection issue"
                        ? "#ef5350"
                        : "#94a3b8",
                }}
              />

              {apiStatus === "Connected"
                ? "API CONNECTED"
                : apiStatus === "Connection issue"
                  ? "API ISSUE"
                  : "API NOT TESTED"}
            </span>

            <div className="avatar">A</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">
              <span>✳</span> INTELLIGENT CPU MANAGEMENT
            </div>

            <h1>Smart CPU Scheduler</h1>

            <p>
              Simulate process execution, adapt priorities dynamically, and
              understand CPU performance in real time.
            </p>
          </div>

          <div className="hero-symbol">◈</div>
        </section>

        <section className="overview-cards">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total processes</span>
              <span className="stat-icon purple">▤</span>
            </div>

            <div className="stat-value">
              {processes.length.toString().padStart(2, "0")}
            </div>

            <div className="stat-note">Processes in this simulation</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Scheduling mode</span>
              <span className="stat-icon green">↗</span>
            </div>

            <div className="stat-value mode-value">
              {mode === "preemptive" ? "Preemptive" : "Non-preemptive"}
            </div>

            <div className="stat-note">Priority-based execution</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Priority aging</span>
              <span className="stat-icon orange">◷</span>
            </div>

            <div className="stat-value">
              {agingInterval} <small>units</small>
            </div>

            <div className="stat-note">
              Waiting interval for priority boost
            </div>
          </div>
        </section>

        <section className="panel" id="processes">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">CONFIGURATION</div>
              <h2>Process Manager</h2>
              <p>Configure the processes before running the simulation.</p>
            </div>

            <button className="secondary-button" onClick={addProcess}>
              ＋ Add process
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PROCESS</th>
                  <th>ARRIVAL TIME</th>
                  <th>BURST TIME</th>
                  <th>BASE PRIORITY</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {processes.map((p, index) => (
                  <tr key={`${index}-${p.pid}`}>
                    <td>
                      <div className="process-label">
                        <span
                          className="process-dot"
                          style={{ background: processColor(p.pid) }}
                        />

                        <input
                          aria-label={`Process ID ${index + 1}`}
                          className="pid-input"
                          value={p.pid}
                          onChange={(e) =>
                            updateProcess(index, "pid", e.target.value)
                          }
                        />
                      </div>
                    </td>

                    <td>
                      <input
                        aria-label={`Arrival time for ${p.pid}`}
                        type="number"
                        min="0"
                        step="1"
                        value={p.arrival}
                        onChange={(e) =>
                          updateProcess(index, "arrival", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        aria-label={`Burst time for ${p.pid}`}
                        type="number"
                        min="1"
                        step="1"
                        value={p.burst}
                        onChange={(e) =>
                          updateProcess(index, "burst", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <input
                        aria-label={`Base priority for ${p.pid}`}
                        type="number"
                        min="0"
                        step="1"
                        value={p.priority}
                        onChange={(e) =>
                          updateProcess(index, "priority", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <button
                        className="remove-button"
                        title={`Remove ${p.pid}`}
                        onClick={() => removeProcess(index)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="configuration-row">
            <label className="field-group">
              <span>Scheduling algorithm</span>

              <select
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setResult(null);
                  setComparison(null);
                }}
              >
                <option value="preemptive">Preemptive Priority</option>
                <option value="non-preemptive">
                  Non-preemptive Priority
                </option>
              </select>
            </label>

            <label className="field-group aging-field">
              <span>Priority aging interval</span>

              <input
                type="number"
                min="1"
                step="1"
                value={agingInterval}
                onChange={(e) => {
                  setAgingInterval(
                    e.target.value === "" ? "" : Number(e.target.value)
                  );
                  setResult(null);
                  setComparison(null);
                }}
              />
            </label>

            <button
              className="run-button"
              onClick={runScheduler}
              disabled={loading || compareLoading}
            >
              {loading ? "Running simulation..." : "▶ Run scheduler"}
            </button>
          </div>

          <div className="formula-note">
            <span className="formula-icon">ⓘ</span>
            <span>
              <strong>Dynamic priority:</strong> A smaller number means a
              higher priority. Waiting processes receive priority boosts based
              on the aging interval.
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}
        </section>

        <section className="panel timeline-panel" id="timeline">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">EXECUTION VISUALIZATION</div>
              <h2>CPU Gantt Timeline</h2>
              <p>
                {result
                  ? "Completed simulation · time units"
                  : "Run the scheduler to generate the execution timeline."}
              </p>
            </div>

            {result && (
              <span className="success-pill">✓ Simulation complete</span>
            )}
          </div>

          {result && result.timeline?.length > 0 ? (
            <>
              <div className="gantt-chart">
                {result.timeline.map((segment, i) => {
                  const width =
                    ((segment.end - segment.start) / totalTime) * 100;

                  return (
                    <div
                      className="gantt-segment"
                      key={`${segment.pid}-${segment.start}-${i}`}
                      style={{
                        width: `${width}%`,
                        background: processColor(segment.pid),
                      }}
                      title={`${segment.pid}: ${segment.start}–${segment.end}`}
                    >
                      <strong>{segment.pid}</strong>
                      <span>{segment.end - segment.start} units</span>
                    </div>
                  );
                })}
              </div>

              <div className="timeline-ticks">
                {result.timeline.map((segment, i) => (
                  <span
                    key={`${segment.start}-${i}`}
                    style={{
                      left: `${(segment.start / totalTime) * 100}%`,
                    }}
                  >
                    {segment.start}
                  </span>
                ))}

                <span className="last-tick">{totalTime}</span>
              </div>

              <div className="legend">
                {[...new Set(result.timeline.map((s) => s.pid))].map((pid) => (
                  <span key={pid}>
                    <i style={{ background: processColor(pid) }} />
                    {pid}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">▥</div>
              <strong>Your timeline will appear here</strong>
              <span>
                Configure your processes and select “Run scheduler” to
                visualize CPU execution.
              </span>
            </div>
          )}
        </section>

        <section className="panel" id="aging">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">
                DYNAMIC PRIORITY INTELLIGENCE
              </div>
              <h2>Priority Aging Analysis</h2>
              <p>
                See how waiting time improves process priority during
                scheduling.
              </p>
            </div>

            {result && <span className="success-pill">✓ Analysis ready</span>}
          </div>

          {result ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <div
                  style={{
                    background: "rgba(124,108,242,.09)",
                    border: "1px solid rgba(124,108,242,.2)",
                    borderRadius: 14,
                    padding: 17,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#8b83b8" }}>
                    Processes analyzed
                  </div>
                  <div
                    style={{
                      fontSize: 27,
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                  >
                    {agingResults.length}
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(24,169,153,.09)",
                    border: "1px solid rgba(24,169,153,.22)",
                    borderRadius: 14,
                    padding: 17,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#168f82" }}>
                    Processes with a boost
                  </div>
                  <div
                    style={{
                      fontSize: 27,
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                  >
                    {processesHelped}
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {" "}
                      of {agingResults.length}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(239,155,69,.09)",
                    border: "1px solid rgba(239,155,69,.22)",
                    borderRadius: 14,
                    padding: 17,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#b8782b" }}>
                    Total priority improvement
                  </div>
                  <div
                    style={{
                      fontSize: 27,
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                  >
                    +{totalPriorityBoost}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(235px, 1fr))",
                  gap: 15,
                }}
              >
                {agingResults.map((p) => {
                  const basePriority = Number(p.priority);
                  const effectivePriority = Number(
                    p.effective_priority ?? p.priority
                  );
                  const boost = Number(p.priority_boost ?? 0);
                  const maxBoost = Number(p.max_priority_boost ?? boost);
                  const improved = boost > 0;

                  return (
                    <article
                      key={p.pid}
                      style={{
                        border:
                          "1px solid var(--border-color, rgba(128,128,128,.22))",
                        borderRadius: 15,
                        padding: 18,
                        minWidth: 0,
                        background: "var(--card-background, transparent)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 19,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: processColor(p.pid),
                            }}
                          />
                          <strong style={{ fontSize: 17 }}>{p.pid}</strong>
                        </div>

                        <span
                          style={{
                            borderRadius: 20,
                            padding: "5px 9px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: improved ? "#16845e" : "#64748b",
                            background: improved
                              ? "rgba(22,163,74,.11)"
                              : "rgba(148,163,184,.14)",
                          }}
                        >
                          {improved ? `↑ +${boost} boost` : "No boost"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 17,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted-color, #888)",
                              marginBottom: 6,
                            }}
                          >
                            Base priority
                          </div>
                          <div style={{ fontSize: 25, fontWeight: 700 }}>
                            {basePriority}
                          </div>
                        </div>

                        <span style={{ fontSize: 20, color: "#18a999" }}>
                          →
                        </span>

                        <div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted-color, #888)",
                              marginBottom: 6,
                            }}
                          >
                            Effective priority
                          </div>
                          <div
                            style={{
                              fontSize: 25,
                              fontWeight: 700,
                              color: improved ? "#18a999" : "inherit",
                            }}
                          >
                            {effectivePriority}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          height: 1,
                          background:
                            "var(--border-color, rgba(128,128,128,.18))",
                          margin: "12px 0",
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          fontSize: 12,
                          marginTop: 12,
                        }}
                      >
                        <span style={{ color: "var(--muted-color, #888)" }}>
                          Maximum boost recorded
                        </span>
                        <strong>+{maxBoost}</strong>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          fontSize: 12,
                          marginTop: 9,
                        }}
                      >
                        <span style={{ color: "var(--muted-color, #888)" }}>
                          Waiting time
                        </span>
                        <strong>{p.waiting} units</strong>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: "14px 16px",
                  borderRadius: 11,
                  background: "rgba(124,108,242,.07)",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                <strong>How to read this analysis:</strong> A smaller priority
                number means a higher priority. When a process waits, aging can
                reduce its effective priority number, helping it compete for
                CPU time. The boost values above are taken from your scheduler
                API response.
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">↗</div>
              <strong>Priority analysis will appear here</strong>
              <span>
                Configure your processes and click “Run scheduler” to compare
                base priorities, effective priorities, and aging boosts.
              </span>
            </div>
          )}
        </section>

        <section className="metrics-grid" id="metrics">
          <div className="panel metric-panel">
            <div className="section-kicker">PERFORMANCE ANALYSIS</div>
            <h2>Scheduling Metrics</h2>
            <p className="muted">
              Performance values from the latest simulation.
            </p>

            <div className="metric-row">
              <div>
                <span>Average waiting time</span>
                <strong>
                  {result ? result.metrics.average_waiting : "—"}
                </strong>
              </div>
              <span className="metric-symbol purple">◷</span>
            </div>

            <div className="metric-row">
              <div>
                <span>Average turnaround time</span>
                <strong>
                  {result ? result.metrics.average_turnaround : "—"}
                </strong>
              </div>
              <span className="metric-symbol green">↗</span>
            </div>

            <div className="metric-row">
              <div>
                <span>Average response time</span>
                <strong>
                  {result ? result.metrics.average_response : "—"}
                </strong>
              </div>
              <span className="metric-symbol orange">⌁</span>
            </div>

            <div className="metric-row">
              <div>
                <span>CPU Utilization</span>
                <strong>
                  {result &&
                  result.metrics.cpu_utilization !== undefined
                    ? `${result.metrics.cpu_utilization}%`
                    : "—"}
                </strong>
              </div>
              <span className="metric-symbol purple">◈</span>
            </div>

            <div className="metric-row">
              <div>
                <span>Throughput</span>
                <strong>
                  {result && result.metrics.throughput !== undefined
                    ? result.metrics.throughput
                    : "—"}
                </strong>
              </div>
              <span className="metric-symbol green">↗</span>
            </div>

            <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
              Throughput is measured in processes per time unit.
            </p>
          </div>

          <div className="panel result-panel">
            <div className="section-kicker">PROCESS BREAKDOWN</div>
            <h2>Execution Summary</h2>
            <p className="muted">
              Detailed timing information for each process.
            </p>

            {result && (
              <button
                className="secondary-button"
                onClick={exportReport}
                style={{ marginBottom: 16 }}
              >
                ⬇ Export Scheduling Report
              </button>
            )}

            {result ? (
              <div className="summary-table-wrap">
                <table className="summary-table">
                  <thead>
                    <tr>
                      <th>Process</th>
                      <th>Arrival</th>
                      <th>Burst</th>
                      <th>Priority</th>
                      <th>Completion</th>
                      <th>Waiting</th>
                      <th>Turnaround</th>
                      <th>Response</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.processes.map((p) => (
                      <tr key={p.pid}>
                        <td>
                          <span
                            className="summary-dot"
                            style={{ background: processColor(p.pid) }}
                          />
                          {p.pid}
                        </td>
                        <td>{p.arrival ?? "—"}</td>
                        <td>{p.burst ?? "—"}</td>
                        <td>{p.priority ?? "—"}</td>
                        <td>{p.completion ?? "—"}</td>
                        <td>{p.waiting ?? "—"}</td>
                        <td>{p.turnaround ?? "—"}</td>
                        <td>{p.response ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="summary-empty">
                Your process-level results will appear after simulation.
              </div>
            )}
          </div>
        </section>

        <section className="panel" id="comparison">
          <div className="panel-heading">
            <div>
              <div className="section-kicker">ALGORITHM LAB</div>
              <h2>Performance Comparison</h2>
              <p>
                Run both scheduling algorithms on the same process inputs and
                compare their performance metrics.
              </p>
            </div>

            <button
              className="run-button"
              onClick={compareAlgorithms}
              disabled={compareLoading || loading}
            >
              {compareLoading ? "Comparing..." : "⇄ Compare algorithms"}
            </button>
          </div>

          <div className="formula-note">
            <span className="formula-icon">ⓘ</span>
            <span>
              Both modes use the same processes and aging interval. Lower
              waiting, turnaround, and response times are generally preferable.
              Higher CPU utilization and throughput are generally preferable.
            </span>
          </div>

          {compareError && (
            <div className="error-message">{compareError}</div>
          )}

          {comparison ? (
            <div className="table-wrap" style={{ marginTop: 18 }}>
              <table>
                <thead>
                  <tr>
                    <th>METRIC</th>
                    <th>PREEMPTIVE</th>
                    <th>NON-PREEMPTIVE</th>
                    <th>BETTER VALUE</th>
                  </tr>
                </thead>

                <tbody>
                  {comparisonRow(
                    "Average waiting time",
                    "average_waiting"
                  )}
                  {comparisonRow(
                    "Average turnaround time",
                    "average_turnaround"
                  )}
                  {comparisonRow(
                    "Average response time",
                    "average_response"
                  )}
                  {comparisonRow(
                    "CPU Utilization (%)",
                    "cpu_utilization",
                    true
                  )}
                  {comparisonRow(
                    "Throughput",
                    "throughput",
                    true
                  )}
                </tbody>
              </table>

              <p className="muted" style={{ marginTop: 14 }}>
                Comparison complete. Lower average times and higher CPU
                utilization or throughput are generally preferred. A tie means
                both algorithms produced the same value.
              </p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">⇄</div>
              <strong>Your comparison will appear here</strong>
              <span>
                Click “Compare algorithms” to run both modes with the current
                process configuration.
              </span>
            </div>
          )}
        </section>

        <footer>
          <span>
            COREPILOT <span className="footer-divider">/</span> SMART CPU
            SCHEDULER
          </span>
          <span>Built for intelligent process scheduling</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
