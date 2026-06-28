# Polaris — GitHub Contribution Intelligence Platform

**Polaris** is a GitHub contribution intelligence platform designed to help developers discover meaningful open-source opportunities and understand their GitHub activity.

Finding the right repositories, issues, and contribution opportunities can be overwhelming, Polaris simplifies this process by analyzing GitHub data and presenting personalized insights through an intuitive dashboard.

Inspired by the North Star ⭐, Polaris helps developers navigate the open-source universe.

## Live Demo 
https://github-contribution-radar.vercel.app

## What it does

- Search GitHub issues filtered by language, label, and activity
- Score every issue by how well it matches your skill preferences (rules-based, 0–100)
- Save opportunities and track them through a status pipeline (Saved → Exploring → In Progress → PR Opened → Merged)
- Dashboard showing your full contribution pipeline at a glance

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Recharts |
| Backend | Node.js, Express, Mongoose, Passport.js |
| Database | MongoDB |
| Auth | GitHub OAuth + JWT |

## Setup

### 1. Create a GitHub OAuth App

Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**

- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:5000/auth/github/callback`

Copy your **Client ID** and **Client Secret**.

### 2. Configure environment

```bash
# server/.env
cp server/.env.example server/.env
# Fill in GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, JWT_SECRET, MONGODB_URI

# client/.env
cp client/.env.example client/.env
```

### 3. Install and run

```bash
# Install all dependencies
npm run install:all

# Start backend (port 5000)
npm run dev:server

# Start frontend (port 5173)
npm run dev:client
```

Open `http://localhost:5173`.

## Project structure

```
oss-radar/
├── client/        # React frontend
│   └── src/
│       ├── api/           # Axios + query functions
│       ├── components/    # UI components
│       ├── context/       # AuthContext
│       ├── pages/         # Route-level components
│       └── utils/         # Formatters
└── server/        # Express backend
    ├── config/    # DB, Passport, Cache
    ├── controllers/
    ├── middleware/
    ├── models/    # Mongoose schemas
    ├── routes/
    ├── services/  # GitHub API, Scoring
    └── utils/     # Next steps generator
```

## API overview

| Method | Route | Description |
|---|---|---|
| GET | `/auth/github` | GitHub OAuth redirect |
| GET | `/auth/me` | Current user |
| GET | `/api/issues/search` | Search + score issues |
| GET | `/api/issues/:owner/:repo/:num` | Issue detail |
| GET | `/api/repos/search` | Search repos |
| POST | `/api/saved-items` | Save an issue |
| GET | `/api/saved-items` | List saved items |
| PATCH | `/api/saved-items/:id` | Update status/note |
| DELETE | `/api/saved-items/:id` | Remove |
| GET | `/api/dashboard/summary` | Dashboard stats |
| GET | `/api/profile` | User profile |
| PATCH | `/api/profile/preferences` | Update preferences |


## Support

If you like Polaris, consider giving the repository a ⭐
It helps the project grow!