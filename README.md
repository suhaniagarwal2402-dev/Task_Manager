# Task Manager

A full stack task manager. Users register and log in, then create, edit, filter, search and delete their own tasks.

**Stack:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, HTML/CSS/JavaScript

## Features
- Register and login with hashed passwords (bcrypt) and token auth (JWT)
- Each user only sees their own tasks
- Add, edit, delete tasks with title, description, priority, due date
- Mark tasks done or pending
- Search by title, filter by status and priority, sort by due date
- Dashboard counts: total, pending, done, overdue

## Run it
1. Install Node.js and create a free MongoDB Atlas cluster
2. `npm install`
3. Copy `.env.example` to `.env` and fill in `MONGO_URI` and `JWT_SECRET`
4. `npm run dev` (or `npm start`)
5. Open http://localhost:3000

## API
| Method | Route | What it does |
|---|---|---|
| POST | /api/auth/register | create account |
| POST | /api/auth/login | login, returns token |
| GET | /api/tasks | list my tasks (?status= &priority= &search= &sort=dueDate) |
| GET | /api/tasks/stats | counts for dashboard |
| POST | /api/tasks | create task |
| GET | /api/tasks/:id | get one task |
| PUT | /api/tasks/:id | update task |
| DELETE | /api/tasks/:id | delete task |

All `/api/tasks` routes need the header `Authorization: Bearer <token>`.

## Folder structure
```
server.js          starts the app and connects to MongoDB
models/            User and Task schemas
routes/            maps URLs to controller functions
controllers/       the actual logic for each route
middleware/auth.js checks the JWT token
public/            frontend (index.html, style.css, script.js)
```
