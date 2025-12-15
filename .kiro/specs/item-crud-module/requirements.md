# Requirements Document

## Introduction

Este documento especifica os requisitos para o módulo de itens (items) do sistema CRM X desenvolvido em Node.js com TypeScript, Express.js, Supabase como base de dados PostgreSQL e API REST para operações CRUD com autenticação JWT. A entidade Item representa produtos ou serviços que podem ser utilizados em negócios e propostas comerciais.

## Glossary

- **CRM_X_System**: Sistema de gestão de relacionamento com clientes "CRM X"
- **Item**: Entidade que representa um produto ou serviço com informações como nome, tipo, preço e código SKU
- **Supabase_Database**: Base de dados PostgreSQL gerenciada pelo Supabase com tabelas users, account, business e item
- **REST_API**: Interface de programação de aplicações que segue os princípios REST com autenticação Bearer Token
- **CRUD_Operations**: Operações de Create (criar), Read (ler), Update (atualizar) e Delete (eliminar)
- **Bearer_Token**: Token usado para autenticação nas requisições API
- **Zod_Schema**: Esquema de validação de dados usando a biblioteca Zod
- **Item_Type**: Enum que define se o item é um produto (PRODUCT) ou serviço (SERVICE)
- **SKU_Code**: Código único de identificação do produto/serviço (Stock Keeping Unit)

## Requirements

### Requirement 1

**User Story:** Como utilizador do CRM X, quero criar novos itens no sistema, para que possa registar produtos e serviços disponíveis para uso em negócios e propostas comerciais.

#### Acceptance Criteria

1. WHEN a user submits valid item data via POST /api/items, THE CRM_X_System SHALL validate data using Zod_Schema and create new item in Supabase_Database
2. WHEN item creation is successful, THE CRM_X_System SHALL return the created item with UUID, timestamps and all provided fields
3. WHEN required fields (name, type, price) are missing, THE CRM_X_System SHALL reject request and return Zod validation error messages
4. WHEN type field contains invalid enum value, THE CRM_X_System SHALL reject request and return enum validation error
5. WHEN item is created, THE CRM_X_System SHALL accept optional fields (skuCode, description) and store them if provided

### Requirement 2

**User Story:** Como utilizador do CRM X, quero consultar itens do sistema, para que possa visualizar produtos e serviços disponíveis com filtros e paginação.

#### Acceptance Criteria

1. WHEN a user requests GET /api/items, THE CRM_X_System SHALL return all items from Supabase_Database
2. WHEN search query parameters are provided, THE CRM_X_System SHALL filter results by name or description matching the search term
3. WHEN type filter is provided, THE CRM_X_System SHALL return only items matching the specified item type (PRODUCT or SERVICE)
4. WHEN price range filters are provided, THE CRM_X_System SHALL return only items within the specified price range
5. WHEN pagination parameters (page, size) are provided, THE CRM_X_System SHALL return paginated results with metadata

### Requirement 3

**User Story:** Como utilizador do CRM X, quero obter um item específico por ID, para que possa visualizar detalhes completos de um produto ou serviço específico.

#### Acceptance Criteria

1. WHEN a user requests GET /api/items/:id, THE CRM_X_System SHALL return the specific item if it exists
2. WHEN requested item does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN ID parameter is invalid UUID format, THE CRM_X_System SHALL return 400 validation error response
4. WHEN retrieval is successful, THE CRM_X_System SHALL return the complete item data in API format (camelCase)
5. WHEN item data is returned, THE CRM_X_System SHALL include all fields including optional ones if they exist

### Requirement 4

**User Story:** Como utilizador do CRM X, quero atualizar informações de itens existentes, para que possa manter os dados de produtos e serviços atualizados.

#### Acceptance Criteria

1. WHEN a user submits valid update data via PUT /api/items/:id, THE CRM_X_System SHALL validate data using Zod_Schema and update specified fields in Supabase_Database
2. WHEN type is updated, THE CRM_X_System SHALL validate enum value (PRODUCT, SERVICE) and update the field
3. WHEN item to update does not exist, THE CRM_X_System SHALL return 404 error response
4. WHEN update validation fails, THE CRM_X_System SHALL reject request and return Zod validation error messages
5. WHEN update is successful, THE CRM_X_System SHALL return the updated item data with all current field values

### Requirement 5

