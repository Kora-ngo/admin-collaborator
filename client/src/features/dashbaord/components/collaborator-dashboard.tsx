// src/pages/general/collaborator-dashboard.tsx

import { useEffect, useState } from "react";
import { useDashboardStore } from "../store/dashbaordStore";
import Loading from "../../../components/widgets/loading";
import type { TableColumn } from "../../../components/widgets/table";
import { formatDate } from "../../../utils/formatDate";
import Table from "../../../components/widgets/table";

const CollaboratorDashboard = () => {
    const {
        collaboratorMetrics,
        enumeratorActivity,
        validationQueue,
        loading,
        getCollaboratorMetrics,
        getEnumeratorActivity,
        getValidationQueue
    } = useDashboardStore();

    const [activeTab, setActiveTab] = useState<'beneficiaries' | 'deliveries'>('beneficiaries');

    useEffect(() => {
        getCollaboratorMetrics();
        getEnumeratorActivity();
        getValidationQueue();
    }, [getCollaboratorMetrics, getEnumeratorActivity, getValidationQueue]);

    if (loading && !collaboratorMetrics) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading text="Loading dashboard..." />
            </div>
        );
    }

    // Enumerator Activity Table
    const enumeratorColumns: (TableColumn | null)[] = [
        {
            key: "name",
            label: "Enumerator",
            visibleOn: "always",
            render: (row) => (
                <div>
                    <p className="font-medium">{row.name}</p>
                    <p className="text-xs text-gray-500">{row.email}</p>
                </div>
            )
        },
        { key: "familiesRegistered", label: "Families", visibleOn: "sm" },
        { key: "deliveriesLogged", label: "Deliveries", visibleOn: "sm" },
        {
            key: "lastSyncDate",
            label: "Last Sync",
            visibleOn: "md",
            render: (row) => row.lastSyncDate 
                ? formatDate(row.lastSyncDate, true) 
                : <span className="text-gray-400">Never</span>
        }
    ];

    // Beneficiary Queue Table
    const beneficiaryColumns: (TableColumn | null)[] = [
        { key: "family_code", label: "Family Code", visibleOn: "always" },
        { key: "head_name", label: "Head of Family", visibleOn: "always" },
        {
            key: "project",
            label: "Project",
            visibleOn: "md",
            render: (row) => row.project?.name || "-"
        },
        {
            key: "createdBy",
            label: "Created By",
            visibleOn: "lg",
            render: (row) => row.createdBy?.user?.name || "-"
        },
        {
            key: "created_at",
            label: "Submitted",
            visibleOn: "lg",
            render: (row) => formatDate(row.created_at, false)
        }
    ];

    // Delivery Queue Table
    const deliveryColumns: (TableColumn | null)[] = [
        {
            key: "uid",
            label: "Delivery ID",
            visibleOn: "always",
            render: (row) => `#${row.uid}`
        },
        {
            key: "beneficiary",
            label: "Beneficiary",
            visibleOn: "always",
            render: (row) => row.beneficiary?.head_name || "-"
        },
        {
            key: "project",
            label: "Project",
            visibleOn: "md",
            render: (row) => row.project?.name || "-"
        },
        {
            key: "delivery_date",
            label: "Delivery Date",
            visibleOn: "lg",
            render: (row) => formatDate(row.delivery_date, false)
        },
        {
            key: "createdBy",
            label: "Enumerator",
            visibleOn: "lg",
            render: (row) => row.createdBy?.user?.name || "-"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <p className="text-sm text-gray-600">Overview of your assigned projects and validations</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Assigned Projects */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Assigned Projects</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {collaboratorMetrics?.assignedProjects || 0}
                            </p>
                        </div>
                        <div className="bg-primary rounded-full p-3">
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Families in Projects */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Families in Projects</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {collaboratorMetrics?.familiesInProjects || 0}
                            </p>
                        </div>
                        <div className="bg-primary rounded-full p-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Beneficiaries */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Pending Beneficiaries</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {collaboratorMetrics?.pendingBeneficiaries || 0}
                            </p>
                        </div>
                        <div className="bg-gray-300 rounded-full p-3">
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Pending Deliveries */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Pending Deliveries</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {collaboratorMetrics?.pendingDeliveries || 0}
                            </p>
                        </div>
                        <div className="bg-gray-300 rounded-full p-3">
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enumerator Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Enumerator Activity</h2>
                {enumeratorActivity.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No enumerators assigned to your projects</p>
                ) : (
                    <Table columns={enumeratorColumns} data={enumeratorActivity} />
                )}
            </div>

            {/* Validation Queue */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Validation Queue</h2>
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        onClick={() => setActiveTab('beneficiaries')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'beneficiaries'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Beneficiaries ({validationQueue?.pendingBeneficiaries?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('deliveries')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'deliveries'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Deliveries ({validationQueue?.pendingDeliveries?.length || 0})
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'beneficiaries' ? (
                    validationQueue?.pendingBeneficiaries?.length > 0 ? (
                        <Table columns={beneficiaryColumns} data={validationQueue.pendingBeneficiaries} />
                    ) : (
                        <p className="text-gray-500 text-center py-8">No pending beneficiaries</p>
                    )
                ) : (
                    validationQueue?.pendingDeliveries?.length > 0 ? (
                        <Table columns={deliveryColumns} data={validationQueue.pendingDeliveries} />
                    ) : (
                        <p className="text-gray-500 text-center py-8">No pending deliveries</p>
                    )
                )}
            </div>
        </div>
    );
};

export default CollaboratorDashboard;