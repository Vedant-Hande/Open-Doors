/**
 * Advanced pagination utilities
 * Supports cursor-based and offset-based pagination
 */

class Pagination {
  constructor(options = {}) {
    this.defaultLimit = options.defaultLimit || 20;
    this.maxLimit = options.maxLimit || 100;
    this.defaultPage = options.defaultPage || 1;
  }

  /**
   * Build pagination parameters from request query
   * @param {Object} query - Request query parameters
   * @returns {Object} Pagination parameters
   */
  buildPagination(query) {
    const page = Math.max(1, parseInt(query.page) || this.defaultPage);
    const limit = Math.min(this.maxLimit, Math.max(1, parseInt(query.limit) || this.defaultLimit));
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
      offset: skip // Alias for skip
    };
  }

  /**
   * Build pagination info for response
   * @param {Object} pagination - Pagination parameters
   * @param {number} totalCount - Total number of items
   * @returns {Object} Pagination info
   */
  buildPaginationInfo(pagination, totalCount) {
    const totalPages = Math.ceil(totalCount / pagination.limit);
    
    return {
      currentPage: pagination.page,
      totalPages,
      totalCount,
      limit: pagination.limit,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
      nextPage: pagination.page < totalPages ? pagination.page + 1 : null,
      prevPage: pagination.page > 1 ? pagination.page - 1 : null,
      startIndex: pagination.skip + 1,
      endIndex: Math.min(pagination.skip + pagination.limit, totalCount)
    };
  }

  /**
   * Build pagination links for API response
   * @param {Object} paginationInfo - Pagination info
   * @param {string} baseUrl - Base URL for links
   * @param {Object} queryParams - Additional query parameters
   * @returns {Object} Pagination links
   */
  buildPaginationLinks(paginationInfo, baseUrl, queryParams = {}) {
    const { currentPage, totalPages, hasNext, hasPrev, nextPage, prevPage } = paginationInfo;
    
    const buildUrl = (page) => {
      const params = new URLSearchParams({ ...queryParams, page });
      return `${baseUrl}?${params.toString()}`;
    };

    const links = {
      self: buildUrl(currentPage),
      first: buildUrl(1),
      last: buildUrl(totalPages)
    };

    if (hasPrev) {
      links.prev = buildUrl(prevPage);
    }

    if (hasNext) {
      links.next = buildUrl(nextPage);
    }

    return links;
  }

  /**
   * Cursor-based pagination for large datasets
   * @param {Object} query - Request query parameters
   * @param {string} sortField - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Object} Cursor pagination parameters
   */
  buildCursorPagination(query, sortField = 'createdAt', sortOrder = 'desc') {
    const limit = Math.min(this.maxLimit, Math.max(1, parseInt(query.limit) || this.defaultLimit));
    const cursor = query.cursor;
    const direction = query.direction || 'next'; // next or prev

    return {
      limit,
      cursor,
      direction,
      sortField,
      sortOrder: sortOrder === 'desc' ? -1 : 1
    };
  }

  /**
   * Build cursor-based query for MongoDB
   * @param {Object} cursorParams - Cursor pagination parameters
   * @param {Object} baseQuery - Base query object
   * @returns {Object} MongoDB query with cursor
   */
  buildCursorQuery(cursorParams, baseQuery = {}) {
    const { cursor, direction, sortField, sortOrder } = cursorParams;
    
    if (!cursor) {
      return baseQuery;
    }

    const cursorQuery = { ...baseQuery };
    
    if (direction === 'next') {
      cursorQuery[sortField] = sortOrder === -1 
        ? { $lt: cursor }
        : { $gt: cursor };
    } else {
      cursorQuery[sortField] = sortOrder === -1 
        ? { $gt: cursor }
        : { $lt: cursor };
    }

    return cursorQuery;
  }

  /**
   * Process cursor-based results
   * @param {Array} results - Query results
   * @param {Object} cursorParams - Cursor pagination parameters
   * @returns {Object} Processed results with cursor info
   */
  processCursorResults(results, cursorParams) {
    const { limit, sortField } = cursorParams;
    
    const hasNext = results.length > limit;
    const hasPrev = !!cursorParams.cursor;
    
    // Remove extra item if we have more results
    if (hasNext) {
      results.pop();
    }

    const nextCursor = results.length > 0 ? results[results.length - 1][sortField] : null;
    const prevCursor = results.length > 0 ? results[0][sortField] : null;

    return {
      data: results,
      pagination: {
        hasNext,
        hasPrev,
        nextCursor,
        prevCursor,
        limit
      }
    };
  }

  /**
   * Build pagination metadata for API response
   * @param {Object} paginationInfo - Pagination info
   * @param {string} baseUrl - Base URL
   * @param {Object} queryParams - Query parameters
   * @returns {Object} Complete pagination metadata
   */
  buildPaginationMetadata(paginationInfo, baseUrl, queryParams = {}) {
    const links = this.buildPaginationLinks(paginationInfo, baseUrl, queryParams);
    
    return {
      ...paginationInfo,
      links
    };
  }

  /**
   * Validate pagination parameters
   * @param {Object} query - Request query parameters
   * @returns {Object} Validation result
   */
  validatePagination(query) {
    const errors = [];
    
    if (query.page && (isNaN(query.page) || query.page < 1)) {
      errors.push('Page must be a positive integer');
    }
    
    if (query.limit && (isNaN(query.limit) || query.limit < 1 || query.limit > this.maxLimit)) {
      errors.push(`Limit must be between 1 and ${this.maxLimit}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Build pagination for aggregation pipeline
   * @param {Object} query - Request query parameters
   * @returns {Array} Aggregation pipeline stages
   */
  buildAggregationPagination(query) {
    const pagination = this.buildPagination(query);
    
    return [
      { $skip: pagination.skip },
      { $limit: pagination.limit + 1 } // Get one extra to check if there are more
    ];
  }

  /**
   * Process aggregation results with pagination
   * @param {Array} results - Aggregation results
   * @param {Object} pagination - Pagination parameters
   * @param {number} totalCount - Total count from separate query
   * @returns {Object} Processed results
   */
  processAggregationResults(results, pagination, totalCount) {
    const hasMore = results.length > pagination.limit;
    
    if (hasMore) {
      results.pop(); // Remove extra item
    }

    const paginationInfo = this.buildPaginationInfo(pagination, totalCount);
    
    return {
      data: results,
      pagination: {
        ...paginationInfo,
        hasMore
      }
    };
  }
}

module.exports = Pagination;
