// An expected failure raised by a service, such as a record that does not
// exist or a code that has expired. Controllers turn it into an HTTP response
// with this status; any other error is unexpected and becomes a 500.
export class ServiceError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export const isServiceError = (error: unknown): error is ServiceError => error instanceof ServiceError;
