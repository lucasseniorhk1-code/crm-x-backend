# Design Document

## Overview

Este documento descreve o design técnico para implementar os módulos CRUD de profiles e deals do CRM X, seguindo os mesmos padrões arquiteturais e de código já estabelecidos no módulo de accounts. O sistema manterá consistência na estrutura de controllers, schemas, tipos e tratamento de erros.

## Architecture

### Technology Stack
- **Runtime**: Node.js com TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Client**: @supabase/supabase-js
- **Validation**: Zod
- **Authentication**: Middleware existente (requireAuth)
- **Error Handling**: Middleware existente (errorHandler)

### System Components
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   Express API    │───▶│   Supabase DB   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ Authentication   │
                       │   Middleware     │
                       └──────────────────┘
```

## Components and Interfaces

### 1. Profile Controller
- **Purpose**: Implementar lógica de negócio para operações CRUD de profiles
- **Location**: `src/controllers/profileController.ts`
- **Interface**:
```typescript
interface ProfileController {
  createProfile(req: Request, res: Response): Promise<void>
  getProfiles(req: Request, res: Response): Promise<void>
  getProfileById(req: Request, res: Response): Promise<void>
  updateProfile(req: Request, res: Response): Promise<void>
  deleteProfile(req: Request, res: Response): Promise<void>
}
```

### 2. Deal Controller
- **Purpose**: Implementar lógica de negócio para operações CRUD de deals
- **Location**: `src/controllers/dealController.ts`
- **Interface**:
```typescript
interface DealController {
  createDeal(req: Request, res: Response): Promise<void>
  getDeals(req: Request, res: Response): Promise<void>
  getDealById(req: Request, res: Response): Promise<void>
  updateDeal(req: Request, res: Response): Promise<void>
  deleteDeal(req: Request, res: Response): Promise<void>
}
```

### 3. Extended Validation Schemas
- **Purpose**: Adicionar esquemas Zod para profiles e deals
- **Location**: `src/schemas/accountSchemas.ts` (extensão do arquivo existente)
- **Interface**:
```typescript
interface ExtendedSchemas {
  // Profile schemas
  CreateProfileSchema: ZodSchema
  UpdateProfileSchema: ZodSchema
  ProfileIdParamSchema: ZodSchema
  
  // Deal schemas
  CreateDealSchema: ZodSchema
  UpdateDealSchema: ZodSchema
  DealIdParamSchema: ZodSchema
  
  // Query schemas
  ProfileQueryParamsSchema: ZodSchema
  DealQueryParamsSchema: ZodSchema
}
```

### 4. Common Utilities
- **Purpose**: Extrair funcionalidades comuns para evitar duplicação
- **Location**: `src/utils/controllerHelpers.ts`
- **Interface**:
```typescript
interface ControllerHelpers {
  handleValidationError(validationResult: any, res: Response): boolean
  handleNotFound(entity: string, res: Response): void
  handleDatabaseError(operation: string, table: string, error: any, res: Response): void
  buildPaginatedQuery(query: any, page: number, size: number): any
  buildFilteredQuery(query: any, filters: any): any
}
```

## Data Models

### Database Schema (Existing)
As tabelas já existem no schema atual:

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  manager_id UUID REFERENCES profiles(id),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Deal Table
```sql
CREATE TABLE deal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  account_id UUID NOT NULL REFERENCES account(id),
  value NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  stage TEXT NOT NULL,
  probability INTEGER,
  owner_id UUID REFERENCES profiles(id),
  closing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript Interfaces (Existing)
Os tipos já estão definidos em `src/types/index.ts`:

#### Profile Interfaces
```typescript
// Database representation (snake_case)
interface ProfileDB {
  id: string;
  name: string;
  role: string;
  manager_id?: string;
  email: string;
  created_at: string;
}

// API representation (camelCase)
interface Profile {
  id: string;
  name: string;
  role: string;
  managerId?: string;
  email: string;
  createdAt: string;
}
```

