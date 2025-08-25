import { useEffect, useState } from "react";
import { scanTodos, createTodo, toggleTodo, deleteTodo } from "./dynamo";
import './App.scss';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const region = import.meta.env.VITE_AWS_REGION;

  useEffect(() => {
    const fetchTodos = async () => {
      try { setTodos(await scanTodos()); } 
      catch (err) { console.error(err); alert("Failed to load todos."); } 
      finally { setLoading(false); }
    };
    fetchTodos();
  }, [region]);

  const onAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID?.() || String(Date.now());
    const newItem = { id, text: trimmed, completed: false };
    setTodos(prev => [newItem, ...prev]);
    setText(""); setBusy(true);
    try { await createTodo(newItem); } 
    catch (err) { console.error(err); setTodos(prev => prev.filter(t => t.id !== id)); setText(trimmed); alert("Failed to add todo."); } 
    finally { setBusy(false); }
  };

  const onToggle = async (id, completed) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed } : t)));
    try { await toggleTodo(id, completed); } 
    catch (err) { console.error(err); setTodos(await scanTodos()); alert("Failed to update todo."); }
  };

  const onDelete = async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    try { await deleteTodo(id); } 
    catch (err) { console.error(err); setTodos(await scanTodos()); alert("Failed to delete todo."); }
  };

  return (
    <div className="app-container">
      <h1>DynamoDB TODOs</h1>
      <p className="region">Region: <code>{region}</code></p>

      <div className="todo-input">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter todo" disabled={busy} />
        <button onClick={onAdd} disabled={busy || !text.trim()}>{busy ? "Adding..." : "Add"}</button>
      </div>

      <hr />

      {loading ? (<p>Loading todos…</p>) : todos.length === 0 ? (<p>No todos yet.</p>) : (
        <ul className="todo-list">
          {todos.map(t => (
            <li key={t.id} className="todo-item">
              <input type="checkbox" checked={t.completed} onChange={() => onToggle(t.id, !t.completed)} />
              <span className={t.completed ? "completed" : ""}>{t.text}</span>
              <button className="delete-btn" onClick={() => onDelete(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

      <div className="section-one">
        <h2>Section One</h2>
        <p>Demo of SCSS nesting and $primary/$secondary colors.</p>
        <a href="#">Learn more</a>
        <button>Click Me</button>
      </div>

      <div className="section-two">
        <h2>Section Two</h2>
        <p>Another section to show nested styling.</p>
        <button>Action</button>
      </div>

      <div className="section-three">
        <h2>Section Three</h2>
        <ul><li>Nested list item 1</li><li>Nested list item 2</li><li>Nested list item 3</li></ul>
      </div>
    </div>
  );
}










