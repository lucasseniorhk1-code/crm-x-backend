# Requirements Document

## Introduction

Este documento especifica os requisitos para implementar os módulos CRUD de profiles e deals do sistema CRM X, seguindo os mesmos padrões já estabelecidos no módulo de accounts. O sistema deve manter consistência na arquitetura, validação, tratamento de erros e estrutura de código.

## Glossary

- **CRM_X_System**: Sistema de gestão de relacionamento com clientes "CRM X"
- **Profile**: Entidade que representa um usuário do sistema com hierarquia organizacional
- **Deal**: Entidade que representa uma oportunidade de negócio vinculada a uma conta
- **Supabase_Database**: Base de dados PostgreSQL gerenciada pelo Supabase
- **REST_API**: Interface de programação de aplicações que segue os princípios REST
- **CRUD_Operations**: Operações de Create, Read, Update e Delete
- **Zod_Schema**: Esquema de validação de dados usando a biblioteca Zod
- **Bearer_Token**: Token usado para autenticação nas requisições API
- **Hierarchy_Management**: Sistema de gestão hierárquica entre profiles (manager_id)
- **Foreign_Key_Constraints**: Restrições de integridade referencial entre tabelas

## Requirements

### Requirement 1

**User Story:** Como utilizador do CRM X, quero criar novos profiles no sistema, para que possa registar informações de usuários com suas respectivas funções e hierarquia organizacional.

#### Acceptance Criteria

1. WHEN a user submits valid profile data via POST /api/profiles, THE CRM_X_System SHALL validate data using Zod_Schema and create new profile in Supabase_Database
2. WHEN profile creation is successful, THE CRM_X_System SHALL return the created profile with UUID, timestamps and all provided fields
3. WHEN required fields (name, email) are missing, THE CRM_X_System SHALL reject request and return Zod validation error messages
4. WHEN manager_id references invalid profile, THE CRM_X_System SHALL reject request and return foreign key validation error
5. WHEN profile is created, THE CRM_X_System SHALL set default value for role (SALES_REP) if not provided

### Requirement 2

**User Story:** Como utilizador do CRM X, quero consultar profiles do sistema, para que possa visualizar informações dos usuários com filtros e paginação.

#### Acceptance Criteria

1. WHEN a user requests GET /api/profiles, THE CRM_X_System SHALL return all profiles from Supabase_Database
2. WHEN search query parameters are provided, THE CRM_X_System SHALL filter results by name or email matching the search term
3. WHEN role filter is provided, THE CRM_X_System SHALL return only profiles matching the specified role
4. WHEN manager_id filter is provided, THE CRM_X_System SHALL return only profiles with the specified manager
5. WHEN pagination parameters (page, size) are provided, THE CRM_X_System SHALL return paginated results with metadata

### Requirement 3

**User Story:** Como utilizador do CRM X, quero atualizar informações de profiles existentes, para que possa manter os dados atualizados e gerir a hierarquia organizacional.

#### Acceptance Criteria

1. WHEN a user submits valid update data via PUT /api/profiles/:id, THE CRM_X_System SHALL validate data using Zod_Schema and update specified fields in Supabase_Database
2. WHEN role is updated, THE CRM_X_System SHALL validate enum value (ADMIN, MANAGER, SALES_REP) and update the field
3. WHEN profile to update does not exist, THE CRM_X_System SHALL return 404 error response
4. WHEN update validation fails, THE CRM_X_System SHALL reject request and return Zod validation error messages
5. WHEN update is successful, THE CRM_X_System SHALL return the updated profile data

### Requirement 4

**User Story:** Como utilizador do CRM X, quero eliminar profiles do sistema, para que possa remover registos desnecessários ou incorretos.

#### Acceptance Criteria

1. WHEN a user requests profile deletion via DELETE /api/profiles/:id, THE CRM_X_System SHALL remove the specified profile from Supabase_Database
2. WHEN profile to delete does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN deletion is successful, THE CRM_X_System SHALL return confirmation response
4. WHEN profile has related accounts or deals as owner, THE CRM_X_System SHALL handle cascading operations according to foreign key constraints
5. WHEN deletion fails due to database constraints, THE CRM_X_System SHALL return appropriate error response with constraint details

### Requirement 5

**User Story:** Como utilizador do CRM X, quero criar novos deals no sistema, para que possa registar oportunidades de negócio vinculadas às contas.

