# Documentação dos Endpoints da API

Esta API provê operações para gerenciamento de clientes, contas correntes, associações entre clientes e contas, e para realização de transações financeiras. Os endpoints estão segregados por objeto principal para facilitar o entendimento:

---

## 1. Clientes

- **GET /clientes**
  - Retorna a lista de todos os clientes cadastrados.
  - Permite paginação ou filtragem (opcional).
  - Origem dos dados: tabela `clientes`.

- **POST /clientes**
  - Cria um novo cliente informando nome, email, senha e perfil de acesso.
  - Os dados enviados são armazenados na tabela `clientes`.
  - O campo `email` deve ser único, e a senha deve ser recebida e armazenada como hash.

- **GET /clientes/{id_cliente}**
  - Busca e exibe os dados completos de um cliente a partir do seu identificador (`id_cliente`).

- **PUT /clientes/{id_cliente}**
  - Atualiza as informações de um cliente existente, exceto o identificador.
  - Permite troca de email, senha, nome ou perfil.

- **DELETE /clientes/{id_cliente}**
  - Remove um cliente pelo seu identificador.
  - Todos os vínculos na tabela `conta_clientes` e transações em que era operador são atualizados ou removidos conforme regras do banco.

- **GET /clientes/{id_cliente}/contas**
  - Lista todas as contas correntes às quais um determinado cliente está vinculado.
  - Utiliza a tabela de associação `conta_clientes` para obter as contas.

- **POST /clientes/{id_cliente}/contas**
  - Vincula uma conta corrente existente a um cliente específico.
  - Adiciona um registro na tabela `conta_clientes`.

---

## 2. Contas Correntes

- **GET /contas**
  - Retorna a lista de todas as contas correntes cadastradas.
  - Origem dos dados: tabela `conta_corrente`.

- **POST /contas**
  - Cria uma nova conta corrente, informando o saldo inicial.
  - Saldo inicial deve ser definido e será controlado somente por transações depois da criação.

- **GET /contas/{id_conta}**
  - Exibe detalhes de uma conta corrente específica, identificada por seu ID.

- **DELETE /contas/{id_conta}**
  - Remove uma conta corrente, apagando vínculos com clientes e todas as transações associadas a essa conta.

- **GET /contas/{id_conta}/clientes**
  - Lista todos os clientes titulares (ou operadores) vinculados à conta corrente.
  - Origem dos dados: tabela `conta_clientes`.

- **POST /contas/{id_conta}/clientes**
  - Vincula um cliente existente à conta corrente indicada.
  - Adiciona registro na tabela `conta_clientes`.

---

## 3. Transações

- **GET /contas/{id_conta}/transacoes**
  - Lista todo o histórico de movimentações financeiras de uma conta corrente.
  - Origem dos dados: tabela `transacoes`, utilizando o campo `id_conta`.
  - Cada registro inclui tipo de operação, valor, data/hora, operador, saldo antes e saldo depois.

- **POST /contas/{id_conta}/transacoes**
  - Registra uma nova transação para uma conta corrente.
  - Os tipos de transação permitidos são `DEPOSITO`, `SAQUE` ou `TRANSFERENCIA`.
  - O valor movimentado atualiza o saldo da conta conforme regras de negócio (não é permitido alterar saldo diretamente).
  - Os campos `saldo_antes` e `saldo_depois` devem refletir o resultado da movimentação sobre a conta.
  - O identificador do cliente operador pode ser informado para rastreio de quem realizou a operação.

---

## Observações Gerais

- **Vínculo entre clientes e contas** é mantido pela tabela `conta_clientes`, permitindo múltiplos titulares por conta e múltiplas contas por cliente.
- **Saldo das contas** só pode ser alterado por meio de registros em `transacoes`; qualquer movimentação financeira é registrada e rastreável.
- **Integridade referencial**: exclusões de clientes, contas ou vínculos são propagadas pelas tabelas associativas conforme regras (CASCADE/SET NULL).
- Todos os endpoints propostos estão aderentes ao modelo relacional do banco de dados presente.
