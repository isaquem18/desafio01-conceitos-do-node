const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  try {

    const { username } = req.headers;

    const findUser = users.find(item => String(item.username) === String(username));

    if (!findUser) {
      return res.status(404).json({
        error: 'User not found.'
      });
    };

    req.user = findUser;
    
    next();

  } catch (e) {

    return res.status(500).send();

  }
}

app.post('/users', (req, res) => {
  try {

    const { name, username } = req.body;

    const checkUserExistency = users.find(item => item.username === username);

    if (checkUserExistency) return res.status(400).json({
      error: 'Users already has been created.'
    });

    const newUser = {
      id: v4(),
      name,
      username,
      todos: []
    };

    users.push(newUser);

    return res.status(201).json(newUser);


  } catch(e) {

    return res.status(500).send();

  }  
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  try {

    const { user } = req;

    return res.status(200).json(user.todos);

  } catch(e) {

    return res.status(500).send();

  }
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  try {

    const { user } = req;

    const { title, deadline } = req.body;

    const newTodo = {
      id: v4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    };
    
    user.todos.push(newTodo);

    return res.status(201).json(newTodo);

  } catch (e) {
    return res.status(500).send();
  }
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  try {

    const { user } = req;
    const { id } = req.params;
    const { title, deadline } = req.body;

    const specificTodo = user.todos.find(item => item.id === id);

    if (!specificTodo) {
      return res.status(404).json({
        error: 'Todo item not found.'
      });
    }

    specificTodo.title = title;
    specificTodo.deadline = new Date(deadline);

    return res.status(200).json(specificTodo);

  } catch (e) {
    return res.status(500).send();
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  try {

    const { user } = req;
    const { id } = req.params;

    const todo = user.todos.filter(item => item.id === id)[0];

    if (!todo) {
      return res.status(404).json({ 
        error: 'Todo item not found.'
      })
    }

    todo.done = !todo.done

    return res.status(200).json(todo);

  } catch(e) {
    return res.status(500).send();
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  try {

    const { user } = req;
    const { id } = req.params;

    const todoExistency = user.todos.some(item => item.id === id);

    if (!todoExistency) {
      return res.status(404).json({
        error: 'error'
      });
    }

    const newTodoList = user.todos.filter(item => item.id !== id);
    user.todos = newTodoList;

    return res.status(204).send();

  } catch(e) {
    return res.status(500).send();
  }
});

module.exports = app;
