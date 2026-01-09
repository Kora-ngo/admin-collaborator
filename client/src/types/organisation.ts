export interface Organisation {
    id: number;
    uid: number;
    country: string;
    region?: string;
    email: string;
    phone: string;  
    name: string;
    description?: string;
}