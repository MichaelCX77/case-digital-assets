// services/contas/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed ContaCorrente
  await prisma.contaCorrente.upsert({
    where: { id: 1 },
    update: {}, // não altera se já existe
    create: { saldo: 1000 }, // valor inicial
  });

  // Seed ContaCliente (associando conta 1 ao cliente 1)
  await prisma.contaCliente.upsert({
    where: { idConta_idCliente: { idConta: 1, idCliente: 1 } },
    update: {}, // não altera se já existe
    create: { idConta: 1, idCliente: 1 },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
