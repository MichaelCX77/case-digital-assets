-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContaCliente" (
    "idConta" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,

    PRIMARY KEY ("idConta", "idCliente"),
    CONSTRAINT "ContaCliente_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
