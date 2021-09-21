const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)
  if(!user){
    return response.status(404).json({error:"User not found"});
  }
  request.user = user
  return next();
}

app.post('/users', (request, response) => {
    const {name,username} = request.body;

    const userExists = users.find(user => user.username === username)
    if(userExists){
      return response.status(400).json({error:"User already exists"});
    }
    const user = {
      id:uuidv4(),
      name,
      username,
      todos:[]
    }
    users.push(user);
    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title,deadline } = request.body;
  const { user } = request;

  const userTodo = {
    id:uuidv4(),
    title,
    done:false,
    deadline:new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(userTodo);
  return response.status(201).json(userTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const currentTodo = user.todos.find(userTodo => userTodo.id === id); 

  if(!currentTodo){
    return response.status(404).json({error:"Todo not found"})
  }

  currentTodo.title = title;
  currentTodo.deadline = new Date(deadline);

  return response.json(currentTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const currentTodo = user.todos.find(todo => todo.id === id)

  if(!currentTodo){
    return response.status(404).json({error:"Todo not found"});
  }
  if(currentTodo.done === true){
    return response.status(400).json({error:"Todo already has been done"});
  }
  
  
  currentTodo.done = true

  return response.json(currentTodo);
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const currentTodoIndex = user.todos.findIndex(todo => todo.id === id)

  if(currentTodoIndex === -1){
    return response.status(404).json({error:"Todo not found"});
  }

  user.todos.splice(currentTodoIndex, 1);

  return response.status(204).send();
});

module.exports = app;