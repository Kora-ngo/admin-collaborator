import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { SelectInput } from "../../components/ui/select-input";
import { Button } from "../../components/ui/button";
import StatusBadge from "../../components/ui/status-badge";
import Loading from "../../components/ui/loading";
import EmptyState from "../../components/ui/empty";
import { useThemeColor } from "../../features/analytics/hooks/useThemecolor";
import { useAnalytics } from "../../features/analytics/hooks/useanAlytics";
import type { BadgeColor } from "../../types/badgeColor";
import { useState } from "react";

// Only used for the second slice of the gender donut, where a single hue
// can't visually distinguish two categories — everything else is primary.
const MUTED = "#9ca3af"; // gray-400

const statusColors: Record<string, { text: string; color: string }> = {
    pending: { text: "Pending", color: "gray" },
    ongoing: { text: "Ongoing", color: "blue" },
    overdue: { text: "Overdue", color: "red" },
    done: { text: "Done", color: "purple" },
    suspended: { text: "Suspended", color: "orange" },
};

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

// ── Reusable chart wrappers — each takes `color` as a prop, resolved once
// at the page level via useThemeColor ──────────────────────────────

const SectionHeader = ({ title }: { title: string }) => (
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
);

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white border border-gray-100 rounded-xl p-5 ${className}`}>{children}</div>
);

const TrendChart = ({
    data, height = 220, color,
}: { data: { label: string; value: number }[]; height?: number; color: string }) => (
    <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
                    labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#trendFill)" />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const ColumnChart = ({
    data, height = 220, color,
}: { data: { label: string; value: number }[]; height?: number; color: string }) => (
    <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
                    labelStyle={{ fontWeight: 600 }}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const HorizontalBarChart = ({
    data, height, color,
}: { data: { label: string; value: number }[]; height?: number; color: string }) => (
    <div style={{ width: "100%", height: height ?? data.length * 44 + 16 }}>
        <ResponsiveContainer>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="label"
                    width={100}
                    tick={{ fontSize: 12, fill: "#4b5563" }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
        </ResponsiveContainer>
    </div>
);

const GenderDonut = ({
    data, color,
}: { data: { label: string; value: number }[]; color: string }) => (
    <div className="flex items-center gap-6">
        <div style={{ width: 140, height: 140 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="label" innerRadius={42} outerRadius={62} paddingAngle={2}>
                        {data.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? color : MUTED} />
                        ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #f3f4f6" }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="space-y-2">
            {data.map((d, i) => (
                <div key={d.label} className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full flex-shrink-0" style={{ background: i === 0 ? color : MUTED }} />
                    <span className="text-xs font-medium text-gray-600">{d.label}</span>
                    <span className="text-xs font-semibold text-gray-800">{d.value}%</span>
                </div>
            ))}
        </div>
    </div>
);

// ── Page ─────────────────────────────────────────────────────────

type Tab = "overview" | "projects" | "beneficiaries" | "assistance" | "data-quality";

const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "projects", label: "Projects" },
    { key: "beneficiaries", label: "Beneficiaries" },
    { key: "assistance", label: "Assistance" },
    { key: "data-quality", label: "Data Quality" },
];

const ProjectTable = ({ rows }: { rows: { id: number; name: string; beneficiaries: number; deliveries: number; progress: number; status: string }[] }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-gray-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Project</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Beneficiaries</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Deliveries</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {rows.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="px-5 py-3 text-gray-600">{p.beneficiaries.toLocaleString()}</td>
                        <td className="px-5 py-3 text-gray-600">{p.deliveries.toLocaleString()}</td>
                        <td className="px-5 py-3">
                            <div className="flex items-center gap-2 w-32">
                                <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${p.progress}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-gray-500 w-8 text-right">{p.progress}%</span>
                            </div>
                        </td>
                        <td className="px-5 py-3">
                            <StatusBadge
                                text={statusColors[p.status]?.text || p.status}
                                color={(statusColors[p.status]?.color || "gray") as BadgeColor}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Analytics = () => {
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    const {
        data, loading,
        filterOptions, loadingFilters,
        project, setProject,
        period, setPeriod,
        region, setRegion,
    } = useAnalytics();

    // Resolved once from the DOM (see useThemeColor) so every chart below
    // stays on-theme without hardcoding a hex value.
    const primary = useThemeColor("text-primary", "#4f46e5");

    // First load, nothing to show yet at all.
    if (loading && !data) {
        return (
            <div className="flex justify-center w-full mt-20">
                <Loading text="Loading analytics..." />
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const isEmpty =
        data.kpis.active_projects.value === 0 &&
        data.project_performance.length === 0 &&
        data.beneficiaries_over_time.length === 0 &&
        data.data_quality.total === 0;

    const kpis = [
        {
            label: "Beneficiaries Reached",
            value: data.kpis.beneficiaries_reached.value.toLocaleString(),
            trend: `${signed(data.kpis.beneficiaries_reached.trend_percent)}% ${data.kpis.beneficiaries_reached.trend_label}`,
        },
        {
            label: "Assistance Deliveries",
            value: data.kpis.assistance_deliveries.value.toLocaleString(),
            trend: `${signed(data.kpis.assistance_deliveries.trend_percent)}% ${data.kpis.assistance_deliveries.trend_label}`,
        },
        {
            label: "Active Projects",
            value: data.kpis.active_projects.value.toString(),
            trend: data.kpis.active_projects.attention_needed > 0
                ? `${data.kpis.active_projects.attention_needed} need attention`
                : "All on track",
        },
        {
            label: "Validation Rate",
            value: `${data.kpis.validation_rate.value}%`,
            trend: `${signed(data.kpis.validation_rate.trend_points)}pts ${data.kpis.validation_rate.trend_label}`,
        },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-56">
                    <SelectInput
                        options={[
                            { label: "All Projects", value: "all" },
                            ...(filterOptions?.projects || []),
                        ]}
                        value={project}
                        disabled={loadingFilters}
                        onChange={(e) => setProject(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <SelectInput
                        options={[
                            { label: "Today", value: "today" },
                            { label: "Last 7 Days", value: "last_7_days" },
                            { label: "Last 30 Days", value: "last_30_days" },
                            { label: "Last 3 Months", value: "last_3_months" },
                            { label: "This Year", value: "this_year" },
                        ]}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <SelectInput
                        options={[
                            { label: "All Regions", value: "all" },
                            ...(filterOptions?.regions || []),
                        ]}
                        value={region}
                        disabled={loadingFilters}
                        onChange={(e) => setRegion(e.target.value)}
                    />
                </div>
                {loading && (
                    <span className="text-xs text-gray-400">Updating…</span>
                )}
            </div>

            {isEmpty ? (
                <div className="bg-gray-50 rounded-xl">
                    <EmptyState title="No analytics data yet for this selection" />
                </div>
            ) : (
                <>
                    {/* ── Key indicators ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {kpis.map((kpi) => (
                            <Card key={kpi.label} className="bg-primary/5 border-primary/10">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1.5">{kpi.value}</p>
                                <p className="text-xs text-primary font-medium mt-1.5">{kpi.trend}</p>
                            </Card>
                        ))}
                    </div>

                    {/* ── Tab bar ── */}
                    <div className="flex gap-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? "text-primary border-primary"
                                        : "text-gray-500 border-transparent hover:text-gray-700"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Overview ── */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <Card>
                                <p className="text-sm font-semibold text-gray-700 mb-4">Beneficiaries Over Time</p>
                                <TrendChart data={data.beneficiaries_over_time} height={180} color={primary} />
                            </Card>

                            <div>
                                <SectionHeader title="Project Performance" />
                                <Card className="p-0 overflow-hidden">
                                    <ProjectTable rows={data.project_performance.slice(0, 3)} />
                                    <div className="flex justify-end border-t border-gray-100 py-3">
                                        <Button variant="link" onClick={() => setActiveTab("projects")}>
                                            View all projects
                                        </Button>
                                    </div>
                                </Card>
                            </div>

                            <div>
                                <SectionHeader title="Operational Overview" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Card>
                                        <p className="text-sm font-semibold text-gray-700 mb-4">Active Projects by Region</p>
                                        <HorizontalBarChart data={data.operational_coverage} color={primary} />
                                    </Card>
                                    <Card className="bg-primary/5 border-primary/10 flex flex-col justify-center items-center text-center">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data Quality</p>
                                        <p className="text-4xl font-bold text-primary mt-2">{data.data_quality.validation_rate}%</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {data.data_quality.validated.toLocaleString()} of {data.data_quality.total.toLocaleString()} records validated
                                        </p>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Projects ── */}
                    {activeTab === "projects" && (
                        <div>
                            <SectionHeader title="Project Performance" />
                            <Card className="p-0 overflow-hidden">
                                <ProjectTable rows={data.project_performance} />
                            </Card>
                        </div>
                    )}

                    {/* ── Beneficiaries ── */}
                    {activeTab === "beneficiaries" && (
                        <div className="space-y-6">
                            <Card>
                                <p className="text-sm font-semibold text-gray-700 mb-4">Beneficiaries Over Time</p>
                                <TrendChart data={data.beneficiaries_over_time} color={primary} />
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">By Region</p>
                                    <HorizontalBarChart data={data.beneficiaries_by_region} color={primary} />
                                </Card>
                                <Card>
                                    <p className="text-sm font-semibold text-gray-700 mb-4">By Gender</p>
                                    <GenderDonut data={data.beneficiaries_by_gender} color={primary} />
                                </Card>
                            </div>

                            <Card>
                                <p className="text-sm font-semibold text-gray-700 mb-4">Geographic Coverage — Active Projects by Region</p>
                                <HorizontalBarChart data={data.operational_coverage} color={primary} />
                            </Card>
                        </div>
                    )}

                    {/* ── Assistance ── */}
                    {activeTab === "assistance" && (
                        <div className="space-y-6">
                            <Card>
                                <p className="text-sm font-semibold text-gray-700 mb-4">Deliveries Over Time</p>
                                <ColumnChart data={data.deliveries_over_time} color={primary} />
                            </Card>
                            <Card>
                                <p className="text-sm font-semibold text-gray-700 mb-4">Assistance by Type</p>
                                <HorizontalBarChart data={data.assistance_by_type} color={primary} />
                            </Card>
                        </div>
                    )}

                    {/* ── Data Quality ── */}
                    {activeTab === "data-quality" && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-primary/5 border-primary/10">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Validation Rate</p>
                                <p className="text-3xl font-bold text-primary mt-1.5">{data.data_quality.validation_rate}%</p>
                            </Card>
                            <Card>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Validated</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1.5">{data.data_quality.validated.toLocaleString()}</p>
                            </Card>
                            <Card>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1.5">{data.data_quality.pending.toLocaleString()}</p>
                            </Card>
                            <Card>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rejected</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1.5">{data.data_quality.rejected.toLocaleString()}</p>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Analytics;