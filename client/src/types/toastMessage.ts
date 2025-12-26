export type ToastMessage<T = any> = {
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    show?: boolean,
    autoClose?: number | false;
    data?: T;
}