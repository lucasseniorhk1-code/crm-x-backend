# Exemplos Práticos de Filtros Dinâmicos

## ⚠️ Nova Estrutura de Relacionamentos

**Importante:** As respostas da API agora retornam relacionamentos como objetos:

```json
// Exemplo de resposta Account
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Empresa ABC",
  "segment": "Tecnologia", 
  "responsible": {
    "id": "456e7890-e89b-12d3-a456-426614174001"
  },
  "status": "ACTIVE",
  "type": "Client"
}

// Exemplo de resposta Business
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
  "stage": "Proposal"
}
```

## Exemplos de Uso Real

### 1. Filtrar Contas por Status e Responsável

**Cenário:** Buscar todas as contas ativas de um responsável específico

```bash
GET /api/accounts?filter=status = 'ACTIVE' AND responsible.name = 'João Silva'
```

**URL Encoded:**
```bash
GET /api/accounts?filter=status%20%3D%20%27ACTIVE%27%20AND%20responsible.name%20%3D%20%27João%20Silva%27
```

### 2. Filtrar Negócios por Valor e Estágio

**Cenário:** Buscar negócios em proposta com valor acima de R$ 50.000

```bash
GET /api/business?filter=stage = 'Proposal' AND value > 50000
```

### 3. Filtrar Timeline por Tipo e Data

**Cenário:** Buscar todas as reuniões de dezembro de 2024

```bash
GET /api/account-timeline?filter=type = 'MEETING' AND date >= '2024-12-01T00:00:00Z' AND date < '2025-01-01T00:00:00Z'
```

### 4. Filtrar Usuários por Cargo e Gerente

**Cenário:** Buscar vendedores que reportam para um gerente específico

```bash
GET /api/users?filter=role = 'SALES_REP' AND manager.name = 'Maria Gerente'
```

### 5. Filtrar Produtos por Preço e Nome

**Cenário:** Buscar produtos com "software" no nome e preço entre R$ 100 e R$ 1000

```bash
GET /api/items?filter=type = 'PRODUCT' AND name ILIKE '%software%' AND price >= 100 AND price <= 1000
```

### 6. Filtros Complexos com OR

**Cenário:** Buscar contas que são leads ou prospects

```bash
GET /api/accounts?filter=type = 'Lead' OR type = 'Prospect'
```

### 7. Filtros com IN

**Cenário:** Buscar negócios em múltiplos estágios

```bash
GET /api/business?filter=stage IN ('Proposal', 'Negotiation', 'Closed Won')
```

### 8. Filtros de Relacionamento Complexos

**Cenário:** Buscar negócios de contas ativas com proprietário específico

```bash
GET /api/business?filter=account.status = 'ACTIVE' AND owner.email = 'vendedor@empresa.com'
```

### 9. Filtros com LIKE para Busca Textual

**Cenário:** Buscar contas com "tecnologia" no segmento

```bash
GET /api/accounts?filter=segment LIKE '%Tecnologia%'
```

### 10. Filtros por Data de Criação

**Cenário:** Buscar contas criadas nos últimos 30 dias

```bash
GET /api/accounts?filter=created_at >= '2024-11-15T00:00:00Z'
```

## Combinando com Paginação

Você pode combinar filtros com paginação:

```bash
GET /api/accounts?filter=status = 'ACTIVE'&page=1&size=10
```

## Tratamento de Caracteres Especiais

Para valores com espaços ou caracteres especiais, use aspas:

```bash
GET /api/accounts?filter=name = 'Empresa ABC Ltda'
```

## Filtros Case-Insensitive

Use ILIKE para busca case-insensitive:

```bash
GET /api/accounts?filter=name ILIKE '%abc%'
```

## Validação de Campos

O sistema valida automaticamente:
- **UUIDs** para campos de ID
- **Emails** para campos de email
- **Enums** para campos com valores predefinidos
- **Números** para campos numéricos
- **Datas** para campos de data/hora

## Exemplos de Erros Comuns

### Campo Inválido
```bash
GET /api/accounts?filter=campo_inexistente = 'valor'
```
**Resposta:**
```json
{
  "message": "Invalid field: campo_inexistente for entity account. Allowed fields: id, name, segment, ..."
}
```

### Valor Inválido para Enum
```bash
GET /api/accounts?filter=status = 'INVALID_STATUS'
```
**Resposta:**
```json
{
  "message": "Invalid value for field status: INVALID_STATUS"
}
```

### Sintaxe Inválida
```bash
GET /api/accounts?filter=status INVALID 'ACTIVE'
```
**Resposta:**
```json
{
  "message": "Invalid operator: INVALID. Allowed operators: =, !=, <>, <, >, <=, >=, LIKE, ILIKE, IN, NOT IN"
}
```

## Dicas de Performance

1. **Use campos indexados:** Filtre por campos que têm índices no banco
2. **Evite LIKE com wildcard inicial:** `name LIKE 'ABC%'` é mais rápido que `name LIKE '%ABC'`
3. **Combine filtros específicos:** Use AND para reduzir o conjunto de dados
4. **Use paginação:** Sempre combine filtros com paginação para grandes datasets

## Campos Mais Utilizados

### Accounts
- `status` - Status da conta
- `type` - Tipo da conta
- `responsible.name` - Nome do responsável
- `segment` - Segmento da conta

### Business
- `stage` - Estágio do negócio
- `value` - Valor do negócio
- `account.name` - Nome da conta
- `owner.name` - Nome do proprietário

### Users
- `role` - Cargo do usuário
- `manager.name` - Nome do gerente

### Items
- `type` - Tipo do item
- `price` - Preço do item
- `name` - Nome do item

### Account Timeline
- `type` - Tipo do evento
- `date` - Data do evento
- `account.name` - Nome da conta
- `createdBy.name` - Nome do criador