#### Deal Interfaces
```typescript
// Database representation (snake_case)
interface DealDB {
  id: string;
  title: string;
  account_id: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  owner_id?: string;
  closing_date?: string;
  created_at: string;
}

// API representation (camelCase)
interface Deal {
  id: string;
  title: string;
  accountId: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  ownerId?: string;
  closingDate?: string;
  createdAt: string;
}
```

### Request/Response Types
```typescript
// Profile request types
interface CreateProfileRequest {
  name: string;
  role?: string;
  managerId?: string;
  email: string;
}

interface UpdateProfileRequest {
  name?: string;
  role?: string;
  managerId?: string;
  email?: string;
}

// Deal request types
interface CreateDealRequest {
  title: string;
  accountId: string;
  value: number;
  currency?: string;
  stage: string;
  probability?: number;
  ownerId?: string;
  closingDate?: string;
}

interface UpdateDealRequest {
  title?: string;
  accountId?: string;
  value?: number;
  currency?: string;
  stage?: string;
  probability?: number;
  ownerId?: string;
  closingDate?: string | null;
}
```

## 
Error Handling

### Error Response Format (Existing)
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  request_id?: string;
}
```

### Error Types
1. **Validation Errors** (400): Zod schema validation failures
2. **Authentication Errors** (401): Invalid or missing tokens (handled by existing middleware)
3. **Not Found Errors** (404): Resource not found
4. **Constraint Violation Errors** (409): Foreign key constraint violations
5. **Database Errors** (500): Supabase operation failures

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties for creation success and response format can be combined into comprehensive creation properties
- Properties for filtering by different fields can be combined into general filtering properties  
- Properties for update validation and success can be combined into comprehensive update properties
- Properties for deletion success and error handling can be combined into comprehensive deletion properties
- Properties for retrieval by ID can be combined for both entities

### Core Properties

**Property 1: Profile creation round trip**
*For any* valid profile data with required fields (name, email), creating the profile should result in a stored record with all provided fields plus generated UUID, timestamps, and default role (SALES_REP) if not provided
**Validates: Requirements 1.1, 1.2, 1.5**

**Property 2: Profile invalid input rejection**
*For any* profile data missing required fields or with invalid manager_id references, the system should reject the request with appropriate Zod or foreign key validation errors
**Validates: Requirements 1.3, 1.4**

**Property 3: Profile retrieval completeness**
*For any* set of profiles in the database, GET /api/profiles should return all existing profiles
**Validates: Requirements 2.1**

**Property 4: Profile search and filtering accuracy**
*For any* search term or filter parameters (role, manager_id), filtered results should only contain profiles matching the specified criteria
**Validates: Requirements 2.2, 2.3, 2.4**

**Property 5: Profile pagination correctness**
*For any* pagination parameters (page, size), the system should return the correct subset of profiles with accurate metadata
**Validates: Requirements 2.5**

**Property 6: Profile partial update preservation**
*For any* existing profile and valid partial update data, only the specified fields should be modified while preserving other fields
**Validates: Requirements 3.1, 3.5**

**Property 7: Profile enum validation during updates**
*For any* role update, only valid enum values (ADMIN, MANAGER, SALES_REP) should be accepted
**Validates: Requirements 3.2**

**Property 8: Profile update validation error handling**
*For any* invalid profile update data, the system should reject the request with detailed Zod validation error messages
**Validates: Requirements 3.4**

**Property 9: Profile deletion completeness**
*For any* existing profile, successful deletion should remove the profile from the database and return confirmation
**Validates: Requirements 4.1, 4.3**

**Property 10: Profile cascading deletion handling**
*For any* profile with related accounts or deals as owner, deletion should handle foreign key constraints appropriately
**Validates: Requirements 4.4, 4.5**

**Property 11: Deal creation round trip**
*For any* valid deal data with required fields (title, account_id, value, stage), creating the deal should result in a stored record with all provided fields plus generated UUID, timestamps, and default currency (BRL) if not provided
**Validates: Requirements 5.1, 5.2, 5.5**

**Property 12: Deal invalid input rejection**
*For any* deal data missing required fields or with invalid account_id/owner_id references, the system should reject the request with appropriate Zod or foreign key validation errors
**Validates: Requirements 5.3, 5.4**

**Property 13: Deal retrieval completeness**
*For any* set of deals in the database, GET /api/deals should return all existing deals
**Validates: Requirements 6.1**

**Property 14: Deal search and filtering accuracy**
*For any* search term or filter parameters (stage, account_id), filtered results should only contain deals matching the specified criteria
**Validates: Requirements 6.2, 6.3, 6.4**

**Property 15: Deal pagination correctness**
*For any* pagination parameters (page, size), the system should return the correct subset of deals with accurate metadata
**Validates: Requirements 6.5**

**Property 16: Deal partial update preservation**
*For any* existing deal and valid partial update data, only the specified fields should be modified while preserving other fields
**Validates: Requirements 7.1, 7.5**

**Property 17: Deal enum validation during updates**
*For any* stage update, only valid enum values (Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost) should be accepted
**Validates: Requirements 7.2**

**Property 18: Deal update validation error handling**
*For any* invalid deal update data, the system should reject the request with detailed Zod validation error messages
**Validates: Requirements 7.4**

**Property 19: Deal deletion completeness**
*For any* existing deal, successful deletion should remove the deal from the database and return confirmation
**Validates: Requirements 8.1, 8.3**

**Property 20: Deal constraint violation handling**
*For any* deal deletion that fails due to database constraints, the system should return appropriate error response with constraint details
**Validates: Requirements 8.4**

**Property 21: Entity retrieval by ID**
*For any* existing profile or deal, GET /api/profiles/:id or GET /api/deals/:id should return the complete entity data in API format (camelCase)
**Validates: Requirements 10.1, 10.2, 10.5**

**Property 22: Invalid ID parameter handling**
*For any* invalid UUID format in ID parameters, the system should return 400 validation error response
**Validates: Requirements 10.4**

## Testing Strategy

### Dual Testing Approach

The system will implement both unit testing and property-based testing approaches:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties that should hold across all inputs
- Together they provide comprehensive coverage: unit tests catch concrete bugs, property tests verify general correctness

### Unit Testing Requirements

Unit tests will cover:
- Specific examples that demonstrate correct behavior
- Integration points between components
- Error handling scenarios
- Edge cases like empty inputs and boundary values

### Property-Based Testing Requirements

- **Library**: fast-check for TypeScript/Node.js property-based testing
- **Iterations**: Minimum of 100 iterations per property test to ensure thorough coverage
- **Tagging**: Each property-based test must be tagged with a comment explicitly referencing the correctness property in the design document
- **Format**: `**Feature: crm-profiles-deals-crud, Property {number}: {property_text}**`
- **Implementation**: Each correctness property must be implemented by a single property-based test
- **Placement**: Property tests should be placed close to implementation to catch errors early

### Test Organization

Tests will be organized following the existing patterns:
- Controller tests in `src/test/controllers/`
- Schema validation tests in `src/test/schemas/`
- Utility function tests in `src/test/utils/`
- Integration tests for complete request/response cycles

## Implementation Strategy

### Code Reuse and Consistency

To maintain consistency with existing code and avoid duplication:

1. **Extract Common Patterns**: Create utility functions for common controller operations
2. **Extend Existing Files**: Add new schemas to existing `accountSchemas.ts`
3. **Follow Naming Conventions**: Use same patterns as existing code
4. **Reuse Middleware**: Use existing authentication and error handling middleware
5. **Consistent Response Formats**: Follow same response structure as accounts module

### File Structure

```
src/
├── controllers/
│   ├── accountController.ts (existing)
│   ├── profileController.ts (new)
│   └── dealController.ts (new)
├── schemas/
│   └── accountSchemas.ts (extend with profile/deal schemas)
├── types/
│   └── index.ts (extend with new request types)
├── utils/
│   └── controllerHelpers.ts (new - common functions)
└── routes/
    ├── accountRoutes.ts (existing)
    ├── profileRoutes.ts (new)
    └── dealRoutes.ts (new)
```

### Development Approach

1. **Implementation-First**: Implement features before writing corresponding tests
2. **Incremental Development**: Build each controller independently
3. **Early Validation**: Run tests after each major component
4. **Code Review**: Ensure consistency with existing patterns
5. **Integration Testing**: Verify complete request/response cycles