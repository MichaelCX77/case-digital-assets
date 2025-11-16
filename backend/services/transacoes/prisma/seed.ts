// services/transacoes/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Exemplo de transação inicial para a conta 1 do cliente 1
  await prisma.transacao.upsert({
    where: { id: 1 },
    update: {}, // não altera se já existe
    create: {
      idConta: 1,
      tipo: 'DEPOSITO',
      valor: 1000,
      saldoAntes: 0,
      saldoDepois: 1000,
      idClienteOperador: 1,
    },
  });

  // Você pode adicionar outras transações iniciais, se necessário
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
