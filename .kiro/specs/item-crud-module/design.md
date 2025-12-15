# Design Document - Item CRUD Module

## Overview

O módulo de Item do sistema CRM X implementa operações CRUD completas para gestão de produtos e serviços. O design segue os mesmos padrões arquiteturais estabelecidos nos módulos existentes (accounts, profiles, deals), garantindo consistência e manutenibilidade do código.

A entidade Item é fundamental para o sistema CRM, permitindo que os usuários registem e gestionem produtos e serviços que podem ser utilizados em negócios e propostas comerciais. O módulo suporta dois tipos de itens: PRODUCT (produtos físicos) e SERVICE (serviços), cada um com informações específicas como preço, código SKU opcional e descrição.

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
- **itemController.ts**: Implementa todas as operações CRUD
- **itemSchemas.ts**: Define validações Zod para entrada de dados
- **types/index.ts**: Interfaces e funções de conversão para Item
- **Database Table**: `item` com campos obrigatórios e opcionais

## Components and Interfaces

### REST API Endpoints

```typescript
POST   /api/items           // Criar novo item
GET    /api/items           // Listar itens com filtros e paginação
GET    /api/items/:id       // Obter item específico por ID
PUT    /api/items/:id       // Atualizar item existente
DELETE /api/items/:id       // Eliminar item
```

### Controller Functions

```typescript
// itemController.ts
export async function createItem(req: Request, res: Response): Promise<void>
export async function getItems(req: Request, res: Response): Promise<void>
export async function getItemById(req: Request, res: Response): Promise<void>
export async function updateItem(req: Request, res: Response): Promise<void>
export async function deleteItem(req: Request, res: Response): Promise<void>
```

### Validation Schemas

```typescript
// itemSchemas.ts
export const CreateItemSchema: z.ZodSchema
export const UpdateItemSchema: z.ZodSchema
export const ItemQueryParamsSchema: z.ZodSchema
export const ItemIdParamSchema: z.ZodSchema
export const ItemTypeSchema: z.ZodSchema
```

## Data Models

### Database Schema (snake_case)

```sql
CREATE TABLE item (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,  -- PRODUCT or SERVICE
    price       NUMERIC NOT NULL,
    sku_code    TEXT,           -- Optional
    description TEXT,           -- Optional
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_item_name ON item (name);
CREATE INDEX idx_item_type ON item (type);
CREATE INDEX idx_item_price ON item (price);
CREATE INDEX idx_item_sku_code ON item (sku_code);
```

### TypeScript Interfaces

```typescript
// Database representation (snake_case)
export interface ItemDB {
  id: string;
  name: string;
  type: string;
  price: number;
  sku_code?: string | null;
  description?: string | null;
  created_at: string;
}

// API representation (camelCase)
export interface Item {
  id: string;
  name: string;
  type: string;
  price: number;
  skuCode?: string;
  description?: string;
  createdAt: string;
}

// Request types
export interface CreateItemRequest {
  name: string;
  type: string;
  price: number;
  skuCode?: string;
  description?: string;
}

export interface UpdateItemRequest {
  name?: string;
  type?: string;
  price?: number;
  skuCode?: string | null;
  description?: string | null;
}
```

### Enums and Constants

```typescript
export const ItemTypes = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE'
} as const;

export type ItemType = typeof ItemTypes[keyof typeof ItemTypes];

export const isValidItemType = (value: string): value is ItemType => {
  return Object.values(ItemTypes).includes(value as ItemType);
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, the following properties have been identified as unique and non-redundant:

**Property 1: Item creation with valid data**
*For any* valid item data (name, type, price with optional skuCode and description), creating an item should result in a new item being stored in the database with all provided fields and generated UUID and timestamp
**Validates: Requirements 1.1, 1.2, 1.5**

**Property 2: Required field validation**
*For any* item creation request missing required fields (name, type, or price), the system should reject the request and return appropriate validation error messages
**Validates: Requirements 1.3**

**Property 3: Enum validation for item type**
*For any* item creation or update request with invalid type enum value, the system should reject the request and return enum validation error
**Validates: Requirements 1.4, 4.2**

**Property 4: Search filtering functionality**
*For any* search query parameter, the system should return only items where the name or description contains the search term
**Validates: Requirements 2.2**

**Property 5: Type filtering functionality**
*For any* type filter parameter (PRODUCT or SERVICE), the system should return only items matching that specific type
**Validates: Requirements 2.3**

**Property 6: Price range filtering**
*For any* valid price range filters (min and/or max), the system should return only items within the specified price range
**Validates: Requirements 2.4**

**Property 7: Pagination consistency**
*For any* valid pagination parameters (page and size), the system should return the correct subset of items with accurate pagination metadata
**Validates: Requirements 2.5**

**Property 8: Item retrieval by ID**
*For any* existing item ID, retrieving the item should return the complete item data in camelCase API format
**Validates: Requirements 3.1, 3.4, 3.5**

**Property 9: Item update functionality**
*For any* valid update data and existing item ID, updating the item should modify only the specified fields and return the updated item data
**Validates: Requirements 4.1, 4.5**

**Property 10: Update validation**
*For any* invalid update data, the system should reject the request and return detailed validation error messages
**Validates: Requirements 4.4**

**Property 11: Item deletion**
*For any* existing item ID, deleting the item should remove it from the database and return a success confirmation message
**Validates: Requirements 5.1, 5.3**

**Property 12: Translation support for validation errors**
*For any* validation error and request locale, the system should return error messages translated to the appropriate language
**Validates: Requirements 9.1, 9.3**

**Property 13: Translation support for success messages**
*For any* successful operation and request locale, the system should return success messages translated to the appropriate language
**Validates: Requirements 9.2, 9.5**

## Error Handling

O módulo implementa tratamento de erros consistente com os padrões existentes:

### Validation Errors (400)
- Campos obrigatórios em falta
- Tipos de dados inválidos
- Valores enum inválidos
- Formato UUID inválido

### Not Found Errors (404)
- Item não encontrado por ID
- Tentativa de atualizar item inexistente
- Tentativa de eliminar item inexistente

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
  - Formato: `**Feature: item-crud-module, Property {number}: {property_text}**`
- Implementação de uma propriedade por teste
- Geração automática de dados de teste para validar comportamentos universais

#### Testing Requirements
- Testes unitários verificam exemplos específicos e casos extremos
- Testes de propriedades verificam comportamentos universais
- Ambos os tipos são complementares e obrigatórios
- Cobertura completa de todas as operações CRUD
- Validação de todos os cenários de erro identificados

### Test Data Generation
- Geradores inteligentes para dados de Item válidos e inválidos
- Geração de cenários de teste realistas
- Validação de constraints de base de dados
- Testes de performance com grandes volumes de dados

## Implementation Notes

### Database Integration
- Utilização do cliente Supabase existente
- Reutilização de padrões de query e tratamento de erros
- Implementação de índices para otimização de performance

### Authentication Integration
- Reutilização do middleware de autenticação existente
- Integração com sistema de cache de tokens
- Logging consistente com padrões estabelecidos

### Translation Integration
- Extensão do sistema de traduções existente
- Adição de mensagens específicas para Item
- Suporte para múltiplos idiomas (pt-BR, en-US, es-CO)

### Code Organization
- Seguimento dos padrões de estrutura de pastas
- Reutilização de utilitários existentes
- Manutenção de consistência com outros módulos