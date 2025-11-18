# Projeto Case Consignado — Backend

Este é o backend do projeto **Case Consignado** (`MichaelCX77/case-digital-assets`).  
Abaixo estão as etapas para rodar o projeto localmente.

## Pré-requisitos

- [Node.js (v18+)](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (recomendado para banco de dados local)
- [PostgreSQL](https://www.postgresql.org/) (caso prefira instalar sem Docker)

## Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/MichaelCX77/case-digital-assets.git
   cd case-digital-assets/backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente:**
   - Crie um arquivo `.env` na pasta `backend` baseado em `.env.example` (se existir):
     ```bash
     cp .env.example .env
     ```
   - Preencha com os dados (principalmente da conexão com o banco).

4. **Configure o banco de dados:**
   - Prefira rodar um PostgreSQL local (via Docker ou manual).
   - Exemplo com Docker:
     ```bash
     docker run --name case_postgres -e POSTGRES_PASSWORD=senha -e POSTGRES_USER=usuario -e POSTGRES_DB=case_db -p 5432:5432 -d postgres
     ```
   - Ajuste a `DATABASE_URL` no `.env`:
     ```
     DATABASE_URL="postgresql://usuario:senha@localhost:5432/case_db"
     ```

5. **Migrate e gere o schema do Prisma:**
   ```bash
   npm run migrate:dev
   npx prisma generate
   ```

## Rodando o Projeto

```bash
# Desenvolvimento com hot reload:
npm run start:dev

# Produção:
npm run build
npm run start:prod

# Rodar testes:
npm run test
```

## Scripts úteis

- **Formatar código:** `npm run format`
- **Lint:** `npm run lint`
- **Testes unitários:** `npm run test`
- **Testes E2E:** `npm run test:e2e`

## Estrutura

- `src/` — Código principal
- `prisma/` — Schema do banco e migrations
- `test/` — Testes unitários e e2e

## Observações

- Certifique-se que o banco esteja rodando antes de iniciar o backend.
- Para mais detalhes e endpoints, consulte a documentação interna do projeto.

---

> Projeto desenvolvido para o Case Consignado