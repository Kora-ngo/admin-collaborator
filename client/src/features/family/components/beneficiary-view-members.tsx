// src/features/family/components/beneficiary-view-members.tsx

import type { BeneficiaryMember } from "../../../types/beneficiary";
import { formatDate } from "../../../utils/formatDate";
import EmptyState from "../../../components/widgets/empty";

interface BeneficiaryViewMembersProps {
    members: BeneficiaryMember[];
}

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

    const getGenderIcon = (gender: string) => {
        if (gender === 'male') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            );
        } else if (gender === 'female') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
            );
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Family Members ({members.length})
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member, index) => (
                    <div 
                        key={member.id} 
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {getGenderIcon(member.gender)}
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        {index + 1}. {member.full_name}
                                    </p>
                                    <p className="text-sm text-gray-500 capitalize">
                                        {member.relationship}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-500">Gender</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {member.gender}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500">Age</p>
                                <p className="font-medium text-gray-900">
                                    {calculateAge(member.date_of_birth)} years
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500">Date of Birth</p>
                                <p className="font-medium text-gray-900">
                                    {formatDate(member.date_of_birth.toString(), false)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BeneficiaryViewMembers;