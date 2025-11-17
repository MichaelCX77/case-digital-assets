# API de Gerenciamento Financeiro e OAuth

Esta API provê operações para gerenciamento de clientes, contas correntes, associações entre clientes e contas, transações financeiras e autenticação via OAuth.

---

## 1. Clientes

- **GET /clientes**
  - Retorna a lista de todos os clientes cadastrados.
  - Origem: tabela `Cliente`.

- **POST /clientes**
  - Cria um novo cliente informando nome, email, senha e perfil de acesso.
  - Armazena na tabela `Cliente`.
  - O campo `email` deve ser único, senha armazenada como hash.

- **GET /clientes/{id_cliente}**
  - Retorna os dados completos de um cliente pelo ID.

- **PUT /clientes/{id_cliente}**
  - Atualiza informações de um cliente: email, senha, nome ou perfil.

- **DELETE /clientes/{id_cliente}**
  - Remove um cliente e atualiza ou remove vínculos em `ContaCliente` e transações.

- **GET /clientes/{id_cliente}/contas**
  - Lista todas as contas associadas ao cliente.
  - Origem: tabela `ContaCliente`.

- **POST /clientes/{id_cliente}/contas**
  - Vincula uma conta existente a um cliente.

---

## 2. Contas Correntes

- **GET /contas**
  - Retorna todas as contas cadastradas.
  - Origem: tabela `ContaCorrente`.

- **POST /contas**
  - Cria uma nova conta corrente com saldo inicial.

- **GET /contas/{id_conta}**
  - Retorna detalhes de uma conta específica.

- **DELETE /contas/{id_conta}**
  - Remove a conta e vínculos com clientes e transações.

- **GET /contas/{id_conta}/clientes**
  - Lista clientes associados à conta.
  - Origem: tabela `ContaCliente`.

- **POST /contas/{id_conta}/clientes**
  - Adiciona um cliente a uma conta existente.

---

## 3. Transações

- **GET /contas/{id_conta}/transacoes**
  - Lista histórico de transações de uma conta.
  - Origem: tabela `Transacao`.

- **POST /contas/{id_conta}/transacoes**
  - Cria uma nova transação (`DEPOSITO`, `SAQUE`, `TRANSFERENCIA`).
  - Atualiza saldo automaticamente.
  - Campos `saldo_antes` e `saldo_depois` refletem a operação.
  - `idClienteOperador` opcional.

---

## 4. Usuários (OAuth)

- **GET /users**
  - Lista todos os usuários cadastrados com roles associadas.

- **POST /users**
  - Cria um novo usuário.
  - Campos obrigatórios: `username`, `password` (hash).
  - Opcional: roles.

- **GET /users/{id_user}**
  - Retorna detalhes de um usuário.

- **PUT /users/{id_user}**
  - Atualiza `username`, `password` e roles de um usuário.

- **DELETE /users/{id_user}**
  - Remove o usuário e vínculos em `UserRoles`.

---

## 5. Roles (Perfis de Acesso)

- **GET /roles**
  - Lista todos os roles.

- **POST /roles**
  - Cria um novo role (`name` único).

- **GET /roles/{id_role}**
  - Retorna detalhes de um role e usuários associados.

- **PUT /roles/{id_role}**
  - Atualiza o nome do role.

- **DELETE /roles/{id_role}**
  - Remove o role e vínculos em `UserRoles`.

---

## Observações Gerais

- Vínculo entre clientes e contas mantido pela tabela `ContaCliente`.
- Saldo das contas alterado apenas por tran
