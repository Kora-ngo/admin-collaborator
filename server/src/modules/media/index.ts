import Media from "./media.model.js";
import OrganisationModel from "../organisation/organisation.model.js";
import MembershipModel from "../membership/membership.model.js";
import MediaLink from "../media-link/media-link.model.js";

// Associations for Media — extracted from the former models/index.ts

// MEDIA -- MEDIA_LINK  ------------------------->

// Media → Organisation
Media.belongsTo(OrganisationModel, {
    foreignKey: 'organisation_id',
    as: 'organization'
});

// Media → Uploader (Membership)
Media.belongsTo(MembershipModel, {
    foreignKey: 'uploaded_by_membership_id',
    as: 'uploader'
});

Media.hasMany(MediaLink, {
    foreignKey: 'media_id',
    as: 'links'
});

export default Media;