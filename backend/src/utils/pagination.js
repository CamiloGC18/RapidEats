/**
 * Cursor-based pagination helper
 * Más eficiente que offset-based para grandes datasets
 */

/**
 * Crear cursor desde documento
 * @param {Object} doc - Documento de Mongoose
 * @param {String} sortField - Campo usado para sorting
 * @returns {String} - Cursor codificado
 */
const createCursor = (doc, sortField = 'createdAt') => {
  const cursorData = {
    id: doc._id.toString(),
    value: doc[sortField]
  };
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
};

/**
 * Decodificar cursor
 * @param {String} cursor - Cursor codificado
 * @returns {Object} - {id, value}
 */
const decodeCursor = (cursor) => {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    throw new Error('Invalid cursor');
  }
};

/**
 * Cursor-based pagination
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Pagination options
 * @returns {Object} - {data, pageInfo}
 */
const cursorPaginate = async (Model, options = {}) => {
  const {
    cursor, // Cursor para siguiente página
    limit = 10,
    sortField = 'createdAt',
    sortOrder = 'desc',
    filter = {},
    populate = null
  } = options;

  const maxLimit = 100;
  const effectiveLimit = Math.min(limit, maxLimit);

  // Build query
  let query = { ...filter };

  // Si hay cursor, agregar condición
  if (cursor) {
    const { id, value } = decodeCursor(cursor);
    
    if (sortOrder === 'desc') {
      query.$or = [
        { [sortField]: { $lt: value } },
        { [sortField]: value, _id: { $lt: id } }
      ];
    } else {
      query.$or = [
        { [sortField]: { $gt: value } },
        { [sortField]: value, _id: { $gt: id } }
      ];
    }
  }

  // Ejecutar query con +1 item para saber si hay más
  let queryBuilder = Model.find(query)
    .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1, _id: sortOrder === 'desc' ? -1 : 1 })
    .limit(effectiveLimit + 1);

  if (populate) {
    queryBuilder = queryBuilder.populate(populate);
  }

  const results = await queryBuilder;

  // Determinar si hay más páginas
  const hasMore = results.length > effectiveLimit;
  const data = hasMore ? results.slice(0, effectiveLimit) : results;

  // Crear cursors
  const pageInfo = {
    hasNextPage: hasMore,
    nextCursor: hasMore ? createCursor(data[data.length - 1], sortField) : null,
    count: data.length
  };

  return { data, pageInfo };
};

/**
 * Offset-based pagination tradicional (para compatibilidad)
 * @param {Model} Model - Mongoose model
 * @param {Object} options - Pagination options
 * @returns {Object} - {data, pagination}
 */
const offsetPaginate = async (Model, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    filter = {},
    populate = null,
    select = null
  } = options;

  const maxLimit = 100;
  const effectiveLimit = Math.min(limit, maxLimit);
  const skip = (page - 1) * effectiveLimit;

  // Ejecutar query y count en paralelo
  const [data, totalCount] = await Promise.all([
    Model.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(effectiveLimit)
      .populate(populate || '')
      .select(select || '')
      .lean(),
    Model.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalCount / effectiveLimit);

  const pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    limit: effectiveLimit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };

  return { data, pagination };
};

/**
 * Helper para agregar filtros de búsqueda
 * @param {String} searchTerm - Término de búsqueda
 * @param {Array} fields - Campos donde buscar
 * @returns {Object} - MongoDB query
 */
const buildSearchQuery = (searchTerm, fields = []) => {
  if (!searchTerm || fields.length === 0) {
    return {};
  }

  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Helper para búsqueda geoespacial
 * @param {Number} lat - Latitud
 * @param {Number} lng - Longitud
 * @param {Number} radius - Radio en kilómetros
 * @returns {Object} - MongoDB geoNear query
 */
const buildGeoQuery = (lat, lng, radius = 10) => {
  return {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius * 1000 // convertir a metros
      }
    }
  };
};

/**
 * Helper para filtros de rango
 * @param {String} field - Campo
 * @param {Number} min - Valor mínimo
 * @param {Number} max - Valor máximo
 * @returns {Object} - MongoDB range query
 */
const buildRangeQuery = (field, min, max) => {
  const query = {};
  if (min !== undefined) query[field] = { $gte: min };
  if (max !== undefined) {
    query[field] = query[field] || {};
    query[field].$lte = max;
  }
  return query;
};

/**
 * Helper para combinar múltiples filtros
 * @param {Array} filters - Array de objetos de filtro
 * @returns {Object} - MongoDB combined query
 */
const combineFilters = (...filters) => {
  return filters.reduce((acc, filter) => {
    return { ...acc, ...filter };
  }, {});
};

module.exports = {
  cursorPaginate,
  offsetPaginate,
  createCursor,
  decodeCursor,
  buildSearchQuery,
  buildGeoQuery,
  buildRangeQuery,
  combineFilters
};
