import { eq, and, or, like, ilike, gt, gte, lt, lte, ne, inArray, notInArray, isNull, isNotNull, between, asc, desc, count } from 'drizzle-orm';
import { db_client } from 'src/_core/config/database/postgres/drizzle';

// Format: field: ["operator", value]
export class FilterType {
    [key: string]: [string, any] | number | string | undefined;
    page?: number;          // Page number (starts from 1)
    limit?: number;         // Number of items per page
    sortBy?: string;        // Field to sort by
    sortOrder?: 'asc' | 'desc';  // Sort order
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;      // Total number of records
        page: number;       // Current page
        limit: number;      // Items per page
        totalPages: number; // Total number of pages
        hasNext: boolean;   // Has next page
        hasPrev: boolean;   // Has previous page
    };
}

export class BaseCrudService {

    table: any;
    idColumn: any;

    constructor(
        table: any,
        idColumn: any
    ) {
        this.table = table;
        this.idColumn = idColumn;
    }

    /**
     * Parse filter value and return operator with value
     * @param value - Filter value must be: [operator, value]
     * @returns { operator, value }
     */
    private parseFilterValue(value: any): { operator: string; value: any } {
        // Check if it's an array [operator, value]
        if (Array.isArray(value) && value.length === 2) {
            return { operator: value[0], value: value[1] };
        }

        // Throw error if not in correct format
        throw new Error('Filter value must be an array with 2 elements: [operator, value]');
    }

    /**
     * Apply the corresponding operator to column and value
     */
    private applyOperator(column: any, operator: string, value: any) {
        switch (operator) {
            case 'eq': // Equal
                return eq(column, value);

            case 'ne': // Not Equal
                return ne(column, value);

            case 'gt': // Greater Than
                return gt(column, value);

            case 'gte': // Greater Than or Equal
                return gte(column, value);

            case 'lt': // Less Than
                return lt(column, value);

            case 'lte': // Less Than or Equal
                return lte(column, value);

            case 'contains': // Contains (case-sensitive)
                return like(column, `%${value}%`);

            case 'icontains': // Contains (case-insensitive)
                return ilike(column, `%${value}%`);

            case 'startsWith': // Starts With
                return like(column, `${value}%`);

            case 'endsWith': // Ends With
                return like(column, `%${value}`);

            case 'in': // In Array - value must be an array
                return inArray(column, value);

            case 'notIn': // Not In Array - value must be an array
                return notInArray(column, value);

            case 'isNull': // Is Null - no value needed
                return isNull(column);

            case 'isNotNull': // Is Not Null - no value needed
                return isNotNull(column);

            case 'between': // Between - value must be an array [min, max]
                if (!Array.isArray(value) || value.length !== 2) {
                    throw new Error('Between operator requires an array with 2 elements: [min, max]');
                }
                return between(column, value[0], value[1]);

            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    async findAll(filter: any = {}) {
        // Extract pagination and sorting params from filter
        const { page, limit, sortBy, sortOrder, ...filterFields } = filter;

        let query: any = db_client.select().from(this.table);

        // If filter exists, apply conditions
        if (filterFields && Object.keys(filterFields).length > 0) {
            const conditions = Object.entries(filterFields).map(([key, value]) => {
                const column = this.table[key];
                if (column && value !== undefined && value !== null) {
                    const { operator, value: parsedValue } = this.parseFilterValue(value);
                    const result = this.applyOperator(column, operator, parsedValue);
                    return result;
                }
            }).filter(Boolean);

            if (conditions.length > 0) {
                query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
            }
        }

        // Apply sorting if provided
        if (sortBy && this.table[sortBy]) {
            const sortColumn = this.table[sortBy];
            query = query.orderBy(sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn));
        }

        // Apply pagination if provided
        if (limit !== undefined && limit > 0) {
            const pageSize = Math.min(100, limit); // Max 100 items
            query = query.limit(pageSize);

            if (page !== undefined && page > 0) {
                const offset = (page - 1) * pageSize;
                query = query.offset(offset);
            }
        }

        const result = await query;

        return {
            data: result,
            meta: {
                total: result.length,
            }
        }
    }

    async findOne(id: number) {
        const results = await db_client
            .select()
            .from(this.table)
            .where(eq(this.idColumn, id))
            .limit(1);

        return results[0] || null;
    }

    async create(data: any) {
        const results = await db_client
            .insert(this.table)
            .values(data)
            .returning();

        return results[0];
    }

    async update(id: number, data: any) {
        const results = await db_client
            .update(this.table)
            .set(data)
            .where(eq(this.idColumn, id))
            .returning();

        return results[0];
    }

    async delete(id: number) {
        const results = await db_client
            .delete(this.table)
            .where(eq(this.idColumn, id))
            .returning();

        return results[0];
    }
}