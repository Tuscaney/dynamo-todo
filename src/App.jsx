import { useEffect, useState } from "react";
import { scanTodos, createTodo, toggleTodo, deleteTodo } from "./dynamo";
import "./App.scss";

// MUI imports
import {
  Button,
  Card,
  CardContent,
  Typography,
  Checkbox,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const region = import.meta.env.VITE_AWS_REGION;

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setTodos(await scanTodos());
      } catch (err) {
        console.error(err);
        alert("Failed to load todos.");
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, [region]);

  const onAdd = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID?.() || String(Date.now());
    const newItem = { id, text: trimmed, completed: false };
    setTodos((prev) => [newItem, ...prev]);
    setText("");
    setBusy(true);
    try {
      await createTodo(newItem);
    } catch (err) {
      console.error(err);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setText(trimmed);
      alert("Failed to add todo.");
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (id, completed) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await toggleTodo(id, completed);
    } catch (err) {
      console.error(err);
      setTodos(await scanTodos());
      alert("Failed to update todo.");
    }
  };

  const onDelete = async (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTodo(id);
    } catch (err) {
      console.error(err);
      setTodos(await scanTodos());
      alert("Failed to delete todo.");
    }
  };

  return (
    <div className="app-container" style={{ padding: "2rem" }}>
      <Typography variant="h3" gutterBottom>
        DynamoDB TODOs
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Region: <code>{region}</code>
      </Typography>

      {/* Input row */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <TextField
          label="Enter todo"
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={busy}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onAdd}
          disabled={busy || !text.trim()}
          startIcon={<AddIcon />}
        >
          {busy ? "Adding..." : "Add"}
        </Button>
      </div>

      <hr />

      {/* Todo list */}
      {loading ? (
        <Typography>Loading todos…</Typography>
      ) : todos.length === 0 ? (
        <Typography>No todos yet.</Typography>
      ) : (
        todos.map((t) => (
          <Card
            key={t.id}
            style={{ marginBottom: "1rem", background: t.completed ? "#f0f0f0" : "#fff" }}
          >
            <CardContent style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={t.completed}
                onChange={() => onToggle(t.id, !t.completed)}
                color="primary"
              />
              <Typography
                variant="body1"
                style={{
                  textDecoration: t.completed ? "line-through" : "none",
                  flexGrow: 1,
                }}
              >
                {t.text}
              </Typography>
              <IconButton
                edge="end"
                color="error"
                onClick={() => onDelete(t.id)}
              >
                <DeleteIcon />
              </IconButton>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}











