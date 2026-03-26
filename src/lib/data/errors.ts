export class DataLayerError extends Error {
  code?: string;
  cause?: unknown;
  context?: string;

  constructor(message: string, options?: { code?: string; cause?: unknown; context?: string }) {
    super(message);
    this.name = 'DataLayerError';
    this.code = options?.code;
    this.cause = options?.cause;
    this.context = options?.context;
  }
}

export function toDataLayerError(error: unknown, fallback: string, context?: string) {
  if (error instanceof DataLayerError) {
    return error;
  }

  if (error instanceof Error) {
    return new DataLayerError(error.message || fallback, {
      cause: error,
      context,
    });
  }

  return new DataLayerError(fallback, { cause: error, context });
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
