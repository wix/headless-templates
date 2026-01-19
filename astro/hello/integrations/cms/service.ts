import { items } from "@wix/data";
import { WixDataItem } from ".";

/**
 * Pagination options for querying collections
 */
export interface PaginationOptions {
  /** Number of items per page (default: 50, max: 1000) */
  limit?: number;
  /** Number of items to skip (for offset-based pagination) */
  skip?: number;
}

/**
 * Metadata for a multi-reference field (available on item._refMeta[fieldName])
 * Only populated by getById, not getAll
 */
export interface RefFieldMeta {
  /** Total count of referenced items */
  totalCount: number;
  /** Number of items returned */
  returnedCount: number;
  /** Whether there are more items beyond what was returned */
  hasMore: boolean;
}

/**
 * Paginated result with metadata for infinite scroll
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  items: T[];
  /** Total number of items in the collection */
  totalCount: number;
  /** Whether there are more items after current page */
  hasNext: boolean;
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Offset to use for next page */
  nextSkip: number | null;
}

/**
 * Generic CRUD Service class for Wix Data collections
 * Provides type-safe CRUD operations with error handling
 */
export class BaseCrudService {
  /**
   * Populates multi-reference fields for a single item using queryReferenced()
   * Fetches up to 1000 items and provides metadata for further pagination
   */
  private static async populateMultiRefs<T extends WixDataItem>(
    collectionId: string,
    item: T,
    multiRefs: string[]
  ): Promise<T> {
    if (multiRefs.length === 0) return item;

    const itemWithRefs = { ...item } as any;
    itemWithRefs._refMeta = {};

    for (const refField of multiRefs) {
      try {
        // Fetch up to 1000 referenced items with total count
        const result = await items.queryReferenced(collectionId, item._id, refField, {
          limit: 1000,
          returnTotalCount: true
        });

        itemWithRefs[refField] = result.items;
        itemWithRefs._refMeta[refField] = {
          totalCount: result.totalCount ?? result.items.length,
          returnedCount: result.items.length,
          hasMore: result.hasNext()
        };
      } catch {
        itemWithRefs[refField] = [];
        itemWithRefs._refMeta[refField] = { totalCount: 0, returnedCount: 0, hasMore: false };
      }
    }
    return itemWithRefs as T;
  }

  /**
   * Creates a new item in the collection
   * @param itemData - Data for the new item (single reference fields should be IDs: string)
   * @param multiReferences - Multi-reference fields as Record<fieldName, arrayOfIds>
   * @returns Promise<T> - The created item
   */
  static async create<T extends WixDataItem>(
    collectionId: string,
    itemData: Partial<T> | Record<string, unknown>,
    multiReferences?: Record<string, any>
  ): Promise<T> {
    try {
      const result = await items.insert(collectionId, itemData as Record<string, unknown>);

      if (multiReferences && Object.keys(multiReferences).length > 0 && result._id) {
        for (const [propertyName, refIds] of Object.entries(multiReferences)) {
          if (Array.isArray(refIds) && refIds.length > 0) {
            await items.insertReference(collectionId, propertyName, result._id, refIds as string[]);
          }
        }
      }

      return result as T;
    } catch (error) {
      // Should consider reverting the insert with a remove in order to prevent partial insert.
      console.error(`Error creating ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to create ${collectionId}`
      );
    }
  }

  /**
   * Retrieves items from the collection with pagination (default: 50 per page)
   * @param includeRefs - { singleRef: [...], multiRef: [...] } or string[] for backward compatibility
   */
  static async getAll<T extends WixDataItem>(
    collectionId: string,
    includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[],
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    try {
      const limit = Math.min(pagination?.limit ?? 50, 1000);
      const skip = pagination?.skip ?? 0;

      // Support both old format (string[]) and new format ({ singleRef, multiRef })
      const allRefs = Array.isArray(includeRefs)
        ? includeRefs
        : [...(includeRefs?.singleRef || []), ...(includeRefs?.multiRef || [])];

      let query = items.query(collectionId);
      if (allRefs.length > 0) {
        query = query.include(...allRefs);
      }

      const result = await query.skip(skip).limit(limit).find({ returnTotalCount: true });
      const hasNext = result.hasNext();

      return {
        items: result.items as T[],
        totalCount: result.totalCount ?? result.items.length,
        hasNext,
        currentPage: Math.floor(skip / limit),
        pageSize: limit,
        nextSkip: hasNext ? skip + limit : null,
      };
    } catch (error) {
      console.error(`Error fetching ${collectionId}s:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to fetch ${collectionId}s`
      );
    }
  }

