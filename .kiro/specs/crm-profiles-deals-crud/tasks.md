# Implementation Plan

- [x] 1. Create common utility functions to avoid code duplication






  - Extract common controller patterns from accountController.ts
  - Create helper functions for validation error handling, database operations, and response formatting
  - Create utility functions for pagination and filtering logic
  - _Requirements: 9.5_

- [x] 2. Extend validation schemas for profiles and deals





- [x] 2.1 Add profile validation schemas to accountSchemas.ts


  - Create CreateProfileSchema with required fields (name, email) and optional fields (role, managerId)
  - Create UpdateProfileSchema for partial profile updates
  - Create ProfileIdParamSchema for route parameter validation
  - Create ProfileQueryParamsSchema for filtering and pagination
  - _Requirements: 9.2, 1.3, 3.4_

- [ ]* 2.2 Write property test for profile schema validation
  - **Property 2: Profile invalid input rejection**
  - **Validates: Requirements 1.3, 1.4**

- [x] 2.3 Add deal validation schemas to accountSchemas.ts


  - Create CreateDealSchema with required fields (title, accountId, value, stage) and optional fields
  - Create UpdateDealSchema for partial deal updates
  - Create DealIdParamSchema for route parameter validation
  - Create DealQueryParamsSchema for filtering and pagination
  - _Requirements: 9.2, 5.3, 7.4_

- [ ]* 2.4 Write property test for deal schema validation
  - **Property 12: Deal invalid input rejection**
  - **Validates: Requirements 5.3, 5.4**

- [x] 3. Extend types and conversion functions





- [x] 3.1 Add profile request/response types to types/index.ts


  - Create CreateProfileRequest and UpdateProfileRequest interfaces
  - Add profileDbToApi and profileApiToDb conversion functions
  - _Requirements: 9.3_

- [x] 3.2 Add deal request/response types to types/index.ts


  - Create CreateDealRequest and UpdateDealRequest interfaces
  - Add dealDbToApi and dealApiToDb conversion functions (already exist, verify completeness)
  - _Requirements: 9.3_

- [x] 4. Implement profile controller





- [x] 4.1 Create profileController.ts with createProfile function


  - Implement POST /api/profiles endpoint with Zod validation
  - Handle default value assignment for role (SALES_REP)
  - Return created profile with UUID and timestamps
  - Handle foreign key constraint violations for manager_id
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 4.2 Write property test for profile creation
  - **Property 1: Profile creation round trip**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [x] 4.3 Create getProfiles function in profileController.ts


  - Implement GET /api/profiles with filtering and pagination
  - Add search functionality for name and email fields
  - Support role and managerId filtering
  - Implement pagination with page and size parameters
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 4.4 Write property test for profile retrieval and filtering
  - **Property 3: Profile retrieval completeness**
  - **Validates: Requirements 2.1**

- [ ]* 4.5 Write property test for profile search and filtering
  - **Property 4: Profile search and filtering accuracy**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ]* 4.6 Write property test for profile pagination
  - **Property 5: Profile pagination correctness**
  - **Validates: Requirements 2.5**

- [x] 4.7 Create getProfileById function in profileController.ts


  - Implement GET /api/profiles/:id endpoint
  - Handle 404 errors for non-existent profiles
  - Return complete profile data in API format (camelCase)
  - _Requirements: 10.1, 10.3, 10.5_

- [ ]* 4.8 Write property test for profile retrieval by ID
  - **Property 21: Entity retrieval by ID**
  - **Validates: Requirements 10.1, 10.2, 10.5**

- [x] 4.9 Create updateProfile function in profileController.ts


  - Implement PUT /api/profiles/:id with partial update support
  - Add enum validation for role updates (ADMIN, MANAGER, SALES_REP)
  - Handle 404 errors for non-existent profiles
  - Return updated profile data
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 4.10 Write property test for profile updates
  - **Property 6: Profile partial update preservation**
  - **Validates: Requirements 3.1, 3.5**

- [ ]* 4.11 Write property test for profile enum validation
  - **Property 7: Profile enum validation during updates**
  - **Validates: Requirements 3.2**

- [ ]* 4.12 Write property test for profile update validation errors
  - **Property 8: Profile update validation error handling**
  - **Validates: Requirements 3.4**

