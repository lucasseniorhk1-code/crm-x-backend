# Guia de Migração da API - Relacionamentos como Objetos

## Resumo das Mudanças

A partir desta versão, todos os relacionamentos nas respostas da API são retornados como **objetos com ID** ao invés de IDs simples.

## Mudanças por Entidade

### 1. Accounts (`/api/accounts`)

**Antes:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Empresa ABC",
  "segment": "Tecnologia",
  "responsibleId": "456e7890-e89b-12d3-a456-426614174001",
  "status": "ACTIVE",
  "type": "Client",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Agora:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Empresa ABC",
  "segment": "Tecnologia",
  "responsible": {
    "id": "456e7890-e89b-12d3-a456-426614174001"
  },
  "status": "ACTIVE",
  "type": "Client",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Mudanças:**
- `responsibleId` → `responsible: { id }`

### 2. Business (`/api/business`)

**Antes:**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "title": "Projeto XYZ",
  "accountId": "123e4567-e89b-12d3-a456-426614174000",
  "ownerId": "456e7890-e89b-12d3-a456-426614174001",
  "value": 50000,
  "stage": "Proposal",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Agora:**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "title": "Projeto XYZ",
  "account": {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  },
  "owner": {
    "id": "456e7890-e89b-12d3-a456-426614174001"
  },
  "value": 50000,
  "stage": "Proposal",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Mudanças:**
- `accountId` → `account: { id }`
- `ownerId` → `owner: { id }` (opcional)

### 3. Users (`/api/users`)

**Antes:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "role": "SALES_REP",
  "managerId": "111e2222-e89b-12d3-a456-426614174003",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Agora:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "role": "SALES_REP",
  "manager": {
    "id": "111e2222-e89b-12d3-a456-426614174003"
  },
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Mudanças:**
- `managerId` → `manager: { id }` (opcional)

### 4. Account Timeline (`/api/account-timeline`)

**Antes:**
```json
{
  "id": "333e4444-e89b-12d3-a456-426614174004",
  "accountId": "123e4567-e89b-12d3-a456-426614174000",
  "type": "MEETING",
  "title": "Reunião de apresentação",
  "date": "2024-12-15T14:00:00Z",
  "createdBy": "456e7890-e89b-12d3-a456-426614174001",
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Agora:**
```json
{
  "id": "333e4444-e89b-12d3-a456-426614174004",
  "account": {
    "id": "123e4567-e89b-12d3-a456-426614174000"
  },
  "type": "MEETING",
  "title": "Reunião de apresentação",
  "date": "2024-12-15T14:00:00Z",
  "createdBy": {
    "id": "456e7890-e89b-12d3-a456-426614174001"
  },
  "createdAt": "2024-12-15T10:00:00Z"
}
```

**Mudanças:**
- `accountId` → `account: { id }`
- `createdBy` → `createdBy: { id }`

### 5. Items (`/api/items`)

**Sem mudanças** - Esta entidade não possui relacionamentos.

## Compatibilidade de Entrada

### ✅ Entrada de Dados (POST/PUT)

**Não há mudanças** na entrada de dados. Continue usando IDs simples:

```json
// POST /api/accounts
{
  "name": "Nova Empresa",
  "segment": "Tecnologia",
  "responsibleId": "456e7890-e89b-12d3-a456-426614174001"
}

// POST /api/business
{
  "title": "Novo Negócio",
  "accountId": "123e4567-e89b-12d3-a456-426614174000",
  "ownerId": "456e7890-e89b-12d3-a456-426614174001",
  "value": 25000,
  "stage": "Prospecting"
}
```

### ✅ Filtros Dinâmicos

**Não há mudanças** nos filtros. Continue usando a mesma sintaxe:

```bash
# Filtros continuam funcionando normalmente
GET /api/accounts?filter=responsible.name = 'João Silva'
GET /api/business?filter=account.status = 'ACTIVE' AND owner.role = 'SALES_REP'
```

## Migração do Código Cliente

### JavaScript/TypeScript

**Antes:**
```javascript
// Acessando o ID do responsável
const responsibleId = account.responsibleId;

// Acessando o ID da conta
const accountId = business.accountId;

// Acessando o ID do gerente
const managerId = user.managerId;
```

**Agora:**
```javascript
// Acessando o ID do responsável
const responsibleId = account.responsible.id;

// Acessando o ID da conta
const accountId = business.account.id;

// Acessando o ID do gerente (verificar se existe)
const managerId = user.manager?.id;
```

### Verificação de Relacionamentos Opcionais

```javascript
// Verificar se owner existe antes de acessar
if (business.owner) {
  const ownerId = business.owner.id;
}

// Ou usando optional chaining
const ownerId = business.owner?.id;

// Verificar se manager existe
const managerId = user.manager?.id;
```

## Benefícios da Nova Estrutura

1. **Consistência:** Todos os relacionamentos seguem o mesmo padrão
2. **Extensibilidade:** Facilita a adição de mais campos nos relacionamentos no futuro
3. **Clareza:** Fica mais claro que se trata de um relacionamento, não apenas um campo
4. **Preparação para Expansão:** Permite incluir mais dados do relacionamento quando necessário

## Exemplo de Expansão Futura

No futuro, poderemos incluir mais dados nos relacionamentos:

```json
{
  "id": "123",
  "name": "Empresa ABC",
  "responsible": {
    "id": "456",
    "name": "João Silva",
    "email": "joao@empresa.com"
  }
}
```

## Checklist de Migração

- [ ] Atualizar código cliente para acessar `objeto.id` ao invés de `objetoId`
- [ ] Verificar relacionamentos opcionais com optional chaining (`?.`)
- [ ] Testar todas as integrações com as novas estruturas
- [ ] Atualizar documentação interna
- [ ] Verificar se filtros dinâmicos continuam funcionando
- [ ] Confirmar que entrada de dados (POST/PUT) não foi afetada

## Suporte

Se você encontrar problemas durante a migração:

1. Verifique se está acessando os relacionamentos corretamente (`objeto.id`)
2. Confirme que relacionamentos opcionais são tratados adequadamente
3. Teste os filtros dinâmicos para garantir que continuam funcionando
4. Entre em contato com a equipe de desenvolvimento se precisar de ajuda