# Design Document - Account Timeline CRUD Module

## Overview

O módulo de Account Timeline do sistema CRM X implementa operações CRUD completas para gestão do histórico de interações e alterações de contas. O design segue os mesmos padrões arquiteturais estabelecidos nos módulos existentes (accounts, items, business), garantindo consistência e manutenibilidade do código.

A entidade AccountTimeline é fundamental para rastrear o histórico completo de uma conta, permitindo que os utilizadores documentem notas, chamadas, emails, reuniões e alterações do sistema. Cada registro de timeline está associado a uma conta específica e ao utilizador que o criou, proporcionando um audit trail completo das interações.

## Architecture

O módulo segue a arquitetura em camadas já estabelecida no projeto:

```
┌─────────────────┐
│   REST API      │ ← Express.js routes com autenticação JWT
├─────────────────┤
│   Controller    │ ← Lógica de negócio e validação
├─────────────────┤
│   Schemas       │ ← Validação Zod e transformação de dados
├─────────────────┤
│   Types         │ ← Interfaces TypeScript e conversões
├─────────────────┤
│   Database      │ ← Supabase PostgreSQL
└─────────────────┘
```

### Key Components:
- **accountTimelineController.ts**: Implementa todas as operações CRUD
- **accountTimelineSchemas.ts**: Define validações Zod para entrada de dados
- **types/index.ts**: Interfaces e funções de conversão para AccountTimeline
- **Database Table**: `account_timeline` com relacionamentos para account e users

## Components and Interfaces

### REST API Endpoints

```typescript
POST   /api/account-timeline              // Criar novo registro de timeline
GET    /api/account-timeline              // Listar registros com filtros e paginação
GET    /api/account-timeline/:id          // Obter registro específico por ID
PUT    /api/account-timeline/:id          // Atualizar registro existente
DELETE /api/account-timeline/:id          // Eliminar registro
GET    /api/accounts/:accountId/timeline  // Obter timeline de uma conta específica
```

### Controller Functions

```typescript
// accountTimelineController.ts
export async function createAccountTimeline(req: Request, res: Response): Promise<void>
export async function getAccountTimelines(req: Request, res: Response): Promise<void>
export async function getAccountTimelineById(req: Request, res: Response): Promise<void>
export async function updateAccountTimeline(req: Request, res: Response): Promise<void>
export async function deleteAccountTimeline(req: Request, res: Response): Promise<void>
export async function getAccountTimelineByAccountId(req: Request, res: Response): Promise<void>
```

### Validation Schemas

```typescript
// accountTimelineSchemas.ts
export const CreateAccountTimelineSchema: z.ZodSchema
export const UpdateAccountTimelineSchema: z.ZodSchema
export const AccountTimelineQueryParamsSchema: z.ZodSchema
export const AccountTimelineIdParamSchema: z.ZodSchema
export const TimelineTypeSchema: z.ZodSchema
```

## Data Models

### Database Schema (snake_case)

```sql
CREATE TABLE account_timeline (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id  UUID NOT NULL REFERENCES account (id) ON DELETE CASCADE,
    type        TEXT NOT NULL,  -- NOTE, CALL, EMAIL, MEETING, SYSTEM
    title       TEXT NOT NULL,
    description TEXT,           -- Optional
    date        TIMESTAMPTZ NOT NULL,
    created_by  UUID NOT NULL REFERENCES users (id),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_account_timeline_account_id ON account_timeline (account_id);
CREATE INDEX idx_account_timeline_type ON account_timeline (type);
CREATE INDEX idx_account_timeline_date ON account_timeline (date);
CREATE INDEX idx_account_timeline_created_by ON account_timeline (created_by);
```

### TypeScript Interfaces

