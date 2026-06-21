import UserModel from "./user.model.js";
import MembershipModel from "../membership/membership.model.js";

// Associations for UserModel — extracted from the former models/index.ts

UserModel.hasMany(MembershipModel, {
    foreignKey: 'user_id',
    as: 'memberships',
});

export default UserModel;