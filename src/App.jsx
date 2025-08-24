// src/App.jsx
import { useEffect, useState } from "react";
import { scanTodos, createTodo, toggleTodo, deleteTodo } from "./dynamo";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const region = import.meta.env.VITE_AWS_REGION;

  // Load todos on mount
  useEffect(() => {
    (async () => {
      try {
        console.log("VITE_AWS_REGION =", region);
        const items = await scanTodos();
        console.log("scanTodos() result:", items);
        setTodos(items);
      } catch (err) {
        console.error("scanTodos failed:", err);
        alert(
          "Failed to load todos. Check .env.local, IAM policy, and table name."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [region]);

  // Add a new todo
  async function onAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : String(Date.now());

    const newItem = { id, text: trimmed, completed: false };

    setTodos(prev => [newItem, ...prev]);
    setText("");
    setBusy(true);

    try {
      await createTodo(newItem);
    } catch (err) {
      console.error("createTodo failed:", err);
      alert("Create failed. Reverting UI.");
      setTodos(prev => prev.filter(t => t.id !== id));
      setText(trimmed);
    } finally {
      setBusy(false);
    }
  }

  // Toggle completed
  async function onToggle(id, completed) {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed } : t)));
    try {
      await toggleTodo(id, completed);
    } catch (err) {
      console.error("toggleTodo failed:", err);
      alert("Failed to update. Reloading todos.");
      const items = await scanTodos();
      setTodos(items);
    }
  }

  // Delete a todo
  async function onDelete(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (err) {
      console.error("deleteTodo failed:", err);
      alert("Delete failed. Reloading todos.");
      const items = await scanTodos();
      setTodos(items);
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
          onChange={e => setText(e.target.value)}
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
          {todos.map(t => (
            <li
              key={t.id}
              style={{
                margin: "10px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => onToggle(t.id, !t.completed)}
              />
              <span
                style={{
                  fontWeight: 600,
                  textDecoration: t.completed ? "line-through" : "none",
                  flex: 1,
                }}
              >
                {t.text}
              </span>
              <button onClick={() => onDelete(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}





