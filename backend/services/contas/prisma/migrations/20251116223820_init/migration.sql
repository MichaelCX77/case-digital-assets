-- CreateTable
CREATE TABLE "ContaCorrente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "saldo" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ContaCliente" (
    "idConta" INTEGER NOT NULL,
    "idCliente" INTEGER NOT NULL,

    PRIMARY KEY ("idConta", "idCliente"),
    CONSTRAINT "ContaCliente_idConta_fkey" FOREIGN KEY ("idConta") REFERENCES "ContaCorrente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
