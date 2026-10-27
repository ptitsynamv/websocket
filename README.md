# WebSocket Chat

![Node.js](https://img.shields.io/badge/Node.js-12.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-2-010101?logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%205-47A248?logo=mongodb&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-6-DD0031?logo=angular&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-4-7952B3?logo=bootstrap&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)
![Build](https://img.shields.io/badge/CI-not%20configured-lightgrey)

A real-time chat room built with an Express + Socket.IO backend and an Angular client. Users sign in with email and password, chat live with everyone who is online, and admins can mute or ban other users.

## Features

- **Sign in or sign up in one step.** Logging in with an unknown email creates the account. The server returns a JWT that is valid for 10 minutes.
- **Live chat over WebSockets.** New messages are pushed to every connected user through Socket.IO.
- **Message history.** The latest messages load when you join, and a **Show Previous Message!** button loads older ones.
- **Online user list.** The list updates as people join and leave. Admins also see offline users.
- **Per-user identity.** Each user gets a random message color, and the navbar shows their Gravatar.
- **Moderation.** Admins can mute (read-only) or ban (disconnect and block) other users. Admins can't be muted or banned.
- **Rate limiting.** A user can post at most one message every 15 seconds.
- **Error alerts.** Server-side errors are sent over the socket and shown as alerts in the UI. They are also logged to `debug/socket.log`.

## Tech stack

| Layer    | Technologies                                                         |
| -------- | -------------------------------------------------------------------- |
| Server   | Node.js, Express 4, Socket.IO 2, Passport + JWT, bcryptjs, log4js     |
| Database | MongoDB with Mongoose 5, migrate-mongo for seeding                    |
| Client   | Angular 6 (NgModules), RxJS 6, ngx-socket-io, Bootstrap 4, ng-bootstrap |

## Prerequisites

- **Node.js 12.x**, ideally managed with [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows).
- **npm** (comes with Node.js).
- **MongoDB** running locally on `mongodb://localhost:27017`, or any MongoDB instance you can reach.

### Node version compatibility

The client uses Angular CLI 6, which is built on webpack 4. On **Node 17 and later**, webpack 4 fails with `ERR_OSSL_EVP_UNSUPPORTED` because of OpenSSL 3, and other build tools from that era may break too. Use Node 12 (Node 10 or 14 should also work):

```bash
nvm install 12
nvm use 12
node -v   # should print v12.x
```

If you must use a newer Node version, you can try `NODE_OPTIONS=--openssl-legacy-provider` as a workaround for the OpenSSL error, but it isn't supported.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/ptitsynamv/websocket.git
cd websocket
npm install
npm install --prefix client
```

### 2. Point the server at your database

In development, the server reads its settings from `config/keys.dev.js`. That file currently points to a hosted mLab database, and mLab has shut down. Change it to your local MongoDB:

```js
// config/keys.dev.js
module.exports = {
    mongoUrl: 'mongodb://localhost:27017/websocket',
    jwt: 'any-dev-secret'
};
```

### 3. Seed the database

The migration creates the `users` collection with a schema validator, adds unique indexes on `email` and `color`, and inserts an admin account:

```bash
cd migrations
npx migrate-mongo up
cd ..
```

The migration settings (`migrations/config.js`) use `mongodb://localhost:27017` and the database `websocket`.

You can now sign in as the admin:

| Email             | Password |
| ----------------- | -------- |
| `admin@admin.com` | `qwerty` |

### 4. Run the app

```bash
npm run dev
```

This starts both processes:

- the **API and WebSocket server** on <http://localhost:3000>, restarted automatically by nodemon
- the **Angular dev server** on <http://localhost:4200>, which proxies `/api/*` to port 3000

Open <http://localhost:4200> and sign in. To try the chat with several users, sign in with a different email in a second browser or a private window.

## Available scripts

Run these from the repository root:

| Command          | Description                                     |
| ---------------- | ----------------------------------------------- |
| `npm run dev`    | Runs the server and the client together         |
| `npm run server` | Runs only the server, with nodemon              |
| `npm start`      | Runs only the server, with plain `node`         |
| `npm run client` | Runs only the Angular dev server, with the proxy |

Run these from `client/`:

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run build` | Builds the client into `client/dist/client`  |
| `npx ng lint`   | Lints the client with TSLint and codelyzer   |

## Configuration

`config/keys.js` loads `config/keys.dev.js` by default and `config/keys.prod.js` when `NODE_ENV=production`. In production, set these environment variables:

| Variable    | Purpose                                                 |
| ----------- | ------------------------------------------------------- |
| `MONDO_URI` | MongoDB connection string (the name really is spelled `MONDO`) |
| `JWT`       | Secret used to sign and verify JWTs                     |
| `PORT`      | HTTP port for the server (default `3000`)               |

The client connects to the socket server at `ws://localhost:3000`. That address is set in `client/src/app/app.module.ts`.

## Project structure

```
websocket/
├── index.js              # Entry point: starts the HTTP server and attaches Socket.IO
├── app.js                # Express app: MongoDB connection, Passport, REST routes
├── config/               # Config per environment (dev / prod)
├── controllers/
│   ├── auth.js           # POST /api/auth/login (signs in, or creates the account)
│   └── chat.js           # All Socket.IO event handlers and online-user state
├── models/               # Mongoose models: User, Message
├── routes/               # Express routers
├── soft/                 # Passport strategy, error handler, logging and helpers
├── migrations/           # migrate-mongo config and seed migration
└── client/               # Angular 6 application
    └── src/app/
        ├── login-page/   # Sign-in form
        ├── chat-page/    # Chat room: messages, user list, moderation
        └── shared/
            ├── services/ # AuthService (REST and session), ChatService (socket events)
            ├── classes/  # AuthGuard, error mapping, user model
            ├── components/ # Alert and loader
            └── directive/  # Gravatar directive
```

### Socket events

| Direction        | Event                | Payload                                   |
| ---------------- | -------------------- | ----------------------------------------- |
| client → server  | `login` / `logout`   | JWT string                                |
| client → server  | `message`            | `{ sender: <JWT>, comment }`              |
| client → server  | `mute` / `ban`       | `{ sender: <JWT>, userForMuteId \| userForBanId }` |
| client → server  | `getPreviousMessage` | `{ paginationSkip, paginationLimit }`     |
| server → client  | `message`            | `{ isNewMessage, message: [...] }`        |
| server → client  | `allUsers`           | Object of users keyed by ID, with an `isOnline` flag |
| server → client  | `serverError`        | `{ code, message }`                       |

## Troubleshooting

- **`Error: listen EADDRINUSE :::3000`**: another process is using port 3000. Stop it, for example with `kill $(lsof -t -i:3000)` on macOS or Linux, or `npx kill-port 3000` on any OS.
- **`ERR_OSSL_EVP_UNSUPPORTED` when you start the client**: you are on Node 17 or later. Switch to Node 12 with `nvm use 12`.
- **`Cannot find module 'jsonwebtoken'`**: the server uses `jsonwebtoken`, but `package.json` doesn't list it, so a fresh install may not include it. Run `npm install jsonwebtoken`.
- **You are signed out after about 10 minutes**: this is expected. Tokens expire after 10 minutes, so sign in again.

## License

This project is licensed under the ISC license, as declared in `package.json`.
