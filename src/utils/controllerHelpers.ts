import { Response } from 'express';
import { supabaseAdmin } from '../supabaseClient';
import { ErrorResponse, PaginatedResponse } from '../types';
import { logger } from './logger';
import { parseFilter, applyFiltersToQuery } from './filterParser';

/**
 * Handle Zod validation errors with consistent error response format
 */
export function handleValidationError(validationResult: any, res: Response): boolean {
  if (!validationResult.success) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: validationResult.error.errors
    } as ErrorResponse);
    return true;
  }
  return false;
}

/**
 * Handle not found errors with consistent error response format
 */
export function handleNotFound(entityName: string, res: Response): void {
  res.status(404).json({
    error: 'Not Found',
    message: `${entityName} not found`
  } as ErrorResponse);
}

/**
 * Handle database errors with consistent error response format and logging
 */
export function handleDatabaseError(
  operation: string, 
  tableName: string, 
  error: any, 
  res: Response,
  customMessage?: string
): void {
  logger.dbError(operation, tableName, error as Error);
  
  // Handle foreign key constraint violations
  if (error.code === '23503') {
    let message = 'Foreign key constraint violation';
    
    if (error.details?.includes('owner_id')) {
      message = 'Invalid owner_id: referenced user does not exist';
    } else if (error.details?.includes('account_id')) {
      message = 'Invalid account_id: referenced account does not exist';
    } else if (error.details?.includes('manager_id')) {
      message = 'Invalid manager_id: referenced user does not exist';
    }
    
    res.status(400).json({
      error: 'Foreign Key Violation',
      message,
      details: error
    } as ErrorResponse);
    return;
  }
  
  // Handle constraint violations for deletion
  if (error.code === '23503' && operation === 'DELETE') {
    res.status(409).json({
      error: 'Constraint Violation',
      message: `Cannot delete ${tableName.slice(0, -1)}: related records exist. Please delete related records first or handle cascading operations.`,
      details: error
    } as ErrorResponse);
    return;
  }
  
  // Generic database error
  res.status(500).json({
    error: 'Database Error',
    message: customMessage || `Failed to ${operation.toLowerCase()} ${tableName.slice(0, -1)}`,
    details: error
  } as ErrorResponse);
}

/**
 * Handle internal server errors with consistent error response format and logging
 */
export function handleInternalError(
  operation: string, 
  error: any, 
  res: Response
): void {
  logger.error('CONTROLLER', `Error in ${operation}`, error as Error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: `An unexpected error occurred while ${operation}`
  } as ErrorResponse);
}

/**
 * Build paginated query with consistent pagination logic
 */
export function buildPaginatedQuery(query: any, page: number = 1, size: number = 10): any {
  const offset = (page - 1) * size;
  return query.range(offset, offset + size - 1);
}

/**
 * Build filtered query with dynamic filter support and legacy filter fallback
 */
export function buildFilteredQuery(
  query: any, 
  queryParams: any,
  legacyFilters?: { [key: string]: string }
): any {
  try {
    // Apply dynamic filter if provided
    if (queryParams.filter) {
      // Safely decode URL-encoded filter string
      let decodedFilter = queryParams.filter;
      
      // Try multiple decoding attempts for different encoding levels
      try {
        // First attempt - single decode
        const firstDecode = decodeURIComponent(queryParams.filter);
        
        // Check if it still contains encoded characters
        if (firstDecode.includes('%')) {
          try {
            // Second attempt - double decode
            decodedFilter = decodeURIComponent(firstDecode);
          } catch {
            decodedFilter = firstDecode;
          }
        } else {
          decodedFilter = firstDecode;
        }
      } catch (decodeError) {
        // If all decoding fails, use the original string
        logger.warn('CONTROLLER', 'Failed to decode filter, using original', { 
          filter: queryParams.filter,
          error: (decodeError as Error).message
        });
      }
      
      logger.debug('CONTROLLER', 'Processing filter', { 
        original: queryParams.filter, 
        decoded: decodedFilter 
      });
      
      const parsedFilter = parseFilter(decodedFilter);
      logger.filterParsing(decodedFilter, true);
      query = applyFiltersToQuery(query, parsedFilter);
    } else if (legacyFilters) {
      // Apply legacy filters for backward compatibility
      Object.entries(legacyFilters).forEach(([key, value]) => {
        if (queryParams[key]) {
          query = query.eq(value, queryParams[key]);
        }
      });
    }
  } catch (filterError) {
    let decodedFilter = '';
    if (queryParams.filter) {
      try {
        decodedFilter = decodeURIComponent(queryParams.filter);
      } catch {
        decodedFilter = queryParams.filter;
      }
    }
    logger.filterParsing(decodedFilter, false, filterError as Error);
    throw new Error(filterError instanceof Error ? filterError.message : 'Invalid filter syntax');
  }
  
  return query;
}

/**
 * Build search query with OR conditions for multiple fields
 */
export function buildSearchQuery(query: any, searchTerm: string, searchFields: string[]): any {
  if (!searchTerm || searchFields.length === 0) {
    return query;
  }
  
  const searchConditions = searchFields.map(field => `${field}.ilike.%${searchTerm}%`).join(',');
  return query.or(searchConditions);
}

/**
 * Create paginated response with consistent metadata format
 */
export function createPaginatedResponse<T>(
  contents: T[], 
  totalElements: number, 
  page: number, 
  size: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalElements / size);
  
  return {
    contents,
    totalElements,
    totalPages
  };
}

/**
 * Check if entity exists in database
 */
