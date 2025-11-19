```mermaid
sequenceDiagram
  participant Client
  participant Controller
  participant DTO_IN
  participant Service
  participant Repository
  participant Entity
  participant DB
  participant DTO_OUT

  Client->>Controller: GET /accounts
  Controller->>DTO_IN: Parse Request (query/body/params)
  DTO_IN->>Service: listAccounts(DTO_IN)
  Service->>Repository: listAccounts()
  Repository->>Entity: findMany(Account)
  Entity->>DB: SELECT * FROM account
  DB-->>Entity: Account[]
  Entity-->>Repository: Account[]
  Repository-->>Service: Account[]
  Service->>Controller: Map to AccountResponseDto[]
  Controller-->>DTO_OUT: Array<AccountResponseDto>
  DTO_OUT-->>Client: Response
```