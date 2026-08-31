/**
 * Request Payload Validation Middleware for Montage Auto Studio.
 * Uses Zod schemas to validate incoming request body, query parameters, and URL parameters before route handlers process them.
 */

/**
 * Higher-order middleware factory function.
 * Accepts a Zod schema, validates req.body, req.query, and req.params,
 * and attaches normalized validated data to req.validated.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    req.validated = validatedData;
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failure',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(400).json({
      status: 'error',
      message: 'Invalid request payload format.'
    });
  }
};

module.exports = validate;

