# Telegram Message Organizer

A small self-hosted project to fetch, tag, organize and create reminders for your Telegram "Saved Messages" using a backend service (Express + Telegram MTProto), MongoDB storage and a React + Vite frontend. It also supports a Telegram bot integration for sending reminders.

**Repository layout**

- **backend/**: Express + TypeScript server, Telegram client, cron jobs, and socket.io integration.
- **frontend/**: Vite + React UI to browse, tag and create tasks from saved messages.

**Quick summary**

- **Backend:** Node + Express, MongoDB, uses `telegram` (MTProto) to interact with your account.
- **Frontend:** Vite + React, connects to backend API and Socket.IO.

**Prerequisites**

- Node.js (LTS recommended, Node 18+)
- MongoDB (local or hosted)
- (Optional) `pnpm` for frontend if you prefer; `npm` works too.

Getting started (development)

- Clone the repo:

  git clone https://github.com/binzam/telegram-saved-messages-organizer.git
  cd telegram-saved-messages-organizer

- Backend

  cd backend
  npm install

  Create a `.env` (copy/adjust the example below) and run in dev mode:

  npm run dev

  For production:

  npm run build
  npm start

- Frontend

  cd frontend
  npm install

  Create a `.env` (see example below) and start dev server:

  npm run dev

  Build for production:

  npm run build

Environment variables

Backend (create `backend/.env`):

- **MONGODB_URI**: MongoDB connection string. Example: `mongodb://localhost:27017/telegram-saved-messages-db`
- **SESSION_SECRET**: Random string used for encrypting sessions (any secure secret).
- **TELEGRAM_API_ID**: Telegram API ID (from my.telegram.org).
- **TELEGRAM_API_HASH**: Telegram API Hash (from my.telegram.org).
- **FRONTEND_URL**: Frontend origin (used for CORS). Example: `http://localhost:5173`
- **TELEGRAM_BOT_TOKEN**: Bot token (from telegram botfather).
- **TELEGRAM_BOT**: Bot username (e.g. `@mybot`).
- **NODE_ENV**: `development` or `production`

Frontend (create `frontend/.env`):

- **VITE_BASE_URL**: Backend base URL (example: `http://localhost:4000`)

Server scripts

- Backend:
  - `npm run dev` — development (uses `tsx` watch)
  - `npm run build` — compile TypeScript to `dist`
  - `npm start` — run built server
- Frontend:
  - `npm run dev` — start Vite dev server
  - `npm run build` — build production assets
  - `npm run preview` — preview build

API documentation (HTTP endpoints)

Base URL: `http://localhost:4000` (or `process.env.PORT`)

**Auth** (`/auth`)

- `POST /auth/send-code`
  - Body: `{ "phoneNumber": "+1555..." }`
  - Response: `{ ok: true }` on success (sends Telegram code to phone).
- `POST /auth/verify-code`
  - Body: `{ "phoneNumber": "+1555...", "code": "12345" }`
  - Response: `{ ok: true }` or `{ mfa: true }` if a 2FA password is required.
- `POST /auth/verify-password`
  - Body: `{ "phoneNumber": "+1555...", "password": "your2fa" }`
  - Response: `{ ok: true }` on success.
- `GET /auth/status`
  - Returns: `{ authed: true|false }`.
- `POST /auth/logout?wipe=true`
  - Query: optional `wipe=true` to also clear Messages & Tasks from DB.
  - Response: `{ ok: true }`.

**Messages** (`/messages`) — protected by server-side session check

- `GET /messages`
  - Query params: `tag`, `type`, `page` (default 1), `limit` (default 20)
  - Response: `{ messages: [...], hasMore: boolean, total: number }`.
- `POST /messages/tag`
  - Body: `{ "messageId": "12345", "tags": ["todo","important"] }`
  - Response: `{ ok: true, message: <updated message doc> }`.
- `GET /messages/media/:messageId`
  - Streams the media binary for a given messageId (image, document, etc.).
- `DELETE /messages/:messageId`
  - Deletes message from Telegram "Saved Messages" and the local DB.
  - Response: `{ ok: true }`.

**Tasks** (`/task`)

- `POST /task/new`
  - Body: `{ "messageId": "12345", "reminderAt": "2026-05-02T12:00:00Z", "title": "...", "note": "...", "notifyVia": "telegram" }`
  - `messageId` and `reminderAt` are required.
  - Response: `{ ok: true, task: { ... } }`.
- `GET /task/:messageId`
  - Returns the message along with its tasks: `{ message: { ..., tasks: [...] } }`.

Authentication / Authorization notes

- This project stores an encrypted session for a single Telegram account in MongoDB. The server enforces a server-side session check; if there is no saved session the protected endpoints will return `401`.

Socket / realtime

- The backend initializes a Socket.IO server (used by the frontend for live updates). See `backend/src/services/socketService.ts`.

Telegram bot and reminders

- A Telegram bot integration exists to send reminder notifications. Provide `TELEGRAM_BOT_TOKEN` and `TELEGRAM_BOT` in `.env` to enable bot-related features. Cron jobs are initialized from `backend/src/cron/taskReminderCron.ts`.

Troubleshooting

- Ensure MongoDB is reachable using `MONGODB_URI`.
- Confirm `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are correct from https://my.telegram.org.
- If you cannot fetch messages, log output will show errors from the telegram client in the backend console.

Where to look in the code

- Backend entry: `backend/src/index.ts`
- Auth routes: `backend/src/routes/auth.ts`
- Messages routes: `backend/src/routes/messages.ts`
- Task routes: `backend/src/routes/task.ts`

Contributing

- Feel free to open issues or PRs. Keep backend changes TypeScript-friendly and update typings.

License

- MIT
