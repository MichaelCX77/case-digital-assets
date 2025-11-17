-- CreateTable
CREATE TABLE "user" (
    "id_user" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "account" (
    "id_account" TEXT NOT NULL PRIMARY KEY,
    "balance" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_account" (
    "account_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("account_id", "user_id"),
    CONSTRAINT "user_account_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id_account") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id_user") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transaction" (
    "id_transaction" TEXT NOT NULL PRIMARY KEY,
    "account_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance_before" REAL NOT NULL,
    "balance_after" REAL NOT NULL,
    "operator_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transaction_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account" ("id_account") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transaction_operator_user_id_fkey" FOREIGN KEY ("operator_user_id") REFERENCES "user" ("id_user") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");
