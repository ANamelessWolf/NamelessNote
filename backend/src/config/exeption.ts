/**
 * Represents an exception with an associated HTTP status code.
 */
export class Exception extends Error {
  /**
   * The HTTP status code associated with the exception.
   */
  statusCode: number;
  /**
   * A detailed message describing the exception.
   */
  detail: string;

  /**
   * Creates a new instance of the Exception class.
   * @param message A description of the exception.
   * @param error The executed error.
   * @param statusCode The HTTP status code associated with the exception.
   */
  constructor(message: string, statusCode: number, error: any) {
    super(message);
    this.statusCode = statusCode;
    this.detail = error?.message || error?.toString() || "Unknown error";
    Error.captureStackTrace(this, this.constructor);
    console.error(this);
    console.error(error);
  }
}
