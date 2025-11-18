# Case Digital Assets Project — FullStack

This is the backend for the **Case Digital Assets** project (`MichaelCX77/case-digital-assets`).  
Below are the steps to run the project locally with a single command.

## Solution_Diagram_AWS — Target Plateau

![](docs/refinamento/assets/aws_soluction_diagram.png)

---

## Prerequisites

- [Node.js (v18+)](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MichaelCX77/case-digital-assets.git
   cd case-digital-assets/backend
   ```

2. **Create or edit your environment file:**
   > Make sure you have a `.env` in the `backend` folder with the required settings (database URL, secrets, etc).
   > For development, SQLite is used by default — no further database or Docker setup needed!

   Example (`.env`):
   ```
   DATABASE_URL="file:./dev.db"
   ```

---

## Running Locally (One Command)

Just run:

```bash
npm run setup
```

This script will:

- Install all dependencies (`npm install`)
- Apply database migrations (`npm run migrate:deploy`)
- Start the backend in **development mode with hot reload** (`npm run start:dev`)
- Prisma will use the default local SQLite file (`dev.db`) for data storage.

---

## Other Useful Scripts

```bash
# Start in development mode only (hot reload):
npm run start:dev

# Start in production mode (needs build first):
npm run build
npm run start:prod

# Migrate database with development mode:
npm run migrate:dev

# Generate Prisma client:
npx prisma generate

# Run unit tests:
npm run test

# Formatting code:
npm run format

# Lint code:
npm run lint

# End-to-end tests:
npm run test:e2e
```

---

## Project Structure

- `src/` — Application source code
- `prisma/` — Prisma models and migrations
- `test/` — Unit and e2e test codes
- `docs/` — Documentation assets

---

## Notes

- No need for local database setup or Docker — all data is stored in an embedded SQLite file.
- For custom configuration, always check and update your `.env` file.
- CORS (Cross-Origin Resource Sharing) is enabled and configurable via environment variables for frontend integration.
- Swagger documentation is available at `/api` when running locally.
- See internal documentation for details on endpoints and business rules.

---