- [x] 4.13 Create deleteProfile function in profileController.ts


  - Implement DELETE /api/profiles/:id
  - Handle cascading operations for related accounts and deals
  - Return appropriate responses for success and constraint violations
  - Handle 404 errors for non-existent profiles
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.14 Write property test for profile deletion
  - **Property 9: Profile deletion completeness**
  - **Validates: Requirements 4.1, 4.3**

- [ ]* 4.15 Write property test for profile cascading deletion
  - **Property 10: Profile cascading deletion handling**
  - **Validates: Requirements 4.4, 4.5**

- [x] 5. Implement deal controller





- [x] 5.1 Create dealController.ts with createDeal function


  - Implement POST /api/deals endpoint with Zod validation
  - Handle default value assignment for currency (BRL)
  - Return created deal with UUID and timestamps
  - Handle foreign key constraint violations for account_id and owner_id
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 5.2 Write property test for deal creation
  - **Property 11: Deal creation round trip**
  - **Validates: Requirements 5.1, 5.2, 5.5**

- [x] 5.3 Create getDeals function in dealController.ts


  - Implement GET /api/deals with filtering and pagination
  - Add search functionality for title field
  - Support stage and accountId filtering
  - Implement pagination with page and size parameters
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 5.4 Write property test for deal retrieval
  - **Property 13: Deal retrieval completeness**
  - **Validates: Requirements 6.1**

- [ ]* 5.5 Write property test for deal search and filtering
  - **Property 14: Deal search and filtering accuracy**
  - **Validates: Requirements 6.2, 6.3, 6.4**

- [ ]* 5.6 Write property test for deal pagination
  - **Property 15: Deal pagination correctness**
  - **Validates: Requirements 6.5**

- [x] 5.7 Create getDealById function in dealController.ts


  - Implement GET /api/deals/:id endpoint
  - Handle 404 errors for non-existent deals
  - Return complete deal data in API format (camelCase)
  - _Requirements: 10.2, 10.3, 10.5_

- [x] 5.8 Create updateDeal function in dealController.ts


  - Implement PUT /api/deals/:id with partial update support
  - Add enum validation for stage updates (Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost)
  - Handle 404 errors for non-existent deals
  - Return updated deal data
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 5.9 Write property test for deal updates
  - **Property 16: Deal partial update preservation**
  - **Validates: Requirements 7.1, 7.5**

- [ ]* 5.10 Write property test for deal enum validation
  - **Property 17: Deal enum validation during updates**
  - **Validates: Requirements 7.2**

- [ ]* 5.11 Write property test for deal update validation errors
  - **Property 18: Deal update validation error handling**
  - **Validates: Requirements 7.4**

- [x] 5.12 Create deleteDeal function in dealController.ts


  - Implement DELETE /api/deals/:id
  - Handle constraint violations appropriately
  - Return appropriate responses for success and errors
  - Handle 404 errors for non-existent deals
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 5.13 Write property test for deal deletion
  - **Property 19: Deal deletion completeness**
  - **Validates: Requirements 8.1, 8.3**

- [ ]* 5.14 Write property test for deal constraint violations
  - **Property 20: Deal constraint violation handling**
  - **Validates: Requirements 8.4**

- [x] 6. Create routes for profiles and deals




- [x] 6.1 Create profileRoutes.ts


  - Set up Express router for /api/profiles endpoints
  - Apply authentication middleware to all routes
  - Configure proper HTTP methods and route parameters
  - Mount all profile controller functions
  - _Requirements: 9.4_

- [x] 6.2 Create dealRoutes.ts


  - Set up Express router for /api/deals endpoints
  - Apply authentication middleware to all routes
  - Configure proper HTTP methods and route parameters
  - Mount all deal controller functions
  - _Requirements: 9.4_

- [x] 6.3 Update main application to include new routes


  - Import and mount profile and deal routes in main Express app
  - Ensure proper route ordering and middleware application
  - _Requirements: 9.4_

- [ ]* 6.4 Write property test for invalid ID parameter handling
  - **Property 22: Invalid ID parameter handling**
  - **Validates: Requirements 10.4**

- [x] 7. Checkpoint - Ensure all tests pass






  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Write unit tests for edge cases and integration scenarios
  - Create unit tests for specific examples and edge cases
  - Test integration points between components
  - Test error handling scenarios
  - Test boundary conditions and empty inputs
  - _Requirements: All requirements need comprehensive test coverage_