#### Acceptance Criteria

1. WHEN a user submits valid deal data via POST /api/deals, THE CRM_X_System SHALL validate data using Zod_Schema and create new deal in Supabase_Database
2. WHEN deal creation is successful, THE CRM_X_System SHALL return the created deal with UUID, timestamps and all provided fields
3. WHEN required fields (title, account_id, value, stage) are missing, THE CRM_X_System SHALL reject request and return Zod validation error messages
4. WHEN account_id or owner_id references invalid entities, THE CRM_X_System SHALL reject request and return foreign key validation error
5. WHEN deal is created, THE CRM_X_System SHALL set default value for currency (BRL) if not provided

### Requirement 6

**User Story:** Como utilizador do CRM X, quero consultar deals do sistema, para que possa visualizar oportunidades de negócio com filtros e paginação.

#### Acceptance Criteria

1. WHEN a user requests GET /api/deals, THE CRM_X_System SHALL return all deals from Supabase_Database
2. WHEN search query parameters are provided, THE CRM_X_System SHALL filter results by title matching the search term
3. WHEN stage filter is provided, THE CRM_X_System SHALL return only deals matching the specified stage
4. WHEN account_id filter is provided, THE CRM_X_System SHALL return only deals for the specified account
5. WHEN pagination parameters (page, size) are provided, THE CRM_X_System SHALL return paginated results with metadata

### Requirement 7

**User Story:** Como utilizador do CRM X, quero atualizar informações de deals existentes, para que possa manter os dados atualizados e gerir o pipeline de vendas.

#### Acceptance Criteria

1. WHEN a user submits valid update data via PUT /api/deals/:id, THE CRM_X_System SHALL validate data using Zod_Schema and update specified fields in Supabase_Database
2. WHEN stage is updated, THE CRM_X_System SHALL validate enum value (Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost) and update the field
3. WHEN deal to update does not exist, THE CRM_X_System SHALL return 404 error response
4. WHEN update validation fails, THE CRM_X_System SHALL reject request and return Zod validation error messages
5. WHEN update is successful, THE CRM_X_System SHALL return the updated deal data

### Requirement 8

**User Story:** Como utilizador do CRM X, quero eliminar deals do sistema, para que possa remover oportunidades desnecessárias ou incorretas.

#### Acceptance Criteria

1. WHEN a user requests deal deletion via DELETE /api/deals/:id, THE CRM_X_System SHALL remove the specified deal from Supabase_Database
2. WHEN deal to delete does not exist, THE CRM_X_System SHALL return 404 error response
3. WHEN deletion is successful, THE CRM_X_System SHALL return confirmation response
4. WHEN deletion fails due to database constraints, THE CRM_X_System SHALL return appropriate error response with constraint details

### Requirement 9

**User Story:** Como desenvolvedor do sistema, quero que os novos módulos sigam os mesmos padrões de código existentes, para que a manutenibilidade e consistência sejam mantidas.

#### Acceptance Criteria

1. WHEN new controllers are created, THE CRM_X_System SHALL follow the same structure and patterns as accountController.ts
2. WHEN new schemas are created, THE CRM_X_System SHALL use the same Zod validation patterns as accountSchemas.ts
3. WHEN new types are defined, THE CRM_X_System SHALL follow the same naming conventions and conversion functions as existing types
4. WHEN new routes are created, THE CRM_X_System SHALL use the same authentication middleware and error handling patterns
5. WHEN common functionality is identified, THE CRM_X_System SHALL extract it to shared utility functions to avoid code duplication

### Requirement 10

**User Story:** Como utilizador do CRM X, quero obter um profile ou deal específico por ID, para que possa visualizar detalhes completos de uma entidade específica.

#### Acceptance Criteria

1. WHEN a user requests GET /api/profiles/:id, THE CRM_X_System SHALL return the specific profile if it exists
2. WHEN a user requests GET /api/deals/:id, THE CRM_X_System SHALL return the specific deal if it exists
3. WHEN requested profile or deal does not exist, THE CRM_X_System SHALL return 404 error response
4. WHEN ID parameter is invalid UUID format, THE CRM_X_System SHALL return 400 validation error response
5. WHEN retrieval is successful, THE CRM_X_System SHALL return the complete entity data in API format (camelCase)