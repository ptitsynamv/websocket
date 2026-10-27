# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A real-time chat app: a Node/Express + Socket.IO 2 + MongoDB (Mongoose 5) server at the repo root, and an **Angular 6** client in `client/` (NgModules, Bootstrap 4 / ng-bootstrap, `ngx-socket-io`). The server is plain CommonJS JavaScript. The client is old Angular, so it has no standalone components, signals, or `inject()`. Match the existing NgModule style and don't migrate it to newer patterns unless asked.

## Commands

Run these from the repo root unless noted otherwise:

- `npm i` installs the server deps. Run `npm i` again inside `client/` for the client.
- `npm run dev` starts the server (nodemon, port 3000) and the client (`ng serve` on 4200) together via `concurrently`.
- `npm run server` starts only the server, with nodemon. `npm start` runs it with plain node (`node index`).
- `npm run client` starts only the client. It runs `ng serve --proxy-config proxy.conf.json`.
- `cd client && npm run build` builds the client (`ng build`).
- `cd client && npx ng lint` lints the client with TSLint and codelyzer (`client/tslint.json`).
- `cd migrations && migrate-mongo up` seeds the DB. It creates the `users` collection with a schema validator, unique indexes on `email` and `color`, and an admin user (`admin@admin.com` / `qwerty`).

There are no real tests. The client still has the Karma/Protractor scaffolding from the Angular CLI (`ng test`, `ng e2e`), but there are no meaningful specs, and the server has no test setup.

If the server fails with `EADDRINUSE :::3000`, another process is holding port 3000. Kill that process.

## Architecture

### Server

- `index.js` starts the HTTP server from `app.js`, attaches Socket.IO to it, and hands the io instance to `controllers/chat.js`.
- `app.js` sets up Express, the Mongoose connection, and Passport's JWT strategy (`soft/passport.js`). Its only REST route is `POST /api/auth/login`.
- `controllers/auth.js` handles login, which **also registers**: an unknown email creates a user with a random color from `soft/helpFunctions.js`. It returns a JWT that expires after 10 minutes, together with the user's flags.
- `controllers/chat.js` holds almost all of the app logic, in Socket.IO event handlers:
  - Client → server events: `login`, `logout`, `message`, `mute`, `ban`, `getPreviousMessage`.
  - Server → client events: `message` (`{isNewMessage, message: [...]}`), `allUsers`, `serverError` (`{code, message}`).
  - Each event carries the JWT in its payload (`login`/`logout` send the raw token, the others send `msg.sender`). The handler verifies it with `jwt.verify`. Sockets are not authenticated at connection time.
  - The server keeps state in memory in two module-level `Map`s: `peers` (userId → socket) and `allUsers`. Broadcasting means iterating over `peers`. It doesn't use Socket.IO rooms. `updateUsers()` sends `allUsers` after a 10 s `setTimeout`.
  - Rules enforced on the server: banned users are disconnected, muted users can't post, only admins can mute or ban, admins can't be muted or banned, and a user can't post twice within 15 s.
- Errors on sockets go through `helpFunctions.errorSocket`, which emits `serverError` and logs to `debug/socket.log` with log4js. Errors in REST handlers go through `soft/errorHandler.js`.
- Mongoose models live in `models/`. Model names are lowercase plurals (`'users'`, `'messages'`), and `Message.user` refs `'users'`.
- `config/keys.js` picks `keys.dev.js` or `keys.prod.js` based on `NODE_ENV`. Prod reads `process.env.MONDO_URI` (that misspelling is the real variable name) and `process.env.JWT`.
- `jsonwebtoken` is required in the code but isn't listed in `package.json`. It only resolves as a transitive dependency.
- `migrations/config.js` points to `mongodb://localhost:27017/websocket`. The dev app connects to the remote URL in `keys.dev.js` instead, so the two can point at different databases.

### Client (`client/src/app`)

- Routes: `/login` → `LoginPageComponent`, and `/chat` → `ChatPageComponent`, guarded by `AuthGuard`. Both are children of `AppComponent`.
- `shared/services/auth.service.ts` calls the REST login endpoint, stores the user and token in `localStorage['auth-user']`, and keeps the current user in a custom `BehaviorSubject` subclass. That subclass **merges** each `next()` value into the previous one. `AppComponent` restores the user from `localStorage` on startup.
- `shared/services/chat.service.ts` is a thin wrapper over `ngx-socket-io`, with one method per socket event. The socket URL is hardcoded in `app.module.ts` (`ws://localhost:3000`). The dev proxy (`proxy.conf.json`) forwards only `/api/*`.
- `ChatPageComponent` drives the chat. It emits `login` with the token on init, then handles the `message`/`allUsers`/`serverError` streams, pagination (`getPreviousMessage`), and the admin mute/ban actions.
- `shared/classes/errorHandler.service.ts` maps `{code, message}` errors to alert-modal state, which `shared/components/alert` renders. Shared types are in `shared/interfaces.ts`.
