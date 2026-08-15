# Madarsa Manager

A polished React Native app built with **Expo (SDK 57) + TypeScript** for managing a Madarsa — students, expenses, history, roles and more.

## Tech stack

- **Navigation** — Expo Router (file-based routing with route groups)
- **Server state** — TanStack React Query (caching, mutations, invalidation)
- **Forms & validation** — React Hook Form + Zod
- **Secure storage** — `expo-secure-store` for access/refresh tokens (never AsyncStorage)
- **Theming** — custom theme provider with light/dark/system modes, persisted locally
- **Toasts** — lightweight custom provider (zero extra deps)
- **Images** — `expo-image-picker`

## Setup

```bash
npm install
```

Copy the environment example (optional — defaults are already in place):

```bash
cp .env.example .env
```

## Run

```bash
npm start          # start Expo dev server
npm run ios        # run on iOS simulator
npm run android    # run on Android emulator
npm run web        # run in the browser
```

## Environment configuration

| Variable                    | Default                                    | Description                       |
| --------------------------- | ------------------------------------------ | --------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`  | `https://madarsa-app.rahats.in/api/v1`     | Base URL of the versioned API     |

The base URL is resolved in `src/api/endpoints.ts` and read from `EXPO_PUBLIC_API_BASE_URL`.

## Endpoints used

Centralized in `src/api/endpoints.ts`.

| Purpose               | Method   | Path                          |
| --------------------- | -------- | ----------------------------- |
| Login                 | POST     | `/auth/login`                 |
| Signup                | POST     | `/auth/signup`                |
| Forgot password       | POST     | `/auth/forgot-password`       |
| Refresh token         | POST     | `/auth/refresh-token`         |
| Logout                | POST     | `/auth/logout`                |
| List students         | GET      | `/students`                   |
| Student detail        | GET      | `/students/:id`               |
| Create student        | POST     | `/students`                   |
| Update student        | PUT      | `/students/:id`               |
| Delete student        | DELETE   | `/students/:id`               |
| List teachers         | GET      | `/teachers`                   |
| Teacher detail        | GET      | `/teachers/:id`               |
| Create teacher        | POST     | `/teachers`                   |
| Update teacher        | PUT      | `/teachers/:id`               |
| Delete teacher        | DELETE   | `/teachers/:id`               |
| Get expenses/balance  | GET      | `/expenses`                   |
| Add funds             | POST     | `/expenses/add`               |
| Spend funds           | POST     | `/expenses/spend`             |
| History               | GET      | `/history`                    |
| Update user role      | PATCH    | `/users/:id/role`             |

Every authenticated request sends:

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

## Centralized API behavior

`src/api/client.ts` handles, once, for the whole app:

- attaching the bearer token,
- unwrapping `{ success, data }` envelopes (`src/api/response.ts`),
- typed `ApiError` / `NetworkError` with server messages,
- **401 → refresh-token retry** (single-flight, one refresh per burst),
- on refresh failure: clears the session and routes back to login.

## Assumptions & documented gaps

The exact backend shapes were not all supplied, so a few things are centralized to be adapted easily:

1. **Auth response shape** — parsed in one place, `src/services/parseSession.ts` (`parseAuthSession`, `parseRefreshResponse`). Tokens (`accessToken`, `refreshToken`) and `user` (name, email, role) are extracted from common envelopes (`data.*`, `tokens.*`, `user.*`). Adjust only this file if the backend differs.
2. **No `/auth/me`** — the logged-in user (incl. role) is cached locally (AsyncStorage) after login so role gating survives restarts. Credentials themselves live only in SecureStore.
3. **User list endpoint** — `/users` was not documented, so the data source is isolated in `src/services/userService.ts` (`USER_LIST_ENDPOINT_AVAILABLE = false`). The Admin “User role management” section shows a clear empty state plus a manual user-ID input; flipping the flag to `true` and confirming the response shape turns on the searchable user selector.
4. **Profile API** — no profile update/upload endpoint documented. `src/services/profileService.ts` is an isolated placeholder (`PROFILE_API_SUPPORTED = false`); the Profile screen persists photo + name locally and toasts that changes are device-local.
5. **Contribution total** — computed client-side as the sum of the current user’s `ADD_FUND` history records (matched by email/userName), using the records currently loaded from `GET /history`.
6. **Student types** — the form dropdown shows `Day` / `Hostel` and submits `day` / `hostel`. Class options are exactly: `Qaida`, `Amma-para`, `Hifz-e-Quran`, `Tajweed`, `Deenyat`.
7. **Teacher joining date** — there is no date picker; the optional `joiningDate` (when returned by the API) is shown read-only, falling back to the record's `createdAt`.
8. **History pagination** — supported when the API returns `page` / `pages` (load-more button); otherwise all records from the first response are shown.
9. **Mock data** — intentionally **not** included. The app talks only to the real API.

## Project structure

```
app/                    # expo-router routes
  (auth)/               # login, signup, forgot-password
  (tabs)/               # home, admin, history, expenses
  profile.tsx           # profile screen
  settings.tsx          # settings screen
  students/             # list, detail, manage (create/edit)
  teachers/             # list, detail, manage (create/edit)
src/
  api/                  # client, endpoints, errors, response parsing
  services/             # auth, students, expenses, history, users, profile, session parsing
  types/                # typed models
  stores/               # secure token store
  context/              # Auth, Toast providers
  theme/                # colors, tokens, theme provider
  hooks/                # React Query hooks + auth/theme/toast hooks
  components/           # reusable UI (Screen, AppHeader, Card, StatCard, …)
  lib/                  # query client
  utils/                # formatting, validation, storage
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export        # full Metro bundle to confirm the app compiles
```
