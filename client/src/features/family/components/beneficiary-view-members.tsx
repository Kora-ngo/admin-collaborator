// src/features/family/components/beneficiary-view-members.tsx

import type { BeneficiaryMember } from "../beneficiary";
import { formatDate } from "../../../utils/formatDate";
import EmptyState from "../../../components/ui/empty";

interface BeneficiaryViewMembersProps {
    members: BeneficiaryMember[];
}

const avatarStyles: Record<string, string> = {
    male: "bg-blue-50 text-blue-600",
    female: "bg-pink-50 text-pink-600",
};

const BeneficiaryViewMembers = ({ members }: BeneficiaryViewMembersProps) => {
    if (!members || members.length === 0) {
        return (
            <EmptyState
                title="No Family Members"
                description="No family members have been registered for this beneficiary."
            />
        );
    }

    const calculateAge = (dob: Date) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Family Members ({members.length})
            </h3>

            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {members.map((member) => {
                    const age = member.date_of_birth ? calculateAge(member.date_of_birth) : null;
                    const avatarStyle = avatarStyles[member.gender] || "bg-gray-100 text-gray-600";

                    return (
                        <div
                            key={member.id}
                            className="flex items-center gap-4 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${avatarStyle}`}>
                                {member.full_name.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {member.full_name}
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                    {member.relationship} · {member.gender}
                                </p>
                            </div>

                            {member.date_of_birth && (
                                <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-medium text-gray-700">{age} yrs</p>
                                    <p className="text-xs text-gray-400">
                                        {formatDate(member.date_of_birth.toString(), false, false)}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BeneficiaryViewMembers;