# Case Consignado Project — Backend

This is the backend for the **Case Consignado** project (`MichaelCX77/case-digital-assets`).  
Below are the steps to run the project locally.

## Solution_Diagram_AWS - Target Plateau

![](docs/refinamento/assets/aws_soluction_diagram.png)



## Prerequisites

- [Node.js (v18+)](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (recommended for local database)
- [PostgreSQL](https://www.postgresql.org/) (if you prefer manual installation instead of Docker)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MichaelCX77/case-digital-assets.git
   cd case-digital-assets/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the `backend` folder based on `.env.example` (if it exists):
     ```bash
     cp .env.example .env
     ```
   - Fill in the required data (especially the database connection).

4. **Set up the database:**
   - Preferably, run a local PostgreSQL instance (using Docker or manually).
   - Example with Docker:
     ```bash
     docker run --name case_postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_USER=youruser -e POSTGRES_DB=case_db -p 5432:5432 -d postgres
     ```
   - Set the `DATABASE_URL` value in your `.env` file:
     ```
     DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/case_db"
     ```

5. **Run migrations and generate Prisma schema:**
   ```bash
   npm run migrate:dev
   npx prisma generate
   ```

## Running the Project

```bash
# Development with hot reload:
npm run start:dev

# Production:
npm run build
npm run start:prod

# Run tests:
npm run test
```

## Useful Scripts

- **Code formatting:** `npm run format`
- **Lint:** `npm run lint`
- **Unit tests:** `npm run test`
- **E2E tests:** `npm run test:e2e`

## Structure

- `src/` — Main code
- `prisma/` — Database schema and migrations
- `test/` — Unit and e2e tests

## Notes

- Make sure the database is running before starting the backend.
- For more details and endpoints, consult the internal project documentation.

---

> Project developed for Case Consignado