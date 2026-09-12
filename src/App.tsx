// ─────────────────────────────────────────────────────────────
// Preview app — a live gallery of exactly what the export
// pipeline writes. It re-renders the same React components and
// injects the serialized markup, so what you see here is byte
// what ships to GitHub (SMIL included).
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { allBuilds, Build } from "./export/manifest";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [ready, setReady] = useState(false);

  const byKind = useMemo(() => {
    const map = new Map<string, Build[]>();
    for (const b of allBuilds) {
      const arr = map.get(b.kind) ?? [];
      arr.push(b);
      map.set(b.kind, arr);
    }
    return map;
  }, []);

  const groups = ["hero", "section", "card", "button"];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{"~/profile — design system preview"}</h1>
        <button
          onClick={() => setReady((r) => !r)}
          style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #2b3a4d", background: "#141c26", color: "#e7edf6", cursor: "pointer" }}
        >
          {ready ? "Rendering…" : "Render all"}
        </button>
      </header>
      {ready ? null : (
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setTheme("dark")} style={tab(theme === "dark")}>dark</button>{" "}
          <button onClick={() => setTheme("light")} style={tab(theme === "light")}>light</button>
        </div>
      )}
      {ready &&
        groups.map((g) => (
          <section key={g} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, opacity: 0.6 }}>{g}</h2>
            <div style={{ display: "grid", gap: 24 }}>
              {byKind
                .get(g)!
                .filter((b) => b.rel.includes(theme))
                .map((b) => (
                  <div key={b.rel} style={{ border: "1px dashed #2b3a4d", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 10, fontFamily: "monospace" }}>{b.rel}</div>
                    <div dangerouslySetInnerHTML={{ __html: renderToStaticMarkup(b.element) }} />
                  </div>
                ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function tab(active: boolean): React.CSSProperties {
  return {
    padding: "6px 14px",
    borderRadius: 8,
    border: active ? "1px solid #4e9fff" : "1px solid #2b3a4d",
    background: active ? "#24497a" : "#141c26",
    color: active ? "#8ec3ff" : "#9aa9bb",
    cursor: "pointer",
  };
}