import { useState } from "react";

export default function OutputPanel({
  output,
  isRunning,
  stdin,
  setStdin,
  onClearOutput,
}) {
  const [activeTab, setActiveTab] = useState("output");

  const hasError = output?.stderr || output?.compile_output;
  const isAccepted = output?.status === "Accepted" || output?.status === "Completed" || output?.status === "Done";

  return (
    <div className="output-panel">
      <div className="output-header">
        <div className="output-tabs">
          <button
            className={`tab-btn ${activeTab === "output" ? "active" : ""}`}
            onClick={() => setActiveTab("output")}
          >
            Output
          </button>
          <button
            className={`tab-btn ${activeTab === "stdin" ? "active" : ""}`}
            onClick={() => setActiveTab("stdin")}
          >
            Standard Input (stdin)
          </button>
        </div>

        <div className="output-meta">
          {output?.time && <span className="metric-tag">Time: {output.time}</span>}
          {output?.memory && <span className="metric-tag">Mem: {output.memory}</span>}
          {output?.status && (
            <span
              className={`status-badge ${
                isAccepted ? "success" : hasError ? "error" : "info"
              }`}
            >
              {output.status}
            </span>
          )}
          {output && (
            <button className="clear-btn" onClick={onClearOutput} title="Clear Output">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="output-body">
        {activeTab === "stdin" ? (
          <textarea
            className="stdin-input"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter standard input (stdin) for your program..."
          />
        ) : (
          <>
            {isRunning && (
              <div className="running-state">
                <span className="spinner" /> Executing code...
              </div>
            )}

            {!isRunning && !output && (
              <div className="placeholder-state">
                <span>Press Cmd/Ctrl + Enter or click Run to execute code</span>
              </div>
            )}

            {!isRunning && output && (
              <div className="output-content">
                {output.stdout && (
                  <pre className="out stdout">{output.stdout}</pre>
                )}
                {output.compile_output && (
                  <div className="output-block">
                    <span className="block-label">Compiler Output:</span>
                    <pre className="out compile-err">{output.compile_output}</pre>
                  </div>
                )}
                {output.stderr && (
                  <div className="output-block">
                    <span className="block-label">Standard Error:</span>
                    <pre className="out stderr">{output.stderr}</pre>
                  </div>
                )}
                {!output.stdout && !output.compile_output && !output.stderr && (
                  <span className="placeholder-state">Program executed with no output.</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
