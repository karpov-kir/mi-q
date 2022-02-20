export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);

    // To make `instanceOf NotFoundError` work
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
