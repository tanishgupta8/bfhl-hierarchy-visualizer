import React, { useState } from 'react';
import { 
  Network, 
  HelpCircle, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  Sparkles, 
  Code, 
  User, 
  Mail, 
  Hash, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Github
} from 'lucide-react';

const PRESETS = [
  { name: "Sample Tree", data: "A->B, A->C, B->D" },
  { name: "Cycle Loop", data: "A->B\nB->C\nC->A" },
  { name: "Multi-Parent", data: "A->C, B->C, A->B" },
  { name: "Duplicates", data: "A->B, A->C, A->B, A->C, B->D" },
  { name: "Invalids", data: "A->A, XY->Z, A->, C-D, E->F" },
  { name: "Mixed Complex", data: "A->B, B->C, D->E, E->F, F->D, G->H, I->H, X->Y, Z->Y" }
];

// Recursive Tree Branch Component
const TreeBranch = ({ node, tree, isRootNode = false }) => {
  const children = tree[node] || [];
  return (
    <div className="tree-node-wrapper">
      <div className={`tree-node ${isRootNode ? 'is-root' : ''}`} title={isRootNode ? 'Root Node' : `Node ${node}`}>
        {node}
      </div>
      {children.length > 0 && (
        <div className="tree-children">
          {children.map(child => (
            <TreeBranch key={child} node={child} tree={tree} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [inputText, setInputText] = useState(PRESETS[0].data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Set API base url dynamically (fallback to local server)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const parseInput = (text) => {
    // Split by commas or newlines
    const rawEntries = text.split(/[,\n]/);
    return rawEntries
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const parsedData = parseInput(inputText);
    
    if (parsedData.length === 0) {
      setError("Please enter at least one relationship edge (e.g., A->B).");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bfhl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedData }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse relationships.");
      }

      setApiResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to connect to the backend server. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetText) => {
    setInputText(presetText);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header section with challenge titles and developer profile */}
      <header className="header">
        <h1>Chitkara Full Stack Challenge</h1>
        <p>Interactive graph and hierarchical tree builder. Input node connections and build multiple independent components, resolve multi-parent relationships, and detect cyclic components.</p>
        
        <div className="profile-badges">
          <div className="profile-badge profile-badge-accent">
            <User size={14} />
            <span>Developer: <strong>{apiResult?.user_id || 'tanishgupta_08012005'}</strong></span>
          </div>
          <div className="profile-badge">
            <Mail size={14} />
            <span>{apiResult?.email_id || 'tanish1063.be23@chitkara.edu.in'}</span>
          </div>
          <div className="profile-badge">
            <Hash size={14} />
            <span>Roll: <strong>{apiResult?.college_roll_number || '2310991063'}</strong></span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="workspace-grid">
        {/* Left Side: Input Panel */}
        <section className="glass-panel">
          <h2 className="form-title">
            <Network size={20} className="text-indigo-400" />
            Graph Input
          </h2>

          <div className="form-group">
            <label className="form-label">Quick Presets</label>
            <div className="presets-container">
              {PRESETS.map((p, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="preset-btn"
                  onClick={() => loadPreset(p.data)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="relations-input">
                Node Relationships (Comma or Newline separated)
              </label>
              <textarea
                id="relations-input"
                className="textarea-input"
                placeholder="A->B&#10;A->C&#10;B->D"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            {error && (
              <div className="error-alert">
                <AlertTriangle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Build Hierarchies</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Side: Visualizing Results */}
        <section className="glass-panel">
          {isLoading && (
            <div className="loader-container">
              <div className="loader-spinner"></div>
              <div className="loader-text">Compiling Graph Structures...</div>
            </div>
          )}

          {!isLoading && !apiResult && (
            <div className="loader-container">
              <HelpCircle size={48} style={{ color: 'var(--primary)', opacity: 0.5 }} />
              <div className="loader-text" style={{ animation: 'none' }}>Enter relationships and click "Build Hierarchies"</div>
            </div>
          )}

          {!isLoading && apiResult && (
            <div className="results-section">
              {/* Stats Counters Summary */}
              <div className="stats-grid">
                <div className="stat-card trees">
                  <div className="stat-val">{apiResult.summary.total_trees}</div>
                  <div className="stat-lbl">Trees</div>
                </div>
                <div className="stat-card cycles">
                  <div className="stat-val">{apiResult.summary.total_cycles}</div>
                  <div className="stat-lbl">Cycles</div>
                </div>
                <div className="stat-card largest">
                  <div className="stat-val">{apiResult.summary.largest_tree_root || "N/A"}</div>
                  <div className="stat-lbl">Largest Root</div>
                </div>
              </div>

              {/* Hierarchies Visualization */}
              <div>
                <h3 className="section-card-title">
                  <Layers size={18} />
                  Detected Hierarchies ({apiResult.hierarchies.length})
                </h3>

                {apiResult.hierarchies.length === 0 ? (
                  <p className="empty-placeholder">No components found. Add valid relationships above.</p>
                ) : (
                  <div className="trees-container-grid">
                    {apiResult.hierarchies.map((h, idx) => (
                      <div key={idx} className="tree-card">
                        <div className="tree-card-header">
                          <h4 className="tree-card-title">
                            Component {idx + 1}: Root <strong>{h.root}</strong>
                          </h4>
                          {h.has_cycle ? (
                            <span className="badge badge-rose">Cycle</span>
                          ) : (
                            <span className="badge badge-blue">Depth {h.depth}</span>
                          )}
                        </div>

                        {h.has_cycle ? (
                          <div className="cycle-card-body">
                            <div className="cycle-nodes-ring">{h.root}</div>
                            <p className="cycle-text">
                              This connected component contains a cycle. Loop detected near node <strong>{h.root}</strong>.
                            </p>
                          </div>
                        ) : (
                          <div className="tree-viewport">
                            <div className="tree-container">
                              <TreeBranch node={h.root} tree={h.tree} isRootNode={true} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Valids, Invalids, and Duplicates summary lists */}
              <div className="pills-grid">
                {/* Invalid Entries */}
                <div>
                  <h4 className="form-label" style={{ color: 'var(--accent-rose)' }}>
                    Invalid Entries ({apiResult.invalid_entries.length})
                  </h4>
                  {apiResult.invalid_entries.length === 0 ? (
                    <p className="empty-placeholder">None</p>
                  ) : (
                    <div className="pills-container">
                      {apiResult.invalid_entries.map((val, i) => (
                        <span key={i} className="warning-pill">{val || '""'}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duplicate Edges */}
                <div>
                  <h4 className="form-label" style={{ color: 'var(--accent-amber)' }}>
                    Duplicate Edges ({apiResult.duplicate_edges.length})
                  </h4>
                  {apiResult.duplicate_edges.length === 0 ? (
                    <p className="empty-placeholder">None</p>
                  ) : (
                    <div className="pills-container">
                      {apiResult.duplicate_edges.map((val, i) => (
                        <span key={i} className="amber-pill">{val}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Raw JSON Toggle Section */}
              <div className="json-view-wrapper">
                <button 
                  className="json-toggle-btn"
                  onClick={() => setShowRawJson(!showRawJson)}
                >
                  <Code size={16} />
                  <span>{showRawJson ? "Hide" : "Show"} Raw API Response JSON</span>
                  {showRawJson ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showRawJson && (
                  <pre className="json-content">
                    {JSON.stringify(apiResult, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Built for the Chitkara Full Stack Challenge. Running on Node.js/Express (Render backend) and React/Vite (Vercel frontend).</p>
        <p style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <a href="https://bfhl-hierarchy-visualizer.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            <ExternalLink size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Live Demo
          </a>
          <a href="https://github.com/tanishgupta8/bfhl-hierarchy-visualizer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            <Github size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> GitHub Repository
          </a>
        </p>
      </footer>
    </div>
  );
}
