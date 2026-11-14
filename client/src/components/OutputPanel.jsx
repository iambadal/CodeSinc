import { useState } from "react";

const IconTerminal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);
const IconInput = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function OutputPanel({
  output,
  isRunning,
  stdin,
  setStdin,
  onClearOutput,
}) {
  const [activeTab, setActiveTab] = useState("output");

  const hasError   = output?.stderr || output?.compile_output;
  const isAccepted = ["Accepted", "Completed", "Done"].includes(output?.status);
  const statusKind = isAccepted ? "success" : hasError ? "error" : "info";

  return (
    <div className="output-panel">
      {/* Header */}
      <div className="output-header">
        <div className="output-tabs">
          <button
            className={`tab-btn${activeTab === "output" ? " active" : ""}`}
            onClick={() => setActiveTab("output")}
            aria-selected={activeTab === "output"}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <IconTerminal />
              Output
            </span>
          </button>
          <button
            className={`tab-btn${activeTab === "stdin" ? " active" : ""}`}
            onClick={() => setActiveTab("stdin")}
            aria-selected={activeTab === "stdin"}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <IconInput />
              Stdin
            </span>
          </button>
        </div>

        <div className="output-controls">
          <div className="output-meta">
            {output?.time   && <span className="metric-chip">⏱ {output.time}</span>}
            {output?.memory && <span className="metric-chip">🧠 {output.memory}</span>}
            {output?.status && (
              <span className={`status-badge ${statusKind}`}>
                {output.status}
              </span>
            )}
          </div>
          {output && (
            <button
              className="icon-btn"
              onClick={onClearOutput}
              title="Clear output"
              aria-label="Clear output"
            >
              <IconTrash />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="output-body">
        {activeTab === "stdin" ? (
          <textarea
            className="stdin-input"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter standard input (stdin) for your program…&#10;Each line is a separate input."
            spellCheck="false"
            aria-label="Standard input"
          />
        ) : (
          <>
            {/* Running */}
            {isRunning && (
              <div className="running-state">
                <span className="spinner" />
                <div>
                  <div className="running-label">Executing…</div>
                  <div className="running-sub">Sending to Judge0 sandbox</div>
                </div>
              </div>
            )}

            {/* Empty */}
            {!isRunning && !output && (
              <div className="placeholder-state">
                <span className="placeholder-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
                <span>
                  Press <span className="kbd">⌘</span><span className="kbd">↵</span> or click <strong>Run</strong> to execute
                </span>
              </div>
            )}

            {/* Results */}
            {!isRunning && output && (
              <div className="output-content">
                {output.stdout && (
                  <div className="output-block">
                    <span className="block-label stdout-label">stdout</span>
                    <pre className="out stdout">{output.stdout}</pre>
                  </div>
                )}
                {output.compile_output && (
                  <div className="output-block">
                    <span className="block-label compile-label">compiler output</span>
                    <pre className="out compile-err">{output.compile_output}</pre>
                  </div>
                )}
                {output.stderr && (
                  <div className="output-block">
                    <span className="block-label stderr-label">stderr</span>
                    <pre className="out stderr">{output.stderr}</pre>
                  </div>
                )}
                {!output.stdout && !output.compile_output && !output.stderr && (
                  <div className="placeholder-state" style={{ height: "auto", paddingTop: 8 }}>
                    Program exited with no output.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
