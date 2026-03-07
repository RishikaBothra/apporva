export type AppError = {
  message: string;
  code: string;
  status: number;
};

export function createAppError(message: string, code: string, status: number): AppError {
  return { message, code, status };
}