```typescript
// Database representation (snake_case)
export interface AccountTimelineDB {
  id: string;
  account_id: string;
  type: string;
  title: string;
  description?: string | null;
  date: string;
  created_by: string;
  created_at: string;
}

// API representation (camelCase)
export interface AccountTimeline {
  id: string;
  accountId: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

// Request types
export interface CreateAccountTimelineRequest {
  accountId: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  createdBy: string;
}

export interface UpdateAccountTimelineRequest {
  accountId?: string;
  type?: string;
  title?: string;
  description?: string | null;
  date?: string;
  createdBy?: string;
}
```

### Enums and Constants

```typescript
export const TimelineTypes = {
  NOTE: 'NOTE',
  CALL: 'CALL',
  EMAIL: 'EMAIL',
  MEETING: 'MEETING',
  SYSTEM: 'SYSTEM'
} as const;

export type TimelineType = typeof TimelineTypes[keyof typeof TimelineTypes];

export const isValidTimelineType = (value: string): value is TimelineType => {
  return Object.values(TimelineTypes).includes(value as TimelineType);
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*
### Property Reflection

After analyzing all acceptance criteria, the following properties have been identified as unique and non-redundant:

**Property 1: Timeline creation with valid data**
*For any* valid timeline data (accountId, type, title, date, createdBy with optional description), creating a timeline record should result in a new record being stored in the database with all provided fields, generated UUID and timestamps
**Validates: Requirements 1.1, 1.2**

**Property 2: Required field validation**
*For any* timeline creation request missing required fields (accountId, type, title, date, createdBy), the system should reject the request and return appropriate validation error messages
**Validates: Requirements 1.3**

**Property 3: Foreign key validation for accounts**
*For any* timeline creation request with invalid accountId, the system should reject the request and return foreign key validation error
**Validates: Requirements 1.4**

**Property 4: Foreign key validation for users**
*For any* timeline creation request with invalid createdBy user ID, the system should reject the request and return foreign key validation error
**Validates: Requirements 1.5**

**Property 5: Timeline retrieval functionality**
*For any* request to get all timeline records, the system should return all timeline records from the database
**Validates: Requirements 2.1**

**Property 6: Account filtering**
*For any* accountId filter parameter, the system should return only timeline records belonging to the specified account
**Validates: Requirements 2.2**

**Property 7: Type filtering**
*For any* type filter parameter, the system should return only timeline records matching the specified timeline type
**Validates: Requirements 2.3**

**Property 8: Date range filtering**
*For any* valid date range filters, the system should return only timeline records within the specified date range
**Validates: Requirements 2.4**

**Property 9: Pagination functionality**
*For any* valid pagination parameters (page and size), the system should return the correct subset of timeline records with accurate pagination metadata
**Validates: Requirements 2.5**

**Property 10: Timeline retrieval by ID**
*For any* existing timeline record ID, retrieving the record should return the complete timeline data in camelCase API format
**Validates: Requirements 3.1, 3.4, 3.5**

**Property 11: Timeline update functionality**
*For any* valid update data and existing timeline ID, updating the record should modify only the specified fields and return the updated timeline data
**Validates: Requirements 4.1, 4.5**

**Property 12: Enum validation for updates**
*For any* timeline update request with invalid type enum value, the system should reject the request and return enum validation error
**Validates: Requirements 4.2**

**Property 13: Update validation**
*For any* invalid update data, the system should reject the request and return detailed validation error messages
**Validates: Requirements 4.4**

**Property 14: Timeline deletion**
*For any* existing timeline ID, deleting the record should remove it from the database and return a success confirmation message
**Validates: Requirements 5.1, 5.3**

**Property 15: Translation support for validation errors**
*For any* validation error and request locale, the system should return error messages translated to the appropriate language
**Validates: Requirements 9.1**

**Property 16: Translation support for success messages**
*For any* successful operation and request locale, the system should return success messages translated to the appropriate language
**Validates: Requirements 9.2**

**Property 17: Authentication validation**
*For any* timeline API request without valid Bearer token, the system should return 401 unauthorized error response
**Validates: Requirements 10.1, 10.3**

**Property 18: Account timeline retrieval**
*For any* existing account ID, retrieving account timeline should return all timeline records for that account ordered by date descending
**Validates: Requirements 11.1, 11.3**

**Property 19: Account timeline type filtering**
*For any* account timeline request with type filter, the system should return only timeline records of the specified type for that account
**Validates: Requirements 11.4**

**Property 20: Account timeline pagination**
*For any* account timeline request with pagination parameters, the system should return paginated timeline results for that account
**Validates: Requirements 11.5**

**Property 21: Creator information storage**
*For any* timeline record creation, the system should store and return the createdBy field with the user ID who created the record
**Validates: Requirements 12.1, 12.3**

## Error Handling

O módulo implementa tratamento de erros consistente com os padrões existentes:

### Validation Errors (400)
- Campos obrigatórios em falta
- Tipos de dados inválidos
- Valores enum inválidos para type
- Formato UUID inválido
- Formato de data inválido

### Not Found Errors (404)
- Timeline record não encontrado por ID
- Account não encontrado para timeline
- Tentativa de atualizar timeline inexistente
- Tentativa de eliminar timeline inexistente

### Foreign Key Errors (400)
- AccountId inválido (conta não existe)
- CreatedBy inválido (utilizador não existe)

### Database Errors (500)
- Erros de conexão com base de dados
- Violações de constraints
- Erros internos do servidor

### Authentication Errors (401)
- Token em falta ou inválido
- Token expirado

## Testing Strategy

### Dual Testing Approach

O módulo implementa uma estratégia de testes dupla combinando testes unitários e testes baseados em propriedades:

#### Unit Testing
- Testes específicos para casos de uso comuns
- Validação de casos extremos (edge cases)
- Testes de integração entre componentes
- Verificação de tratamento de erros específicos

#### Property-Based Testing
- Utilização da biblioteca **fast-check** para TypeScript/Node.js
- Cada teste baseado em propriedades deve executar um mínimo de 100 iterações
- Cada teste deve ser marcado com comentário referenciando a propriedade do design:
  - Formato: `**Feature: account-timeline-crud, Property {number}: {property_text}**`
- Implementação de uma propriedade por teste
- Geração automática de dados de teste para validar comportamentos universais

#### Testing Requirements
- Testes unitários verificam exemplos específicos e casos extremos
- Testes de propriedades verificam comportamentos universais
- Ambos os tipos são complementares e obrigatórios
- Cobertura completa de todas as operações CRUD
- Validação de todos os cenários de erro identificados

### Test Data Generation
- Geradores inteligentes para dados de AccountTimeline válidos e inválidos
- Geração de cenários de teste realistas com relacionamentos válidos
- Validação de constraints de base de dados
- Testes de performance com grandes volumes de dados
- Geração de datas válidas e inválidas para testes de range

## Implementation Notes

### Database Integration
- Utilização do cliente Supabase existente
- Reutilização de padrões de query e tratamento de erros
- Implementação de índices para otimização de performance
- Relacionamentos com tabelas account e users

### Authentication Integration
- Reutilização do middleware de autenticação existente
- Integração com sistema de cache de tokens
- Logging consistente com padrões estabelecidos

### Translation Integration
- Extensão do sistema de traduções existente
- Adição de mensagens específicas para AccountTimeline
- Suporte para múltiplos idiomas (pt-BR, en-US, es-CO)
- Tradução de nomes de campos e mensagens de erro

### Code Organization
- Seguimento dos padrões de estrutura de pastas
- Reutilização de utilitários existentes (controllerHelpers, filterParser)
- Manutenção de consistência com outros módulos
- Implementação de funções de conversão entre formatos DB e API

### Relationship Management
- Gestão adequada de relacionamentos com Account e Users
- Validação de foreign keys antes de operações
- Tratamento de cascading deletes conforme constraints da base de dados
- Otimização de queries com joins quando necessário