export interface User {
    name: string;
    email: string;
    phone: string;
    password: string;
    status?: string | 'true';      
}