**User Story:** Como utilizador do CRM X, quero eliminar itens do sistema, para que possa remover produtos ou serviços desnecessários ou incorretos.

#### Acceptance Criteria

1. WHEN a user requests item deletion via DELETE /api/items/:id, THE CRM_X_System SHALL remove the specified item from Supabase_Database
2. WHEN item to delete does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN deletion is successful, THE CRM_X_System SHALL return confirmation response with success message
4. WHEN item has related business records, THE CRM_X_System SHALL handle cascading operations according to foreign key constraints
5. WHEN deletion fails due to database constraints, THE CRM_X_System SHALL return appropriate error response with constraint details

### Requirement 6

**User Story:** Como desenvolvedor do sistema, quero que o esquema da base de dados para itens seja bem estruturado, para que a integridade dos dados seja garantida.

#### Acceptance Criteria

1. WHEN database schema is created, THE CRM_X_System SHALL define item table with proper field types and constraints
2. WHEN required fields are defined, THE CRM_X_System SHALL enforce NOT NULL constraints for name, type and price
3. WHEN optional fields are defined, THE CRM_X_System SHALL allow NULL values for skuCode and description
4. WHEN type field is defined, THE CRM_X_System SHALL validate enum values (PRODUCT, SERVICE) at application level
5. WHEN price field is defined, THE CRM_X_System SHALL use NUMERIC type to handle decimal values accurately

### Requirement 7

**User Story:** Como desenvolvedor do sistema, quero que todas as operações de dados de itens sejam validadas usando Zod schemas, para que a integridade e consistência dos dados seja mantida.

#### Acceptance Criteria

1. WHEN CreateItemSchema is defined, THE CRM_X_System SHALL validate required fields (name, type, price) and optional fields (skuCode, description)
2. WHEN UpdateItemSchema is defined, THE CRM_X_System SHALL validate partial updates with proper type checking for all fields
3. WHEN enum values are validated, THE CRM_X_System SHALL ensure only valid type values (PRODUCT, SERVICE) are accepted
4. WHEN validation fails, THE CRM_X_System SHALL return detailed Zod error messages with field-specific information
5. WHEN validation passes, THE CRM_X_System SHALL proceed with database operations using validated data

### Requirement 8

**User Story:** Como desenvolvedor do sistema, quero que o módulo de itens siga os mesmos padrões de código existentes, para que a manutenibilidade e consistência sejam mantidas.

#### Acceptance Criteria

1. WHEN item controller is created, THE CRM_X_System SHALL follow the same structure and patterns as accountController.ts
2. WHEN item schemas are created, THE CRM_X_System SHALL use the same Zod validation patterns as accountSchemas.ts
3. WHEN item types are defined, THE CRM_X_System SHALL follow the same naming conventions and conversion functions as existing types
4. WHEN item routes are created, THE CRM_X_System SHALL use the same authentication middleware and error handling patterns
5. WHEN common functionality is identified, THE CRM_X_System SHALL extract it to shared utility functions to avoid code duplication

### Requirement 9

**User Story:** Como utilizador do sistema, quero que todas as mensagens de erro e sucesso para itens sejam traduzidas, para que possa usar o sistema no meu idioma preferido.

#### Acceptance Criteria

1. WHEN validation errors occur for items, THE CRM_X_System SHALL return translated error messages based on request locale
2. WHEN item operations are successful, THE CRM_X_System SHALL return translated success messages
3. WHEN field names are referenced in errors, THE CRM_X_System SHALL use translated field names for item fields
4. WHEN item is not found, THE CRM_X_System SHALL return translated "Item not found" message
5. WHEN item is deleted successfully, THE CRM_X_System SHALL return translated "Item deleted successfully" message

### Requirement 10

**User Story:** Como utilizador do CRM X, quero que todas as requisições de itens sejam autenticadas via Bearer Token, para que apenas utilizadores autorizados possam aceder aos dados de produtos e serviços.

#### Acceptance Criteria

1. WHEN any item API request is received, THE CRM_X_System SHALL validate Bearer_Token using existing authentication middleware
2. WHEN token is valid, THE CRM_X_System SHALL proceed with item operation
3. WHEN token is invalid or missing, THE CRM_X_System SHALL return 401 unauthorized error response
4. WHEN token validation fails, THE CRM_X_System SHALL use existing token cache mechanism for optimization
5. WHEN authentication succeeds, THE CRM_X_System SHALL log the operation using existing logging patterns