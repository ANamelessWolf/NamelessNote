export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    REQUEST_TIMEOUT: 407,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
  };
  
  export const ISO_FORMAT = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
  export const US_FORMAT = /^\d{2}\/\d{2}\/\d{4}$/; // MM/DD/YYYY
  export const EU_FORMAT = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY
  
  export const DATE_FORMAT = ISO_FORMAT;
  
  export const PAGINATION_SIZE = 10;