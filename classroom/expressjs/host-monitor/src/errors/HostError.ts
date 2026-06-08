export class HostError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HostError';
  }
}

export class HostNotFoundError extends HostError {
  constructor(message: string) {
    super(message);
    this.name = 'HostNotFoundError';
  }
}

export class InvalidHostError extends HostError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidHostError';
  }
}
