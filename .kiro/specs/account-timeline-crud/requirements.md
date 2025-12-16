# Requirements Document

## Introduction

Este documento especifica os requisitos para o módulo de timeline de contas (accountTimeline) do sistema CRM X desenvolvido em Node.js com TypeScript, Express.js, Supabase como base de dados PostgreSQL e API REST para operações CRUD com autenticação JWT. A entidade AccountTimeline representa o histórico de interações e alterações de uma conta, permitindo rastrear notas, chamadas, emails, reuniões e alterações do sistema.

## Glossary

- **CRM_X_System**: Sistema de gestão de relacionamento com clientes "CRM X"
- **AccountTimeline**: Entidade que representa um registro de interação ou alteração de uma conta com tipo, título, descrição e data
- **Supabase_Database**: Base de dados PostgreSQL gerenciada pelo Supabase com tabelas users, account, business, item e account_timeline
- **REST_API**: Interface de programação de aplicações que segue os princípios REST com autenticação Bearer Token
- **CRUD_Operations**: Operações de Create (criar), Read (ler), Update (atualizar) e Delete (eliminar)
- **Bearer_Token**: Token usado para autenticação nas requisições API
- **Zod_Schema**: Esquema de validação de dados usando a biblioteca Zod
- **Timeline_Type**: Enum que define o tipo de registro (NOTE, CALL, EMAIL, MEETING, SYSTEM)
- **Account_Reference**: Referência obrigatória para a conta à qual o registro de timeline pertence
- **User_Reference**: Referência obrigatória para o utilizador que criou o registro

## Requirements

### Requirement 1

**User Story:** Como utilizador do CRM X, quero criar novos registros de timeline para contas, para que possa documentar interações, notas e alterações relacionadas com cada conta cliente.

#### Acceptance Criteria

1. WHEN a user submits valid timeline data via POST /api/account-timeline, THE CRM_X_System SHALL validate data using Zod_Schema and create new timeline record in Supabase_Database
2. WHEN timeline creation is successful, THE CRM_X_System SHALL return the created timeline record with UUID, timestamps and all provided fields
3. WHEN required fields (accountId, type, title, date, createdBy) are missing, THE CRM_X_System SHALL reject request and return Zod validation error messages
4. WHEN accountId references invalid account, THE CRM_X_System SHALL reject request and return foreign key validation error
5. WHEN createdBy references invalid user, THE CRM_X_System SHALL reject request and return foreign key validation error

### Requirement 2

**User Story:** Como utilizador do CRM X, quero consultar registros de timeline de contas, para que possa visualizar o histórico de interações e alterações com filtros e paginação.

#### Acceptance Criteria

1. WHEN a user requests GET /api/account-timeline, THE CRM_X_System SHALL return all timeline records from Supabase_Database
2. WHEN accountId filter is provided, THE CRM_X_System SHALL return only timeline records for the specified account
3. WHEN type filter is provided, THE CRM_X_System SHALL return only timeline records matching the specified Timeline_Type
4. WHEN date range filters are provided, THE CRM_X_System SHALL return only timeline records within the specified date range
5. WHEN pagination parameters (page, size) are provided, THE CRM_X_System SHALL return paginated results with metadata

### Requirement 3

**User Story:** Como utilizador do CRM X, quero obter um registro de timeline específico por ID, para que possa visualizar detalhes completos de uma interação ou alteração específica.

#### Acceptance Criteria

1. WHEN a user requests GET /api/account-timeline/:id, THE CRM_X_System SHALL return the specific timeline record if it exists
2. WHEN requested timeline record does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN ID parameter is invalid UUID format, THE CRM_X_System SHALL return 400 validation error response
4. WHEN retrieval is successful, THE CRM_X_System SHALL return the complete timeline data in API format (camelCase)
5. WHEN timeline data is returned, THE CRM_X_System SHALL include all fields including optional description if it exists

### Requirement 4

**User Story:** Como utilizador do CRM X, quero atualizar informações de registros de timeline existentes, para que possa corrigir ou complementar informações de interações documentadas.

#### Acceptance Criteria

1. WHEN a user submits valid update data via PUT /api/account-timeline/:id, THE CRM_X_System SHALL validate data using Zod_Schema and update specified fields in Supabase_Database
2. WHEN type is updated, THE CRM_X_System SHALL validate enum value (NOTE, CALL, EMAIL, MEETING, SYSTEM) and update the field
3. WHEN timeline record to update does not exist, THE CRM_X_System SHALL return 404 error response
4. WHEN update validation fails, THE CRM_X_System SHALL reject request and return Zod validation error messages
5. WHEN update is successful, THE CRM_X_System SHALL return the updated timeline record data with all current field values

### Requirement 5

**User Story:** Como utilizador do CRM X, quero eliminar registros de timeline do sistema, para que possa remover registros incorretos ou desnecessários do histórico de contas.

#### Acceptance Criteria

1. WHEN a user requests timeline deletion via DELETE /api/account-timeline/:id, THE CRM_X_System SHALL remove the specified timeline record from Supabase_Database
2. WHEN timeline record to delete does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN deletion is successful, THE CRM_X_System SHALL return confirmation response with success message
4. WHEN timeline record is deleted, THE CRM_X_System SHALL maintain referential integrity with related account
5. WHEN deletion fails due to database constraints, THE CRM_X_System SHALL return appropriate error response with constraint details

### Requirement 6

