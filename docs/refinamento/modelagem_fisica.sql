-- =============================================================================
-- Tabela: clientes
-- Armazena os dados dos clientes do sistema.
--
-- Campos:
--   id_cliente      INTEGER, PRIMARY KEY AUTOINCREMENT
--                   Identificador único do cliente.
--
--   nome            TEXT, NOT NULL
--                   Nome completo do cliente.
--
--   email           TEXT, NOT NULL, UNIQUE
--                   Email único do cliente (login).
--
--   senha_hash      TEXT, NOT NULL
--                   Hash da senha do cliente (não armazenar senhas em texto puro).
--
--   perfil_acesso   TEXT, NOT NULL
--                   Perfil de acesso no sistema (ex: 'titular', 'operador', 'admin').
-- =============================================================================
CREATE TABLE clientes (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil_acesso TEXT NOT NULL
);



-- =============================================================================
-- Tabela: conta_corrente
-- Gerencia as contas correntes e respectivos saldos.
--
-- Campos:
--   id_conta     INTEGER, PRIMARY KEY AUTOINCREMENT
--                Identificador único da conta corrente.
--
--   saldo        NUMERIC, NOT NULL, DEFAULT 0
--                Saldo atual da conta (deve ser atualizado apenas via transações).
-- =============================================================================
CREATE TABLE conta_corrente (
    id_conta INTEGER PRIMARY KEY AUTOINCREMENT,
    saldo NUMERIC NOT NULL DEFAULT 0
);

-- =============================================================================
-- Tabela: conta_clientes
-- Tabela de associação entre clientes e contas correntes.
--
-- Permite múltiplos clientes titulares por conta.
--
-- Campos:
--   id_conta     INTEGER, NOT NULL
--                Identificador de conta corrente (FK).
--
--   id_cliente   INTEGER, NOT NULL
--                Identificador de cliente (FK).
--
-- Chave primária composta: (id_conta, id_cliente)
--
-- Regras de integridade:
--   Se uma conta ou cliente for excluído/alterado, o vínculo será atualizado/excluído.
-- =============================================================================
CREATE TABLE conta_clientes (
    id_conta   INTEGER NOT NULL,
    id_cliente INTEGER NOT NULL,

    PRIMARY KEY (id_conta, id_cliente),

    FOREIGN KEY (id_conta) REFERENCES conta_corrente(id_conta)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- =============================================================================
-- Tabela: transacoes
-- Registra todas as operações realizadas em uma conta corrente
-- (Depósito, Saque ou Transferência).
--
-- Campos:
--   id_transacao         INTEGER, PRIMARY KEY AUTOINCREMENT
--                        Identificador único da transação.
--
--   id_conta             INTEGER, NOT NULL
--                        Conta corrente afetada pela transação (FK).
--
--   tipo                 TEXT, NOT NULL
--                        Tipo da operação: 'DEPOSITO', 'SAQUE' ou 'TRANSFERENCIA'.
--
--   valor                NUMERIC, NOT NULL
--                        Valor movimentado (positivo ou negativo conforme operação).
--
--   data_hora            DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP
--                        Data/hora em que a transação foi realizada.
--
--   saldo_antes          NUMERIC, NOT NULL
--                        Saldo da conta antes da transação.
--
--   saldo_depois         NUMERIC, NOT NULL
--                        Saldo da conta após a transação.
--
--   id_cliente_operador  INTEGER
--                        Identificador do cliente operador (quem realizou a operação, titular ou externo).
--
-- Integridade:
--   Ao apagar conta, elimina transações vinculadas (CASCADE).
--   Ao apagar cliente operador, mantém transação e apenas 'nullifica' o operador (SET NULL).
-- =============================================================================
CREATE TABLE transacoes (
    id_transacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_conta INTEGER NOT NULL,

    tipo TEXT NOT NULL,               -- 'DEPOSITO', 'SAQUE', 'TRANSFERENCIA'
    valor NUMERIC NOT NULL,

    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    saldo_antes NUMERIC NOT NULL,
    saldo_depois NUMERIC NOT NULL,

    id_cliente_operador INTEGER,

    FOREIGN KEY (id_conta) REFERENCES conta_corrente(id_conta)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (id_cliente_operador) REFERENCES clientes(id_cliente)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);