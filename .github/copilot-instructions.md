# Copilot Instructions

## Project overview
- Monorepo with `Backend` and `Frontend` folders.
- Backend uses TypeScript, Express 5, Mongoose, Clerk, Inngest, Stream Chat, and Stream Video.
- Frontend uses React 19, Vite, TypeScript, and Clerk.

## Backend conventions
- Runtime is Node ESM (`"type": "module"`).
- Use local ESM imports with `.js` in TypeScript source when needed.
- Backend build runs `tsc` followed by `tsc-alias`.
- Express handlers should use TypeScript types for `Request` and `Response`.
- Mongoose models live in `Backend/src/Models`.
- Shared backend libraries live in `Backend/src/lib`.
- Route files live in `Backend/src/Routes`.
- Middleware files live in `Backend/src/Middleware`.

## Libraries in use
### Backend
- `express`
- `mongoose`
- `@clerk/express`
- `inngest`
- `stream-chat`
- `@stream-io/node-sdk`
- `dotenv`
- `cors`

### Frontend
- `react`
- `react-dom`
- `@clerk/react`
- `vite`

## Editing guidance
- Prefer keeping changes minimal and localized.
- Preserve existing folder casing like `Models`, `Routes`, `Middleware`, and `lib`.
- Keep backend code in TypeScript.
- For strict TypeScript errors, prefer explicit interfaces and narrow request types.
- Avoid importing code from outside this repository.
