import { logger } from './logger';

/**
 * Advanced filter parser that handles relationship filters using PostgREST syntax
 * This extends the basic filter parser to support complex relationship queries
 */

interface RelationshipFilter {
  relationshipName: string;
  fieldName: string;
  operator: string;
  value: string | string[];
  logicalOperator?: 'AND' | 'OR';
}

interface AdvancedParsedFilter {
  directFilters: Array<{
    field: string;
    operator: string;
    value: string | string[];
    logicalOperator?: 'AND' | 'OR';
  }>;
  relationshipFilters: RelationshipFilter[];
  hasRelationshipFilter: boolean;
}

/**
 * Parses filters and separates direct field filters from relationship filters
 */
export function parseAdvancedFilter(filterString: string, entity?: string): AdvancedParsedFilter {
  if (!filterString || filterString.trim() === '') {
    return { 
      directFilters: [], 
      relationshipFilters: [], 
      hasRelationshipFilter: false 
    };
  }

  const directFilters: Array<{
    field: string;
    operator: string;
    value: string | string[];
    logicalOperator?: 'AND' | 'OR';
  }> = [];
  
  const relationshipFilters: RelationshipFilter[] = [];
  let hasRelationshipFilter = false;

  // Parse conditions similar to the basic parser
  const parseConditions = (str: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    let i = 0;

    while (i < str.length) {
      const char = str[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        current += char;
      } else if (!inQuotes && str.substring(i).match(/^\s+(AND|OR)\s+/i)) {
        const match = str.substring(i).match(/^\s+(AND|OR)\s+/i);
        if (match) {
          result.push(current.trim());
          result.push(match[1].toUpperCase());
          current = '';
          i += match[0].length - 1;
        }
      } else {
        current += char;
      }
      i++;
    }
    
    if (current.trim()) {
      result.push(current.trim());
    }
    
    return result;
  };

  const tokens = parseConditions(filterString);
  let currentLogicalOperator: 'AND' | 'OR' | undefined;

  for (const token of tokens) {
    // Check if this token is a logical operator
    if (['AND', 'OR'].includes(token)) {
      currentLogicalOperator = token as 'AND' | 'OR';
      continue;
    }

    // Parse condition: field operator value
    const conditionMatch = token.match(/^(\w+(?:\.\w+)?)\s*(=|!=|<>|<=|>=|<|>|LIKE|ILIKE|IN|NOT IN)\s*(.+)$/i);
    
    if (!conditionMatch) {
      throw new Error(`Invalid filter condition: ${token}`);
    }

    const [, fieldName, operator, valueStr] = conditionMatch;

    // Parse value(s)
    let value: string | string[];
    
    if (operator.toUpperCase().includes('IN')) {
      const inMatch = valueStr.match(/^\((.+)\)$/);
      if (!inMatch) {
        throw new Error(`IN operator requires parentheses: ${valueStr}`);
      }
      
      value = inMatch[1]
        .split(',')
        .map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      value = valueStr.replace(/^['"]|['"]$/g, '');
    }

    // Determine if this is a relationship filter
    if (fieldName.includes('.')) {
      hasRelationshipFilter = true;
      const [relationshipName, relFieldName] = fieldName.split('.');
      
      relationshipFilters.push({
        relationshipName,
        fieldName: relFieldName,
        operator: operator.toUpperCase(),
        value,
        logicalOperator: currentLogicalOperator
      });
    } else {
      directFilters.push({
        field: fieldName,
        operator: operator.toUpperCase(),
        value,
        logicalOperator: currentLogicalOperator
      });
    }

    currentLogicalOperator = undefined;
  }

  return { directFilters, relationshipFilters, hasRelationshipFilter };
}

/**
 * Applies advanced filters to Supabase query with proper relationship handling
 */
export function applyAdvancedFiltersToQuery(query: any, parsedFilter: AdvancedParsedFilter, entity?: string): any {
  // Apply direct field filters first
  for (const condition of parsedFilter.directFilters) {
    try {
      switch (condition.operator) {
        case '=':
          query = query.eq(condition.field, condition.value);
          break;
        case '!=':
        case '<>':
          query = query.neq(condition.field, condition.value);
          break;
        case '<':
          query = query.lt(condition.field, condition.value);
          break;
        case '>':
          query = query.gt(condition.field, condition.value);
          break;
        case '<=':
          query = query.lte(condition.field, condition.value);
          break;
        case '>=':
          query = query.gte(condition.field, condition.value);
          break;
        case 'LIKE':
          query = query.like(condition.field, condition.value as string);
          break;
        case 'ILIKE':
          query = query.ilike(condition.field, condition.value as string);
          break;
        case 'IN':
          if (Array.isArray(condition.value)) {
            query = query.in(condition.field, condition.value);
          }
          break;
        case 'NOT IN':
          if (Array.isArray(condition.value)) {
            query = query.not(condition.field, 'in', condition.value);
          }
          break;
      }
    } catch (error) {
      logger.error('FILTER', 'Error applying direct filter condition', error as Error, { 
        filterField: condition.field,
        operator: condition.operator,
        value: condition.value
      });
      throw new Error(`Failed to apply filter for field ${condition.field}: ${(error as Error).message}`);
    }
  }

  // Handle relationship filters using PostgREST syntax
  if (parsedFilter.hasRelationshipFilter) {
    // Group relationship filters by relationship name
    const relationshipGroups = new Map<string, RelationshipFilter[]>();
    
    for (const relFilter of parsedFilter.relationshipFilters) {
      if (!relationshipGroups.has(relFilter.relationshipName)) {
        relationshipGroups.set(relFilter.relationshipName, []);
      }
      relationshipGroups.get(relFilter.relationshipName)!.push(relFilter);
    }

    // Apply relationship filters using PostgREST foreign table syntax
    for (const [relationshipName, filters] of relationshipGroups) {
      let foreignTableReference = '';

      // Map relationship names to foreign table references
      switch (relationshipName) {
        case 'responsible':
          foreignTableReference = 'users!responsible_id';
          break;
        case 'manager':
          foreignTableReference = 'users!manager_id';
          break;
        case 'account':
          foreignTableReference = 'account!account_id';
          break;
        case 'business':
          foreignTableReference = 'business!business_id';
          break;
        default:
          logger.warn('FILTER', 'Unknown relationship', { relationshipName });
          continue;
      }

      // Apply relationship filters using the correct PostgREST syntax
      for (const filter of filters) {
        // For relationship filters, we need to use the foreign key field directly
        let filterField = '';
        
        // Map relationship field to the actual foreign key column
        switch (relationshipName) {
          case 'account':
            if (filter.fieldName === 'id') {
              filterField = 'account_id'; // Use the foreign key column directly
            } else {
              // For other account fields, we would need to join, but for now focus on ID
              logger.warn('FILTER', 'Non-ID relationship filters not yet supported', { 
                relationshipName, 
                fieldName: filter.fieldName 
              });
              continue;
            }
            break;
          case 'business':
            if (filter.fieldName === 'id') {
              filterField = 'business_id'; // Use the foreign key column directly
            } else {
              // For other business fields, we would need to join, but for now focus on ID
              logger.warn('FILTER', 'Non-ID relationship filters not yet supported', { 
                relationshipName, 
                fieldName: filter.fieldName 
              });
              continue;
            }
            break;
          case 'responsible':
            if (filter.fieldName === 'id') {
              filterField = 'responsible_id';
            } else {
              logger.warn('FILTER', 'Non-ID relationship filters not yet supported', { 
                relationshipName, 
                fieldName: filter.fieldName 
              });
              continue;
            }
            break;
          case 'manager':
            if (filter.fieldName === 'id') {
              filterField = 'manager_id';
            } else {
              logger.warn('FILTER', 'Non-ID relationship filters not yet supported', { 
                relationshipName, 
                fieldName: filter.fieldName 
              });
              continue;
            }
            break;
          default:
            logger.warn('FILTER', 'Unknown relationship', { relationshipName });
            continue;
        }
        
        try {
          logger.info('FILTER', 'Applying relationship filter', { 
            relationshipName,
            field: filter.fieldName,
            operator: filter.operator,
            value: filter.value,
            filterField
          });

          switch (filter.operator) {
            case '=':
              query = query.eq(filterField, filter.value);
              break;
            case '!=':
            case '<>':
              query = query.neq(filterField, filter.value);
              break;
            case '<':
              query = query.lt(filterField, filter.value);
              break;
            case '>':
              query = query.gt(filterField, filter.value);
              break;
            case '<=':
              query = query.lte(filterField, filter.value);
              break;
            case '>=':
              query = query.gte(filterField, filter.value);
              break;
            case 'LIKE':
              query = query.like(filterField, filter.value as string);
              break;
            case 'ILIKE':
              query = query.ilike(filterField, filter.value as string);
              break;
            case 'IN':
              if (Array.isArray(filter.value)) {
                query = query.in(filterField, filter.value);
              }
              break;
            case 'NOT IN':
              if (Array.isArray(filter.value)) {
                query = query.not(filterField, 'in', filter.value);
              }
              break;
          }
        } catch (error) {
          logger.error('FILTER', 'Error applying relationship filter', error as Error, { 
            relationshipName,
            field: filter.fieldName,
            operator: filter.operator,
            value: filter.value,
            filterField
          });
          throw new Error(`Failed to apply relationship filter ${relationshipName}.${filter.fieldName}: ${(error as Error).message}`);
        }
      }
    }
  }

  return query;
}