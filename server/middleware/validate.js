/**
 * Middleware factory to validate request body, query, or params against a Zod schema
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
