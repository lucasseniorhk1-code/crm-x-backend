# Sistema de Filtros Dinâmicos

O sistema de filtros dinâmicos permite filtrar dados em todas as APIs usando sintaxe SQL-like através do parâmetro `filter`.

## ⚠️ Importante: Nova Estrutura de Relacionamentos

A partir desta versão, os relacionamentos nas respostas da API são retornados como **objetos com ID** ao invés de IDs simples:

**Antes:**
```json
{
  "id": "123",
  "name": "Conta ABC",
  "responsibleId": "456"
}
```

**Agora:**
```json
{
  "id": "123", 
  "name": "Conta ABC",
  "responsible": {
    "id": "456"
  }
}
```

**Nota:** Os filtros e entrada de dados ainda usam a sintaxe com IDs simples para compatibilidade.

## Sintaxe Básica

```
campo operador 'valor'
```

### Operadores Suportados

- `=` - Igual
- `!=` ou `<>` - Diferente
- `<` - Menor que
- `>` - Maior que
- `<=` - Menor ou igual
- `>=` - Maior ou igual
- `LIKE` - Busca com padrão (use % para wildcards)
- `ILIKE` - Busca case-insensitive com padrão
- `IN` - Valor está na lista: `campo IN ('valor1', 'valor2')`
- `NOT IN` - Valor não está na lista

### Operadores Lógicos

- `AND` - E lógico
- `OR` - OU lógico

## Exemplos por Entidade

### 1. Accounts (`/api/accounts`)

**Campos diretos:**
```
name = 'Empresa ABC'
status = 'ACTIVE' AND type = 'Client'
segment LIKE '%Tecnologia%'
created_at >= '2024-01-01T00:00:00Z'
```

**Filtros de relacionamento:**
```
responsible.name = 'João Silva'
responsible.email LIKE '%@empresa.com'
responsible.role = 'MANAGER'
```

### 2. Business (`/api/business`)

**Campos diretos:**
```
value > 10000
stage = 'Proposal'
currency = 'BRL'
probability >= 50
```

**Filtros de relacionamento:**
```
account.name = 'Cliente XYZ'
account.status = 'ACTIVE'
owner.name = 'Maria Santos'
owner.role = 'SALES_REP'
```

### 3. Users (`/api/users`)

**Campos diretos:**
```
role = 'ADMIN'
name LIKE '%Silva%'
email LIKE '%@empresa.com'
```

**Filtros de relacionamento:**
```
manager.name = 'João Gerente'
manager.role = 'MANAGER'
```

### 4. Items (`/api/items`)

**Campos diretos:**
```
type = 'PRODUCT'
price BETWEEN 100 AND 1000
name ILIKE '%software%'
sku_code = 'SKU123'
```

### 5. Account Timeline (`/api/account-timeline`)

**Campos diretos:**
```
type = 'MEETING'
date >= '2024-12-01T00:00:00Z'
title LIKE '%reunião%'
```

**Filtros de relacionamento:**
```
account.name = 'Cliente ABC'
account.status = 'ACTIVE'
createdBy.name = 'Ana Costa'
createdBy.role = 'SALES_REP'
```

## Campos Disponíveis por Entidade

### Account
- **Diretos:** id, name, segment, status, type, pipeline, email, phone, cnpj, instagram, linkedin, whatsapp, created_at, last_interaction, responsible_id
- **Relacionamentos:** responsible.* (id, name, email, role)
- **Estrutura de Resposta:** `responsible: { id: "uuid" }`

### Business
- **Diretos:** id, title, account_id, value, currency, stage, probability, owner_id, closing_date, created_at
- **Relacionamentos:** account.* (id, name, segment, status, type), owner.* (id, name, email, role)
- **Estrutura de Resposta:** `account: { id: "uuid" }`, `owner: { id: "uuid" }`

### Users
- **Diretos:** id, name, role, manager_id, email, created_at
- **Relacionamentos:** manager.* (id, name, email, role)
- **Estrutura de Resposta:** `manager: { id: "uuid" }`

### Item
- **Diretos:** id, name, type, price, sku_code, description, created_at
- **Relacionamentos:** Nenhum

### Account Timeline
- **Diretos:** id, account_id, type, title, description, date, created_by, created_at
- **Relacionamentos:** account.* (id, name, segment, status, type), createdBy.* (id, name, email, role)
- **Estrutura de Resposta:** `account: { id: "uuid" }`, `createdBy: { id: "uuid" }`

## Exemplos Complexos

### Filtro com múltiplas condições
```
status = 'ACTIVE' AND type = 'Client' AND responsible.role = 'MANAGER'
```

### Filtro com OR
```
type = 'Lead' OR type = 'Prospect'
```

### Filtro com IN
```
status IN ('ACTIVE', 'INACTIVE') AND type = 'Client'
```

### Filtro com LIKE e relacionamento
```
name LIKE '%Tech%' AND responsible.email LIKE '%@empresa.com'
```

### Filtro de data com relacionamento
```
created_at >= '2024-01-01T00:00:00Z' AND account.status = 'ACTIVE'
```

## Uso na API

### GET Request
```
GET /api/accounts?filter=status = 'ACTIVE' AND responsible.name = 'João Silva'
```

### URL Encoded
```
GET /api/accounts?filter=status%20%3D%20%27ACTIVE%27%20AND%20responsible.name%20%3D%20%27João%20Silva%27
```

## Validações e Segurança

- **SQL Injection Protection:** Todos os valores são sanitizados
- **Field Validation:** Apenas campos permitidos podem ser filtrados
- **Type Validation:** Valores são validados conforme o tipo do campo
- **Enum Validation:** Campos enum são validados contra valores permitidos

## Limitações

1. **Relacionamentos complexos:** Alguns relacionamentos muito complexos podem não ser suportados
2. **Performance:** Filtros de relacionamento podem impactar performance em grandes datasets
3. **Operadores avançados:** Alguns operadores SQL avançados não são suportados

## Tratamento de Erros

### Erros Comuns

1. **Campo inválido:**
```json
{
  "message": "Invalid field: campo_inexistente for entity account. Allowed fields: id, name, ..."
}
```

2. **Valor inválido:**
```json
{
  "message": "Invalid value for field status: INVALID_STATUS"
}
```

3. **Sintaxe inválida:**
```json
{
  "message": "Invalid filter condition: status = ACTIVE"
}
```

## Dicas de Performance

1. **Use índices:** Filtre por campos indexados quando possível
2. **Limite resultados:** Use paginação com filtros
3. **Evite LIKE com wildcard inicial:** `LIKE '%termo'` é mais lento que `LIKE 'termo%'`
4. **Combine filtros:** Use AND para reduzir o conjunto de dados

## Exemplos de Uso Real

### Buscar contas ativas de um responsável específico
```
GET /api/accounts?filter=status = 'ACTIVE' AND responsible.email = 'joao@empresa.com'
```

### Buscar negócios em proposta com valor alto
```
GET /api/business?filter=stage = 'Proposal' AND value > 50000
```

### Buscar timeline de reuniões de dezembro
```
GET /api/account-timeline?filter=type = 'MEETING' AND date >= '2024-12-01T00:00:00Z' AND date < '2025-01-01T00:00:00Z'
```

### Buscar produtos com preço em uma faixa
```
GET /api/items?filter=type = 'PRODUCT' AND price >= 100 AND price <= 1000
```