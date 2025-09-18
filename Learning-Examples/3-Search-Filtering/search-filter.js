/**
 * Advanced search and filtering utilities
 * Supports text search, range filtering, sorting, and pagination
 */

class SearchFilter {
  constructor() {
    this.operators = {
      eq: (field, value) => ({ [field]: value }),
      ne: (field, value) => ({ [field]: { $ne: value } }),
      gt: (field, value) => ({ [field]: { $gt: value } }),
      gte: (field, value) => ({ [field]: { $gte: value } }),
      lt: (field, value) => ({ [field]: { $lt: value } }),
      lte: (field, value) => ({ [field]: { $lte: value } }),
      in: (field, value) => ({ [field]: { $in: value } }),
      nin: (field, value) => ({ [field]: { $nin: value } }),
      regex: (field, value) => ({ [field]: { $regex: value, $options: 'i' } }),
      exists: (field, value) => ({ [field]: { $exists: value } })
    };
  }

  /**
   * Build MongoDB query from search parameters
   * @param {Object} params - Search parameters
   * @param {Object} options - Search options
   * @returns {Object} MongoDB query object
   */
  buildQuery(params, options = {}) {
    const query = {};
    const {
      searchFields = [],
      filterFields = {},
      dateFields = {},
      rangeFields = {},
      booleanFields = []
    } = options;

    // Text search across multiple fields
    if (params.search && searchFields.length > 0) {
      query.$or = searchFields.map(field => ({
        [field]: { $regex: params.search, $options: 'i' }
      }));
    }

    // Exact match filters
    Object.keys(filterFields).forEach(field => {
      if (params[field]) {
        const operator = filterFields[field].operator || 'eq';
        const value = this.parseValue(params[field], filterFields[field].type);
        Object.assign(query, this.operators[operator](field, value));
      }
    });

    // Date range filters
    Object.keys(dateFields).forEach(field => {
      if (params[`${field}_from`] || params[`${field}_to`]) {
        query[field] = {};
        if (params[`${field}_from`]) {
          query[field].$gte = new Date(params[`${field}_from`]);
        }
        if (params[`${field}_to`]) {
          query[field].$lte = new Date(params[`${field}_to`]);
        }
      }
    });

    // Numeric range filters
    Object.keys(rangeFields).forEach(field => {
      if (params[`${field}_min`] || params[`${field}_max`]) {
        query[field] = {};
        if (params[`${field}_min`]) {
          query[field].$gte = Number(params[`${field}_min`]);
        }
        if (params[`${field}_max`]) {
          query[field].$lte = Number(params[`${field}_max`]);
        }
      }
    });

    // Boolean filters
    booleanFields.forEach(field => {
      if (params[field] !== undefined) {
        query[field] = params[field] === 'true';
      }
    });

    return query;
  }

  /**
   * Build sort object from sort parameters
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @returns {Object} MongoDB sort object
   */
  buildSort(sortBy, sortOrder = 'desc') {
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    return sort;
  }

  /**
   * Build pagination parameters
   * @param {Object} params - Request parameters
   * @returns {Object} Pagination object
   */
  buildPagination(params) {
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Parse value based on type
   * @param {*} value - Value to parse
   * @param {string} type - Expected type
   * @returns {*} Parsed value
   */
  parseValue(value, type = 'string') {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true';
      case 'date':
        return new Date(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      default:
        return value;
    }
  }

  /**
   * Build aggregation pipeline for advanced search
   * @param {Object} params - Search parameters
   * @param {Object} options - Search options
   * @returns {Array} MongoDB aggregation pipeline
   */
  buildAggregationPipeline(params, options = {}) {
    const pipeline = [];

    // Match stage
    const matchQuery = this.buildQuery(params, options);
    if (Object.keys(matchQuery).length > 0) {
      pipeline.push({ $match: matchQuery });
    }

    // Add lookup stages for populated fields
    if (options.populate) {
      options.populate.forEach(pop => {
        pipeline.push({
          $lookup: {
            from: pop.collection,
            localField: pop.localField,
            foreignField: pop.foreignField,
            as: pop.as
          }
        });
      });
    }

    // Add computed fields
    if (options.computedFields) {
      pipeline.push({
        $addFields: options.computedFields
      });
    }

    // Sort stage
    const sort = this.buildSort(params.sortBy, params.sortOrder);
    if (Object.keys(sort).length > 0) {
      pipeline.push({ $sort: sort });
    }

    // Facet stage for pagination and total count
    const { limit, skip } = this.buildPagination(params);
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }]
      }
    });

    return pipeline;
  }

  /**
   * Process search results and add pagination info
   * @param {Array} results - Aggregation results
   * @param {Object} pagination - Pagination parameters
   * @returns {Object} Processed results with pagination info
   */
  processResults(results, pagination) {
    const data = results[0]?.data || [];
    const totalCount = results[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pagination.limit);

    return {
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages,
        totalCount,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
        limit: pagination.limit
      }
    };
  }
}

module.exports = SearchFilter;
