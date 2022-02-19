const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return response.status(404).json({ error: "User Not Found." });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists." });
  }

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const { todos } = user;

  const todoExists = todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found." });
  }

  let editedTodo;

  todos.find((todo, index) => {
    if (todo.id === id) {
      todos[index] = {
        ...todos[index],
        title,
        deadline: new Date(deadline),
      };

      editedTodo = {
        deadline: todos[index].deadline,
        done: todos[index].done,
        title: todos[index].title,
      };
    }
  });

  return response.status(200).json(editedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const { todos } = user;

  const todoExists = todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found." });
  }

  let editedTodo;

  todos.find((todo, index) => {
    if (todo.id === id) {
      todos[index].done = true;

      editedTodo = todos[index];
    }
  });

  return response.status(200).json(editedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const { todos } = user;

  const todoExists = todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found." });
  }

  todos.find((todo) => {
    if (todo.id === id) {
      todos.splice(todo, 1);
    }
  });

  return response.status(204).end();
});

module.exports = app;
