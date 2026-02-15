import { useEffect } from "react";
import { useDashboardStore } from "../store/dashbaordStore";
import Loading from "../../../components/widgets/loading";
import type { TableColumn } from "../../../components/widgets/table";
import Table from "../../../components/widgets/table";
import Accordion from "../../../components/widgets/accordion";
import fileImg from "../../../assets/icons/file.png";
import alertImg from "../../../assets/icons/urgent_message.png";


const AdminDashbaord = () => {
    const { keyMetrics, projectProgress, projectAlert, loading, getKeyMetrics, getProjectProgress, getProjectAlert } = useDashboardStore();

    useEffect(() => {
        getKeyMetrics();
        getProjectProgress();
        getProjectAlert();
        console.log("Data --> ", projectAlert);
    }, [getKeyMetrics, getProjectProgress, getProjectAlert]);

    if (loading && !keyMetrics) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loading text="Loading dashboard..." />
            </div>
        );
    }

    const projectColumns: (TableColumn | null)[] = [
        { key: "name", label: "Project Name", visibleOn: "always" },
        { key: "familiesRegistered", label: "Beneficaries", visibleOn: "always" },
        { key: "deliveriesCompleted", label: "Beneficaries", visibleOn: "always" },
        { key: "daysLeft", label: "Days Lefts", visibleOn: "sm", render: (row) => 
             {
                return  <>
                 
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.daysLeft <= 7 
                ? 'bg-red-100 text-red-800'
                : row.daysLeft <= 30
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}>
            {row.daysLeft == 0 ? "Overude" : row.daysLeft} {row.daysLeft === 1 ? 'day' : row.daysLeft === 0 ? "" : 'days'}
            </span>
                </>
             }},

    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="">
                    {/* <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1> */}
                    <p className="text-sm text-gray-600 mt-1">Overview of your organization's activities</p>
                </div>
                {/* <div className="w-36">
                            <SelectInput
                                options={[
                                    { label: "Today", value: "" },
                                    { label: "This Week", value: "pending" },
                                    { label: "This Month", value: "approved" },
                                ]}                              
                                onChange={(e) => {}}
                            />
                </div> */}
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Projects */}
                <div className="bg-gray-100 rounded-lg  p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Active Projects</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {keyMetrics?.activeProjects || 0}
                            </p>
                        </div>
                        <div className="bg-primary rounded-full p-3">
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Families */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Total Families</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {keyMetrics?.totalFamilies || 0}
                            </p>
                        </div>
                        <div className="bg-primary rounded-full p-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Deliveries */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Total Deliveries</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {keyMetrics?.totalDeliveries || 0}
                            </p>
                        </div>
                        <div className="bg-primary rounded-full p-3">
                            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active Field Users */}
                <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Active Field Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {keyMetrics?.activeFieldUsers || 0}
                            </p>
                        </div>
                        <div className="bg-primary rounded-full p-3">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-x-4 md:flex-row h-[calc(100vh-var(--header-height))] w-full  ">
                { projectProgress.length === 0 ?
                    (
                    <div className="flex justify-center items-center w-full md:w-[60%] min-h-[40vh] bg-muted/40">
                        <div className="text-center">
                            <img src={fileImg} alt="No projects" className="size-16 mx-auto" />
                            <p className="text-lg text-primary font-bold">No Project Progress</p>
                            <p className="text-sm text-gray-400">For now no project has been created</p>
                        </div>
                    </div>
                    ) :
                    (
                        <div className="w-full md:w-[60%] p-0 overflow-auto">
                            <Table columns={projectColumns} data={projectProgress} className="" />
                        </div>
                    )
                }

                {
                    projectAlert?.alerts.length === 0 ?
                    (

                    <div className="flex justify-center items-center w-full md:w-[40%] min-h-[40vh] p-2 overflow-auto space-y-2 bg-muted/40 rounded-sm">
                        <div className="text-center">
                            <img src={alertImg} alt="No projects" className="size-16 mx-auto" />
                            <p className="text-lg text-primary font-bold">No Alerts Found</p>
                            <p className="text-sm text-gray-400">This sections address quick descion making for better productivity</p>
                        </div>
                    </div>
                    ) :
                    (
                        <div className="w-full md:w-[40%] p-2 overflow-auto space-y-2 border border-gray-300 rounded-sm">
                            <p className="text-lg font-bold mb-4">Alerts</p>
                            {
                                projectAlert?.alerts.map((projects: any) => (
                                    <Accordion 
                                        items={[
                                            {
                                                title: projects.title,
                                                subtitle: projects.message,
                                                iconTitleLeading: (
                                                    <>
                                                    {projects.type === "warning" ?
                                                    (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-amber-300">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                                    </svg>
                                                    ) : projects.type === "pending" ?
                                                    (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-gray-500">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                    ) :
                                                    (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-600">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                    )
                                                    }
                                                    </>
                                                ),

                                                subTiles: projects?.items?.map((item: any) => ({
                                                        content: (
                                                            <div className="flex text-sm text-gray-600">
                                                                <p className="text-black text-md font-semibold">Record Info: {item.name || item.family_code || "Unknown"}</p>
                                                            </div>
                                                        ),
                                                }))
                                            }
                                        ]}
                                    />
                                ))
                            }
                        </div>
                    )
                }
            </div>

        </div>
    );
};

export default AdminDashbaord;