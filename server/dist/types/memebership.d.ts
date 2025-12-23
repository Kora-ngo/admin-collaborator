export interface MembershipAttributes {
    id: number;
    user_id: number;
    organization_id: number;
    role: string;
    status: string;
    date_of?: Date;
}
export type MembershipCreationAttributes = Omit<MembershipAttributes, 'id'>;
//# sourceMappingURL=memebership.d.ts.map