  /**
   * Retrieves a single item by ID with full reference support
   * Use this for detail pages where you need multi-reference fields populated
   * @param includeRefs - { singleRef: [...], multiRef: [...] } or string[] for backward compatibility
   */
  static async getById<T extends WixDataItem>(
    collectionId: string,
    itemId: string,
    includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[]
  ): Promise<T | null> {
    try {
      // Support both old format (string[]) and new format ({ singleRef, multiRef })
      const isLegacyFormat = Array.isArray(includeRefs);
      const singleRefs = isLegacyFormat ? includeRefs : (includeRefs?.singleRef || []);
      const multiRefs = isLegacyFormat ? [] : (includeRefs?.multiRef || []);

      let query = items.query(collectionId).eq("_id", itemId);
      if (singleRefs.length > 0) {
        query = query.include(...singleRefs);
      }

      const result = await query.find();
      if (result.items.length === 0) return null;

      // Populate multi-refs using queryReferenced (only for single item - efficient)
      return this.populateMultiRefs<T>(collectionId, result.items[0] as T, multiRefs);
    } catch (error) {
      console.error(`Error fetching ${collectionId} by ID:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to fetch ${collectionId}`
      );
    }
  }

  /**
   * Updates an existing item
   * @param itemData - Updated item data (must include _id, only include fields to update)
   * @returns Promise<T> - The updated item
   */
  static async update<T extends WixDataItem>(collectionId: string, itemData: T): Promise<T> {
    try {
      if (!itemData._id) {
        throw new Error(`${collectionId} ID is required for update`);
      }

      const currentItem = await this.getById<T>(collectionId, itemData._id);

      const mergedData = { ...currentItem, ...itemData };

      const result = await items.update(collectionId, mergedData);
      return result as T;
    } catch (error) {
      console.error(`Error updating ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to update ${collectionId}`
      );
    }
  }

  /**
   * Deletes an item by ID
   * @param itemId - ID of the item to delete
   * @returns Promise<T> - The deleted item
   */
  static async delete<T extends WixDataItem>(collectionId: string, itemId: string): Promise<T> {
    try {
      if (!itemId) {
        throw new Error(`${collectionId} ID is required for deletion`);
      }

      const result = await items.remove(collectionId, itemId);
      return result as T;
    } catch (error) {
      console.error(`Error deleting ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to delete ${collectionId}`
      );
    }
  }

  /**
   * Adds references to a multi-reference field
   * @param collectionId - The collection containing the item
   * @param itemId - The item to add references to
   * @param references - Record of field names to arrays of reference IDs
   */
  static async addReferences(
    collectionId: string,
    itemId: string,
    references: Record<string, string[]>
  ): Promise<void> {
    try {
      for (const [fieldName, refIds] of Object.entries(references)) {
        if (refIds.length > 0) {
          await items.insertReference(collectionId, fieldName, itemId, refIds);
        }
      }
    } catch (error) {
      console.error(`Error adding references to ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to add references to ${collectionId}`
      );
    }
  }

  /**
   * Removes references from a multi-reference field
   * @param collectionId - The collection containing the item
   * @param itemId - The item to remove references from
   * @param references - Record of field names to arrays of reference IDs to remove
   */
  static async removeReferences(
    collectionId: string,
    itemId: string,
    references: Record<string, string[]>
  ): Promise<void> {
    try {
      for (const [fieldName, refIds] of Object.entries(references)) {
        if (refIds.length > 0) {
          await items.removeReference(collectionId, fieldName, itemId, refIds);
        }
      }
    } catch (error) {
      console.error(`Error removing references from ${collectionId}:`, error);
      throw new Error(
        error instanceof Error ? error.message : `Failed to remove references from ${collectionId}`
      );
    }
  }

}
