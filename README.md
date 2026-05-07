# Team Task Manager

A full-stack web application for managing team tasks with role-based access control.

## Live Demo
- Frontend: https://team-task-manager-xi-brown.vercel.app
- Backend API: https://team-task-manager-production-e55f.up.railway.app

## Features
- Signup/Login with JWT authentication
- Role-based access control (Admin/Member)
- Admin can create projects and assign tasks to members
- Members can update task status
- Dashboard with stats (total, completed, in-progress, overdue)
- Overdue task alerts

## Tech Stack
- Frontend: React.js (deployed on Vercel)
- Backend: Node.js + Express.js (deployed on Railway)
- Database: MongoDB Atlas
- Authentication: JWT (JSON Web Tokens)

## How to Run Locally

### Backend
cd backend
npm install
node server.js

### Frontend
cd frontend
npm install
npm start

## API Endpoints
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/projects
- POST /api/projects
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- GET /api/tasks/stats
