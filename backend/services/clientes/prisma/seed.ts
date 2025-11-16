// services/clientes/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Cliente
  await prisma.cliente.upsert({
    where: { email: 'joao.silva@email.com' },
    update: {}, // não altera se já existe
    create: { nome: 'João Silva', email: 'joao.silva@email.com' },
  });

  // Seed ContaCliente
  await prisma.contaCliente.upsert({
    where: { idConta_idCliente: { idConta: 1, idCliente: 1 } },
    update: {}, // não altera se já existe
    create: { idConta: 1, idCliente: 1 },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
