export interface UserAttributes {
    id: number;
    uid: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    status: string;
    date_of?: Date;
    update_of?: Date;
}
export type UserCreationAttributes = Omit<UserAttributes, 'id'> & {
    id?: number;
};
//# sourceMappingURL=user.d.ts.map