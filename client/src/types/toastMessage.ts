export type ToastMessage<T = any> = {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    show?: boolean,
    data?: T;
}