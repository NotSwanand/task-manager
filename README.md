# 🗂️ TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control, built with React + Vite, Express, and MongoDB.

---

## 📁 Project Structure

```
team-task-manager/
├── client/                        # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── api/
│       │   └── axios.js           # Axios instance with interceptors
│       ├── context/
│       │   └── AuthContext.jsx    # JWT auth state + login/logout
│       ├── components/
│       │   ├── Sidebar.jsx        # Navigation sidebar
│       │   └── ProtectedRoute.jsx # Auth-guarded route wrapper
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx      # Stats + recent tasks
│       │   ├── Projects.jsx       # Project list + create
│       │   ├── ProjectDetail.jsx  # Members + task summary
│       │   └── Tasks.jsx          # Full task CRUD + filters
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── server/                        # Node.js + Express backend
    ├── index.js                   # App entry point
    ├── package.json
    ├── .env.example
    ├── config/
    │   └── db.js                  # MongoDB connection
    ├── models/
    │   ├── User.js
    │   ├── Project.js
    │   └── Task.js
    ├── controllers/
    │   ├── authController.js
    │   ├── projectController.js
    │   └── taskController.js
    ├── routes/
    │   ├── auth.js
    │   ├── projects.js
    │   └── tasks.js
    └── middleware/
        ├── auth.js                # JWT verify + role authorization
        ├── validate.js            # express-validator rules
        └── errorHandler.js        # Global error handler
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **npm** v8+
- **MongoDB** — either:
  - Local: install from [mongodb.com](https://www.mongodb.com/try/download/community)
  - Cloud: free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🚀 Local Setup

### 1. Clone & navigate

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Setup the Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/teamtaskmanager
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev     # uses nodemon (hot reload)
# OR
npm start       # plain node
```

Server runs at: **http://localhost:5000**

### 3. Setup the Client

Open a new terminal:
```bash
cd client
npm install
npm run dev
```

Client runs at: **http://localhost:5173**

> The Vite dev server proxies `/api` calls to `http://localhost:5000`, so no CORS issues in development.

---

## 🔑 Default Roles

| Role   | Permissions |
|--------|-------------|
| **Admin**  | Create/delete projects, add/remove members, full task CRUD, view all users |
| **Member** | View assigned projects, update status of own tasks, create tasks in projects they're part of |

> On the signup page you can choose your role. In production, you'd restrict admin creation.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login`  | Public | Login, returns JWT |
| GET  | `/api/auth/me`     | Private | Get current user |
| GET  | `/api/auth/users`  | Admin  | List all users |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | `/api/projects`                     | Private | Get user's projects |
| POST   | `/api/projects`                     | Admin   | Create project |
| GET    | `/api/projects/:id`                 | Private | Get project detail |
| PUT    | `/api/projects/:id`                 | Admin   | Update project |
| DELETE | `/api/projects/:id`                 | Admin   | Delete project + tasks |
| POST   | `/api/projects/:id/members`         | Admin   | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin   | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | `/api/tasks`                    | Private | List tasks (filterable) |
| POST   | `/api/tasks`                    | Private | Create task |
| GET    | `/api/tasks/:id`                | Private | Get task |
| PUT    | `/api/tasks/:id`                | Private | Update task |
| DELETE | `/api/tasks/:id`                | Private | Delete task |
| GET    | `/api/tasks/dashboard/stats`    | Private | Dashboard stats |

**Query params for GET `/api/tasks`:** `project`, `status`, `priority`, `assignedTo`

---

## ☁️ Deployment

### Backend — [Render](https://render.com) or [Railway](https://railway.app)

1. Push your code to GitHub
2. Create a new **Web Service** on Render pointing to `/server`
3. Set **Build command**: `npm install`
4. Set **Start command**: `npm start`
5. Add environment variables from `.env.example`
6. Use a **MongoDB Atlas** URI for `MONGO_URI`

### Frontend — [Vercel](https://vercel.com)

1. Create a new project on Vercel pointing to `/client`
2. Set **Framework Preset** to `Vite`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-render-api.onrender.com/api
   ```
4. Update `client/src/api/axios.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | express-validator |

---

## 📝 License

MIT — feel free to use for your assignment and beyond!
