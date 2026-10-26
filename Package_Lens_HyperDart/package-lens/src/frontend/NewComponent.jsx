import React, { useEffect, useRef, useState } from "react";
import { interpret } from "./query.js";
import { loadPackage, alternatives } from "./api.js";
import "./styles.css";
const missing = "Unavailable";
const number = (n) => (typeof n === "number" ? n.toLocaleString() : missing);
const date = (d) =>
  d && !Number.isNaN(Date.parse(d))
    ? new Date(d).toLocaleDateString()
    : missing;
function Links({ p }) {
  return (
    <div className="links">
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.npmjs.com/package/${encodeURIComponent(p.name)}`}
      >
        npm ↗
      </a>
      {p.repository && (
        <a target="_blank" rel="noreferrer" href={p.repository}>
          Repository ↗
        </a>
      )}
    </div>
  );
}
function Card({ p, onCompare }) {
  return (
    <article className="card">
      <div className="eyebrow">
        {p.shared ? "DISCOVERED CANDIDATE" : "PACKAGE OVERVIEW"}
      </div>
      <h2>{p.name}</h2>
      <p>{p.description || "No description provided."}</p>
      {p.deprecated && (
        <p className="warning">
          <strong>Deprecated:</strong> {p.deprecated}
        </p>
      )}
      <div className="metrics">
        <div>
          <small>Latest version</small>
          <strong>{p.version || missing}</strong>
        </div>
        <div>
          <small>Weekly downloads</small>
          <strong>{number(p.downloads)}</strong>
        </div>
        <div>
          <small>Released</small>
          <strong>{date(p.date)}</strong>
        </div>
        <div>
          <small>License</small>
          <strong>{p.license || missing}</strong>
        </div>
      </div>
      {p.period && <small>Download period: {p.period}</small>}
      {p.shared && (
        <p className="reason">
          Shared keywords:{" "}
          {p.shared.join(", ") || "No exact overlap; npm search candidate"}
        </p>
      )}
      {p.issues?.length > 0 && (
        <p className="warning">
          Some data unavailable: {[...new Set(p.issues)].join("; ")}
        </p>
      )}
      <Links p={p} />
      {onCompare && (
        <button onClick={() => onCompare(p.name)}>
          Compare with original →
        </button>
      )}
    </article>
  );
}
function Comparison({ packages }) {
  const fields = [
    ["Version", (p) => p.version],
    ["Weekly downloads", (p) => number(p.downloads)],
    ["Download period", (p) => p.period],
    ["License", (p) => p.license],
    ["Node.js", (p) => p.node],
    ["TypeScript", (p) => p.types],
    ["ESM", (p) => p.esm],
    ["Description", (p) => p.description],
    [
      "Deprecation",
      (p) => (p.error ? missing : p.deprecated || "Not declared"),
    ],
    ["Links", (p) => (p.error ? missing : <Links p={p} />)],
  ];
  const measured = packages.filter((p) => typeof p.downloads === "number");
  const comparable =
    measured.length === packages.length &&
    new Set(measured.map((p) => p.period)).size === 1;
  return (
    <section className="card">
      <div
        className="table-scroll"
        tabIndex="0"
        aria-label="Package comparison, scroll horizontally"
      >
        <table>
          <thead>
            <tr>
              <th>Compare</th>
              {packages.map((p) => (
                <th key={p.name}>
                  {p.name}
                  {p.error && <p className="warning">{p.error}</p>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(([label, get]) => (
              <tr key={label}>
                <th>{label}</th>
                {packages.map((p) => (
                  <td key={p.name}>{get(p) || missing}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="reason">
        {comparable
          ? `${[...measured].sort((a, b) => b.downloads - a.downloads)[0].name} has the highest reported downloads in this period. `
          : "Download totals are incomplete or periods differ. "}
        Downloads measure usage, not suitability or quality. Compatibility
        declarations are metadata evidence, not runtime verification.
      </p>
    </section>
  );
}
export default function NewComponent(props) {
  const [state, setState] = useState({ loading: true });
  const [override, setOverride] = useState(null);
  const [retry, setRetry] = useState(0);
  const notified = useRef(false);
  const source = JSON.stringify(props.searchData || null);
  useEffect(() => {
    setOverride(null);
  }, [source, props.searchQuery]);
  useEffect(() => {
    let active = true;
    setState({ loading: true });
    (async () => {
      try {
        const parsed =
          override || interpret(JSON.parse(source), props.searchQuery);
        const packages = await Promise.all(
          parsed.names.map(async (name) => {
            try {
              return await loadPackage(name);
            } catch (error) {
              return { name, error: error.message };
            }
          }),
        );
        if (parsed.intent === "alternatives" && packages[0].error)
          throw new Error(packages[0].error);
        const candidates =
          parsed.intent === "alternatives"
            ? await alternatives(packages[0])
            : [];
        if (active)
          setState({ ...parsed, packages, candidates, loading: false });
      } catch (error) {
        if (active) setState({ loading: false, error: error.message });
      }
    })();
    return () => {
      active = false;
    };
  }, [source, props.searchQuery, override, retry]);
  useEffect(() => {
    if (
      !state.loading &&
      !notified.current &&
      props.messageHandlers?.componentLoaded
    ) {
      notified.current = true;
      props.messageHandlers.componentLoaded();
    }
  }, [state.loading, props.messageHandlers]);
  const mode = props.theme?.palette?.mode || props.theme?.mode;
  return (
    <main className="lens" data-theme={mode} data-format={props.format}>
      <header>
        <span className="logo">⌘</span>
        <div>
          <h1>Package Lens</h1>
          <p>Understand your next dependency.</p>
        </div>
        <span className="source">npm data</span>
      </header>
      <div className="toolbar">
        <span>
          {state.intent ? state.intent.toUpperCase() : "PACKAGE EXPLORER"}
        </span>
        <button onClick={() => setRetry((x) => x + 1)}>Retry</button>
      </div>
      <div aria-live="polite" aria-busy={state.loading}>
        {state.loading ? (
          <div className="card loading">Fetching registry evidence…</div>
        ) : state.error ? (
          <div className="card warning" role="alert">
            {state.error}
          </div>
        ) : (
          <>
            {state.query && <p className="query">{state.query}</p>}
            {state.intent === "compare" ? (
              <Comparison packages={state.packages} />
            ) : (
              state.packages.map((p) =>
                p.error ? (
                  <div key={p.name} className="card warning">
                    {p.name}: {p.error}
                  </div>
                ) : (
                  <Card key={p.name} p={p} />
                ),
              )
            )}
            {state.intent === "alternatives" && (
              <>
                <h2>Explore alternatives</h2>
                <p>
                  Heuristic suggestions: shared keywords × 2, plus npm search
                  relevance and popularity signals. Related packages may not be
                  replacements; check their APIs.
                </p>
                {!state.candidates.length && <p>No candidates found.</p>}
                {state.candidates.map((p) => (
                  <Card
                    key={p.name}
                    p={p}
                    onCompare={(name) =>
                      setOverride({
                        intent: "compare",
                        names: [state.names[0], name],
                        query: `Compare ${state.names[0]} and ${name}`,
                      })
                    }
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
      <footer>
        Official npm registry & download counts · cached for 5 minutes · missing
        values stay unavailable
      </footer>
    </main>
  );
}
