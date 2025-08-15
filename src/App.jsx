// src/App.jsx
import { useEffect, useState } from "react";
import { scanTodos, createTodo } from "./dynamo";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // show the region for quick verification in the UI/console
  const region = import.meta.env.VITE_AWS_REGION;

  useEffect(() => {
    (async () => {
      try {
        console.log("VITE_AWS_REGION =", region);
        const items = await scanTodos();
        console.log("scanTodos() result:", items);
        setTodos(items);
      } catch (err) {
        console.error("scanTodos failed:", err);
        // user-friendly hint
        alert("Failed to load todos. Check .env.local, IAM policy, and table name.");
      } finally {
        setLoading(false);
      }
    })();
  }, [region]);

  async function onAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // id generator: prefer crypto.randomUUID when available
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now());

    const newItem = { id, text: trimmed, completed: false };

    // optimistic UI update
    setTodos((prev) => [newItem, ...prev]);
    setText("");
    setBusy(true);

    try {
      await createTodo(newItem);
      // createTodo returns item if you want to use it
    } catch (err) {
      console.error("createTodo failed:", err);
      alert("Create failed. Reverting UI. See console for details.");
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setText(trimmed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "48px auto", fontFamily: "system-ui" }}>
      <h1>DynamoDB TODOs</h1>
      <p style={{ marginTop: -6, opacity: 0.75 }}>
        Region: <code>{region}</code>
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a todo and press Add"
          style={{ flex: 1, padding: "8px 10px", fontSize: 16 }}
        />
        <button onClick={onAdd} disabled={busy || !text.trim()}>
          {busy ? "Adding..." : "Add"}
        </button>
      </div>

      <hr style={{ margin: "24px 0" }} />

      {loading ? (
        <p>Loading todos…</p>
      ) : todos.length === 0 ? (
        <p>No todos yet. Add one above.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {todos.map((t) => (
            <li key={t.id} style={{ margin: "10px 0" }}>
              <span style={{ fontWeight: 600 }}>{t.text}</span>{" "}
              <span style={{ color: "#666" }}>— completed: {String(t.completed)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