**User Story:** Como desenvolvedor do sistema, quero que o esquema da base de dados para timeline de contas seja bem estruturado, para que a integridade dos dados e relacionamentos seja garantida.

#### Acceptance Criteria

1. WHEN database schema is created, THE CRM_X_System SHALL define account_timeline table with proper field types and constraints
2. WHEN required fields are defined, THE CRM_X_System SHALL enforce NOT NULL constraints for id, account_id, type, title, date and created_by
3. WHEN optional fields are defined, THE CRM_X_System SHALL allow NULL values for description
4. WHEN foreign key relationships are defined, THE CRM_X_System SHALL ensure referential integrity between account_timeline, account and users tables
5. WHEN type field is defined, THE CRM_X_System SHALL validate enum values (NOTE, CALL, EMAIL, MEETING, SYSTEM) at application level

### Requirement 7

**User Story:** Como desenvolvedor do sistema, quero que todas as operações de dados de timeline sejam validadas usando Zod schemas, para que a integridade e consistência dos dados seja mantida.

#### Acceptance Criteria

1. WHEN CreateAccountTimelineSchema is defined, THE CRM_X_System SHALL validate required fields (accountId, type, title, date, createdBy) and optional field (description)
2. WHEN UpdateAccountTimelineSchema is defined, THE CRM_X_System SHALL validate partial updates with proper type checking for all fields
3. WHEN enum values are validated, THE CRM_X_System SHALL ensure only valid type values (NOTE, CALL, EMAIL, MEETING, SYSTEM) are accepted
4. WHEN validation fails, THE CRM_X_System SHALL return detailed Zod error messages with field-specific information
5. WHEN validation passes, THE CRM_X_System SHALL proceed with database operations using validated data

### Requirement 8

**User Story:** Como desenvolvedor do sistema, quero que o módulo de timeline siga os mesmos padrões de código existentes, para que a manutenibilidade e consistência sejam mantidas.

#### Acceptance Criteria

1. WHEN timeline controller is created, THE CRM_X_System SHALL follow the same structure and patterns as accountController.ts
2. WHEN timeline schemas are created, THE CRM_X_System SHALL use the same Zod validation patterns as accountSchemas.ts
3. WHEN timeline types are defined, THE CRM_X_System SHALL follow the same naming conventions and conversion functions as existing types
4. WHEN timeline routes are created, THE CRM_X_System SHALL use the same authentication middleware and error handling patterns
5. WHEN common functionality is identified, THE CRM_X_System SHALL extract it to shared utility functions to avoid code duplication

### Requirement 9

**User Story:** Como utilizador do sistema, quero que todas as mensagens de erro e sucesso para timeline sejam traduzidas, para que possa usar o sistema no meu idioma preferido.

#### Acceptance Criteria

1. WHEN validation errors occur for timeline, THE CRM_X_System SHALL return translated error messages based on request locale
2. WHEN timeline operations are successful, THE CRM_X_System SHALL return translated success messages
3. WHEN field names are referenced in errors, THE CRM_X_System SHALL use translated field names for timeline fields
4. WHEN timeline record is not found, THE CRM_X_System SHALL return translated "Timeline record not found" message
5. WHEN timeline record is deleted successfully, THE CRM_X_System SHALL return translated "Timeline record deleted successfully" message

### Requirement 10

**User Story:** Como utilizador do CRM X, quero que todas as requisições de timeline sejam autenticadas via Bearer Token, para que apenas utilizadores autorizados possam aceder aos dados de histórico de contas.

#### Acceptance Criteria

1. WHEN any timeline API request is received, THE CRM_X_System SHALL validate Bearer_Token using existing authentication middleware
2. WHEN token is valid, THE CRM_X_System SHALL proceed with timeline operation
3. WHEN token is invalid or missing, THE CRM_X_System SHALL return 401 unauthorized error response
4. WHEN token validation fails, THE CRM_X_System SHALL use existing token cache mechanism for optimization
5. WHEN authentication succeeds, THE CRM_X_System SHALL log the operation using existing logging patterns

### Requirement 11

**User Story:** Como utilizador do CRM X, quero consultar timeline de uma conta específica, para que possa visualizar todo o histórico de interações de uma conta de forma organizada.

#### Acceptance Criteria

1. WHEN a user requests GET /api/accounts/:accountId/timeline, THE CRM_X_System SHALL return all timeline records for the specified account
2. WHEN account does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN timeline records are returned, THE CRM_X_System SHALL order them by date descending (most recent first)
4. WHEN type filter is provided in account timeline query, THE CRM_X_System SHALL return only timeline records of specified type for that account
5. WHEN pagination is provided in account timeline query, THE CRM_X_System SHALL return paginated timeline results for that account

### Requirement 12

**User Story:** Como desenvolvedor do sistema, quero que os registros de timeline incluam informações do utilizador criador, para que seja possível rastrear quem fez cada interação ou alteração.

#### Acceptance Criteria

1. WHEN timeline record is created, THE CRM_X_System SHALL store the createdBy field with the user ID who created the record
2. WHEN timeline records are retrieved, THE CRM_X_System SHALL include user information (name) from the createdBy relationship
3. WHEN timeline record is returned via API, THE CRM_X_System SHALL include createdBy field with user ID
4. WHEN user who created timeline is deleted, THE CRM_X_System SHALL handle the relationship according to database constraints
5. WHEN timeline query includes user information, THE CRM_X_System SHALL join with users table to provide creator details