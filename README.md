# 🚀 Team Task Manager (Full-Stack)

A full-stack web application to manage teams, projects, and tasks with **role-based access control (RBAC)**. Built using the MERN stack and deployed on cloud platforms.

---

## 🌐 Live Demo

- 🔗 Frontend (Vercel): https://task-manager-swanand.vercel.app  
- 🔗 Backend (Railway): https://task-manager-deploy-production.up.railway.app  

---

## 📌 Features

### 🔐 Authentication & Authorization
- User Signup & Login (JWT-based authentication)
- Role-based access control:
  - **Admin**
  - **Member**

---

### 📁 Project Management
- Admin can:
  - Create projects
  - Delete projects
  - Manage team members

- Members can:
  - View assigned projects

---

### ✅ Task Management
- Create, update, delete tasks
- Assign tasks to team members
- Track task status:
  - Todo
  - In Progress
  - Done
- Due date tracking

---

### 📊 Dashboard
- View:
  - Total tasks
  - Completed tasks
  - Pending tasks
  - Overdue tasks

---

### 👥 Team Management
- Add/remove members to projects
- Assign tasks to specific users

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- CSS / UI Components

### Backend
- Node.js
- Express.js
- MongoDB (Atlas)
- Mongoose

### Authentication
- JSON Web Tokens (JWT)
- bcrypt (password hashing)

### Deployment
- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas

---

## 📂 Project Structure
```
team-task-manager/
│
├── client/ # React frontend
│ ├── src/
│ └── vite.config.js
│
├── server/ # Node.js backend
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ └── index.js
│
└── README.md
```


---

## ⚙️ Environment Variables

### 🔹 Backend (`server/.env`)

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

### 🔹 Frontend (`client/.env`)

```
VITE_API_URL=https://your-backend-url/api
```

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository

```
git clone https://github.com/NotSwanand/task-manager.git

cd task-manager
```

---

### 2️⃣ Setup Backend

```
cd server
npm install
npm run dev
```

---

### 3️⃣ Setup Frontend

```
cd client
npm install
npm run dev
```

---

### 4️⃣ Open in browser

```
http://localhost:5173
```

---

## 🔐 Role-Based Access Control (RBAC)
```
| Feature              | Admin | Member |
|---------------------|------|--------|
| Create Project      | ✅   | ❌     |
| Delete Project      | ✅   | ❌     |
| Add Members         | ✅   | ❌     |
| Assign Tasks        | ✅   | ❌     |
| View Tasks          | ✅   | ✅     |
| Update Own Tasks    | ❌   | ✅     |
```
---

## 📦 API Overview

### Auth Routes
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Project Routes
- `POST /api/projects`
- `GET /api/projects`
- `DELETE /api/projects/:id`

### Task Routes
- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/:id`

---

## 🧠 Key Concepts Implemented

- RESTful API design
- JWT Authentication & Authorization
- Role-Based Access Control (RBAC)
- MongoDB relationships using Mongoose
- CORS handling for production
- Environment-based configuration
- SPA routing fix for Vercel deployment

---

## ⚠️ Deployment Notes

- Backend uses dynamic `process.env.PORT` (required for Railway)
- MongoDB Atlas requires IP whitelist (`0.0.0.0/0` for cloud access)
- Vercel requires SPA rewrite rules (`vercel.json`)
- CORS must match frontend URL exactly (no trailing slash)

---

## 📈 Future Improvements

- Notifications system
- File attachments for tasks
- Real-time updates (WebSockets)
- Email reminders for deadlines
- Better UI/UX enhancements

---

## 👨‍💻 Author

**Swanand Bowalekar**  
- GitHub: https://github.com/NotSwanand  

---

## ⭐ If you like this project

Give it a star ⭐ on GitHub!
