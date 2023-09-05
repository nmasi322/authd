class CustomError extends Error {
  status;
  /**
   * Create custom error
   *
   * @param {*} message Error message for request response
   * @param {number} statusCode HTTP status code. Default is 400
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.status = statusCode;
  }
}

export default CustomError;
