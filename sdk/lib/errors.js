'use strict';

class CustomError extends Error {

  constructor(message, status) {
    super(message);

    Error.captureStackTrace(this, this.constructor);
    this.headers = {};
    this.message = message || 'Server error';
    this.status = status || 500;
  }

  get name() {
    return this.constructor.name;
  }

}

class UnauthorizedError extends CustomError {
  constructor(message) { super(message || 'Unauthorized', 401); }
}

class BadRequestError extends CustomError {
  constructor(message) { super(message || 'Bad request', 400) }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
};
