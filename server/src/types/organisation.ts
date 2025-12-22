export interface OrganisationAttributes {
  id: number;
  uid: number;
  name: string;
  access_code: number;
  description: string | null;
  founded_at: Date;
  country: string | null;
  region: string | null;
  email: string;
  phone: string | null;
  status: string;
  date_of: Date;
  update_of: Date;
}


export type OrganisationCreationAttributes = Omit<OrganisationAttributes, 'id'>;