export async function checkEntityExists(
  tableName: string, 
  id: string
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from(tableName)
    .select('id')
    .eq('id', id)
    .single();
    
  return !error && !!data;
}

/**
 * Generic entity creation with validation and error handling
 */
export async function createEntity<T>(
  tableName: string,
  entityData: any,
  validationSchema: any,
  requestBody: any,
  res: Response,
  convertApiToDb: (data: any) => any,
  convertDbToApi: (data: any) => T,
  defaultValues?: any
): Promise<T | null> {
  try {
    // Validate request body
    const validationResult = validationSchema.safeParse(requestBody);
    if (handleValidationError(validationResult, res)) {
      return null;
    }

    // Convert API data to database format and add defaults
    const dbData = convertApiToDb(validationResult.data);
    const dataToInsert = {
      ...dbData,
      ...defaultValues
    };

    // Insert into database
    const { data: createdEntity, error } = await supabaseAdmin
      .from(tableName)
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      handleDatabaseError('INSERT', tableName, error, res);
      return null;
    }

    // Convert and return result
    const apiEntity = convertDbToApi(createdEntity);
    res.status(201).json(apiEntity);
    return apiEntity;

  } catch (error) {
    handleInternalError(`creating ${tableName.slice(0, -1)}`, error, res);
    return null;
  }
}

/**
 * Generic entity update with validation and error handling
 */
export async function updateEntity<T>(
  tableName: string,
  id: string,
  validationSchema: any,
  requestBody: any,
  res: Response,
  convertApiToDb: (data: any) => any,
  convertDbToApi: (data: any) => T,
  additionalUpdateData?: any
): Promise<T | null> {
  try {
    // Validate request body
    const validationResult = validationSchema.safeParse(requestBody);
    if (handleValidationError(validationResult, res)) {
      return null;
    }

    // Check if entity exists
    const exists = await checkEntityExists(tableName, id);
    if (!exists) {
      handleNotFound(tableName.slice(0, -1), res);
      return null;
    }

    // Convert API data to database format and add additional data
    const dbUpdateData = convertApiToDb(validationResult.data);
    const updateData = {
      ...dbUpdateData,
      ...additionalUpdateData
    };

    // Update in database
    const { data: updatedEntity, error } = await supabaseAdmin
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleDatabaseError('UPDATE', tableName, error, res);
      return null;
    }

    // Convert and return result
    const apiEntity = convertDbToApi(updatedEntity);
    res.status(200).json(apiEntity);
    return apiEntity;

  } catch (error) {
    handleInternalError(`updating ${tableName.slice(0, -1)}`, error, res);
    return null;
  }
}

/**
 * Generic entity deletion with error handling
 */
export async function deleteEntity(
  tableName: string,
  id: string,
  res: Response
): Promise<boolean> {
  try {
    // Check if entity exists
    const exists = await checkEntityExists(tableName, id);
    if (!exists) {
      handleNotFound(tableName.slice(0, -1), res);
      return false;
    }

    // Delete from database
    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      handleDatabaseError('DELETE', tableName, error, res);
      return false;
    }

    // Return success confirmation
    res.status(200).json({
      message: `${tableName.slice(0, -1)} deleted successfully`,
      id: id
    });
    return true;

  } catch (error) {
    handleInternalError(`deleting ${tableName.slice(0, -1)}`, error, res);
    return false;
  }
}

/**
 * Generic entity retrieval by ID with error handling
 */
export async function getEntityById<T>(
  tableName: string,
  id: string,
  res: Response,
  convertDbToApi: (data: any) => T
): Promise<T | null> {
  try {
    // Fetch entity from database
    const { data: entity, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !entity) {
      handleNotFound(tableName.slice(0, -1), res);
      return null;
    }

    // Convert and return result
    const apiEntity = convertDbToApi(entity);
    res.status(200).json(apiEntity);
    return apiEntity;

  } catch (error) {
    handleInternalError(`fetching ${tableName.slice(0, -1)}`, error, res);
    return null;
  }
}

/**
 * Generic entity listing with filtering, searching, and pagination
 */
export async function getEntities<T>(
  tableName: string,
  queryParams: any,
  res: Response,
  convertDbToApi: (data: any) => T,
  searchFields: string[] = [],
  legacyFilters?: { [key: string]: string }
): Promise<PaginatedResponse<T> | null> {
  try {
    // Set default pagination values
    const page = queryParams.page || 1;
    const size = queryParams.size || 10;

    // Build base query
    let query = supabaseAdmin.from(tableName).select('*', { count: 'exact' });

    // Apply search if provided
    if (queryParams.search && searchFields.length > 0) {
      query = buildSearchQuery(query, queryParams.search, searchFields);
    }

    // Apply filters
    query = buildFilteredQuery(query, queryParams, legacyFilters);

    // Apply pagination
    query = buildPaginatedQuery(query, page, size);

    // Order by created_at descending
    query = query.order('created_at', { ascending: false });

    // Execute query
    const { data: entities, error, count } = await query;

    if (error) {
      handleDatabaseError('SELECT', tableName, error, res);
      return null;
    }

    // Convert database results to API format
    const apiEntities = (entities || []).map(convertDbToApi);
    
    // Create and return paginated response
    const response = createPaginatedResponse(apiEntities, count || 0, page, size);
    res.status(200).json(response);
    return response;

  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid filter syntax')) {
      res.status(400).json({
        error: 'Invalid Filter',
        message: error.message,
        details: { filter: queryParams.filter }
      } as ErrorResponse);
      return null;
    }
    
    handleInternalError(`fetching ${tableName}`, error, res);
    return null;
  }
}