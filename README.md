# Dynamo Todo App

A simple React + DynamoDB Todo list application demonstrating AWS SDK v3 usage, environment variables, and frontend/backend interaction.

---

## Live Demo

Check out the live site: [Dynamo Todo on Netlify](https://dynamo-todo-demo.netlify.app/)

---

## Table Screenshot

![DynamoDB Table Screenshot](docs/demo.png)

---

## Project Setup

### 1. Clone the repository
```bash
git clone https://github.com/Tuscaney/dynamo-todo
cd dynamo-todo

## Day 4 - Update and Delete Todos

**Features added:**
- ✅ Update todo item (`completed` field toggle) using `toggleTodo`
- ✅ Delete todo item by id using `deleteTodo`
- ✅ UI now includes:
  - Checkbox to toggle completion
  - Delete button to remove a todo
- ✅ DynamoDB operations are isolated in `dynamo.js` (UI does not directly call AWS SDK)
- ✅ Environment variables still used (no credentials hard-coded in source)

**How to use:**
1. Run `npm run dev` to start the app.
2. Add a new todo using the input box.
3. Toggle completion by clicking the checkbox.
4. Delete a todo by clicking the Delete button.




