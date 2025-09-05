/**
 * HttpResponse constructor parameters.
 */
export type HttpResponseProps = {
  /**
   * Request response data if succesful otherwise error
   * stack trace
   */
  data?: any;
  /**
   * Request response error status code
   */
  errorCode?: number;
  /**
   * Request response message
   */
  message?: string;
  /**
   * Indicates whether the request was successful.
   */
  success?: boolean;
  /**
   * Request response backend error message
   */
  error?: string;
};

/**
 * Represents an HTTP response with optional data, error code, and message.
 * @typeparam T The type of data contained in the response.
 */
export class HttpResponse {
  /**
   * The data contained in the response.
   */
  data?: any;

  /**
   * The error code associated with the response.
   */
  statusCode?: number;

  /**
   * A descriptive message associated with the response.
   */
  message?: string;

  /**
   * Indicates whether the response was successful.
   */
  success?: boolean;

  /**
   * Creates a new instance of the HttpResponse class.
   * @param params An object containing properties for initializing the response.
   */
  constructor({ success, data, errorCode, message }: HttpResponseProps) {
    this.data = data;
    this.statusCode = success ? 200 : errorCode;
    this.message = message;
    this.success = success;
  }
}

/**
 * Represents an HTTP response with optional data, error code, and message.
 * @typeparam T The type of data contained in the response.
 */
export class HttpErrorResponse {
  /**
   * The data contained in the response.
   */
  data?: any;

  /**
   * The error code associated with the response.
   *
   */
  statusCode?: number;

  /**
   * A descriptive message associated with the response.
   */
  message?: string;

  /**
   * An error message associated with the response.
   */
  error?: string;

  /**
   * Indicates whether the response was successful.
   */
  success?: boolean;

  /**
   * Creates a new instance of the HttpResponse class.
   * @param params An object containing properties for initializing the response.
   */
  constructor({ success, data, errorCode, message, error }: HttpResponseProps) {
    this.data = data;
    this.statusCode = success ? 200 : errorCode;
    this.message = message;
    this.error = error;
    this.success = success;
  }
}
