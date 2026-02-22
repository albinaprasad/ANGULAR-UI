export enum SnackbarType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export interface SnackbarData {
    id: number;
    message: string;
    type: SnackbarType;
    duration: number;
}