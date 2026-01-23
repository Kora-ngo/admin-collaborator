export interface OrganisationAttributes {
    id: number;
    uid: number;
    name: string;
    description: string | null;
    country: string | null;
    region: string | null;
    email: string;
    phone: string | null;
    created_by: number;
    status: string;
    date_of?: Date;
    update_of?: Date;
}
export type OrganisationCreationAttributes = Omit<OrganisationAttributes, 'id'>;
//# sourceMappingURL=organisation.d.ts.map