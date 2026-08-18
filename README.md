# Kitchen Line — Pickleball Performance MVP

A React + Node/Express + MongoDB app that records games, derives player stats,
and surfaces a "Level Up" training priority — plus a global leaderboard.

Built as the MVP scoped in your planning doc (section 31): auth, player
profile, open-play game logging, basic + optional advanced stats, a rule-based
analytics/Level-Up engine, dashboard, and leaderboard — now extended with a
drill-based training plan and a weighted-scoring paddle recommendation engine
(doc sections 16–19).

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Zod validation
- **Frontend:** React + Vite, React Router, Axios
- Plain JavaScript (not TypeScript) to keep this first pass easy to run and
  read end-to-end. The doc's recommendation to move to TypeScript is a good
  next step once the shape of things settles — the module boundaries here
  (models / controllers / routes) will convert cleanly.

## Project structure

```
pickleball-app/
├── server/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/         User, Player, Game, Paddle
│   │   ├── controllers/    auth, player, game, leaderboard, training, paddle
│   │   ├── routes/
│   │   ├── middleware/     JWT auth guard, error handler
│   │   ├── utils/
│   │   │   ├── stats.js                 stat % calculations + Level-Up ranking
│   │   │   ├── trainingPlan.js          matches Level-Up weaknesses to drills
│   │   │   └── paddleRecommendation.js  weighted paddle scoring engine
│   │   ├── seed/seed.js    seeds the Drill and Paddle catalogs
│   │   └── server.js
│   └── .env.example
└── client/
    └── src/
        ├── pages/           Login, Register, Dashboard, Leaderboard, NewGame,
        │                    Profile, TrainingPlan, PaddleRecommendations
        ├── components/      Navbar, ProtectedRoute, StatBar
        ├── context/AuthContext.jsx
        └── api/client.js    axios instance with JWT interceptor
```

## Running it locally

### 1. Database
Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or run
MongoDB locally). Grab the connection string.

> Games are saved inside a MongoDB transaction (`server/src/controllers/gameController.js`),
> so your MongoDB deployment needs to be a replica set — Atlas clusters are
> replica sets by default, so this works out of the box there. A single local
> `mongod` without `--replSet` will error on game creation; use Atlas, or run
> `mongod` as a single-node replica set if you want to stay fully local.

### 2. Backend

```bash
cd server
cp .env.example .env   # fill in MONGODB_URI and a real JWT_SECRET
npm install
npm run seed             # populates the Drill and Paddle catalogs
npm run dev              # http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so no CORS
setup is needed locally.

### 4. Try it

1. Register 3–4 accounts (open play needs at least 2 players per side).
2. Log in as one, go to **Log Game**, pick players for Team A / Team B, enter
   a score, save.
3. Check the **Dashboard** — win rate and games played update immediately.
4. Once a player has 5+ recorded attempts in a skill (serve, dink, etc. — via
   the `advancedStats` field on the game-create API), the **Level-Up**
   section on the dashboard and profile will populate.
5. **Leaderboard** ranks everyone with at least one game played, by app
   rating or win rate.
6. **Training** (`/training`) turns the same Level-Up weaknesses into an
   actual drill list — 2-3 drills per weak skill, filtered to the player's
   level, each expandable into step-by-step instructions.
7. **Paddles** (`/paddles`) needs at least 3 recorded games to unlock. It
   derives a player profile (power/control need) from real stats and scores
   the seeded paddle catalog against it with a transparent weighted formula
   — not an LLM guess. Each result shows a match % and the specific reasons
   it was recommended.

## What's deliberately out of scope for this pass

Per the doc's own phased plan (sections 31–33), this MVP skips: forgot-password
email flow, clubs/courts, friends/social, tournaments, AI coach narration
(turning the paddle/drill output into natural language), and mobile (React
Native). The paddle recommendation formula (section 19) and drill matching
(section 16) are implemented and covered above — AI Coach is the natural V3
layer on top of them, not a replacement.

## Design

The frontend uses a small "Kitchen Line" visual identity (tokens in
`client/src/index.css`): deep court teal, chalk-white surfaces, and pickleball
yellow as the single accent color — inspired by the court itself and the fact
that patience at the non-volley zone, not just power, is what this app is
built to help players improve at.
