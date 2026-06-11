import React from "react";
import welcome_plan from "../../assets/info/documents.png";
import welcome_operate from "../../assets/info/product_documents.png";
import welcome_validate from "../../assets/info/validate.png";

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  visual: React.ReactNode;
}

// ─── ADMIN SLIDES ───────────────────────────────────────────────
const adminSlides: Slide[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 0 0 .284 2.253" />
      </svg>
    ),
    title: "Welcome to Kora",
    description: "Kora helps your organisation manage field assistance programs from planning projects to tracking deliveries. As Administrator, you control everything.",
    visual: (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Plan", icon: <><div><img src={welcome_plan} alt="" className="size-9" /></div></>, desc: "Set up projects & teams" },
          { label: "Operate", icon: <><div><img src={welcome_operate} alt="" className="size-9" /></div></>, desc: "Field teams collect data" },
          { label: "Review", icon: <><div><img src={welcome_validate} alt="" className="size-9" /></div></>, desc: "Validate & export records" },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center text-center bg-primary/5 border border-primary/10 rounded-xl p-3 gap-1">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-bold text-primary">{item.label}</span>
            <span className="text-xs text-gray-400 leading-tight">{item.desc}</span>
          </div>
        ))}
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
    title: "Your Starting Point",
    description: "Before anything else, complete two things: define your Assistance types and create your team. Everything else depends on these.",
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { step: "1", label: "Define Assistance types", sub: "e.g. Food kits, Cash, Hygiene kits", done: true },
          { step: "2", label: "Create Collaborators & Enumerators", sub: "Assign roles under Members", done: true },
          { step: "3", label: "Create your first Project", sub: "You'll be ready after these two", done: false },
        ].map((item, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${item.done ? "bg-primary/5 border-primary/15" : "bg-gray-50 border-gray-100"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${item.done ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
              {item.step}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{item.label}</p>
              <p className="text-xs text-gray-400">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    ),
    title: "Assistance",
    description: "Go to Assistance first. Define every type of aid your organisation distributes name and unit. These will be selectable when building projects.",
    visual: (
      <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
        {[
          { name: "Food Kit", unit: "Per family" },
          { name: "Cash Support", unit: "FCFA" },
          { name: "Hygiene Kit", unit: "Per person" },
        ].map((item, i) => (
          <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${i !== 2 ? "border-b border-gray-100" : ""}`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/40" />
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{item.unit}</span>
          </div>
        ))}
        <div className="px-4 py-2 bg-primary/5 flex items-center gap-2">
          <span className="text-primary text-sm font-bold">+</span>
          <span className="text-xs text-primary font-medium">Add new assistance type</span>
        </div>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
      </svg>
    ),
    title: "Members",
    description: "Create your team under Members. Two roles exist: Collaborators supervise projects and validate records. Enumerators work in the field via the mobile app (Kora Field).",
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { role: "Collaborator", color: "bg-blue-100 text-blue-600", desc: "Reviews & approves field records", icon: "🔍" },
          { role: "Enumerator", color: "bg-green-100 text-green-600", desc: "Registers families & deliveries on mobile", icon: "📱" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-700">{item.desc}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${item.color}`}>{item.role}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center pt-1">Members must be invited before creating projects</p>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
    title: "Projects",
    description: "Create projects that represent specific aid operations. Each project needs a name, assistance types, one collaborator, and a team of enumerators.",
    visual: (
      <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Operation North</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>👤 1 Collaborator</span>
            <span>📱 3 Enumerators</span>
            <span>🎁 2 Assistance types</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-amber-50 flex items-center gap-2">
          <span className="text-amber-500 text-xs">⚠️</span>
          <span className="text-xs text-amber-600 font-medium">You cannot modify field records — only collaborators can.</span>
        </div>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
    title: "Oversight & Export",
    description: "Monitor all project activity from the Dashboard and Audit Log. Export beneficiary or delivery records as Excel files for reporting to donors or management.",
    visual: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">Dashboard</p>
            <p className="text-xs text-gray-400">Live overview of all projects & activity</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-lg">🗂️</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">Audit Log</p>
            <p className="text-xs text-gray-400">Full trace of all team actions</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
          <span className="text-lg">📥</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">Export Data</p>
            <p className="text-xs text-gray-400">Download beneficiaries & deliveries as Excel</p>
          </div>
        </div>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
    title: "Need Help?",
    description: "If you ever get lost or run into an issue, our team is here to help. You can also reopen this guide anytime from the ⓘ button in the top navigation bar.",
    visual: (
      <div className="mt-4 space-y-3">
        <a
          href="mailto:hello@kora.onl"
          className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-4 hover:bg-primary/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-primary">hello@kora.onl</p>
            <p className="text-xs text-gray-500">We usually respond within 24 hours</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-primary/40 group-hover:text-primary transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </a>
        <p className="text-xs text-center text-gray-400">
          Reopen this guide anytime via the <span className="font-semibold text-primary">ⓘ</span> button in the navbar
        </p>
      </div>
    ),
  },
];

// ─── COLLABORATOR SLIDES ─────────────────────────────────────────
const collaboratorSlides: Slide[] = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 0 0 .284 2.253" />
      </svg>
    ),
    title: "Your Role in Kora",
    description: "As a Collaborator, you are the bridge between field teams and validated data. You supervise enumerators and ensure every record submitted is accurate before it counts.",
    visual: (
      <div className="mt-4 flex items-center gap-2">
        {[
          { label: "Enumerator", icon: "📱", sub: "Collects data" },
          { label: "", icon: "→", sub: "" },
          { label: "You", icon: "🔍", sub: "Validate records", highlight: true },
          { label: "", icon: "→", sub: "" },
          { label: "System", icon: "✅", sub: "Data confirmed" },
        ].map((item, i) => (
          item.label === "" ? (
            <span key={i} className="text-gray-300 text-xl font-light flex-shrink-0">{item.icon}</span>
          ) : (
            <div key={i} className={`flex-1 flex flex-col items-center text-center p-2 rounded-xl border ${item.highlight ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-100"}`}>
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-bold mt-1 ${item.highlight ? "text-primary" : "text-gray-600"}`}>{item.label}</span>
              <span className="text-xs text-gray-400 leading-tight">{item.sub}</span>
            </div>
          )
        ))}
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
      </svg>
    ),
    title: "Projects",
    description: "You only see projects you've been assigned to. Each project shows your enumerators and incoming records. Your work starts here.",
    visual: (
      <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-700">Operation North</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>📱 3 Enumerators</span>
            <span>⏳ 5 Pending records</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-amber-50 flex items-center gap-2">
          <span className="text-xs text-amber-600">⚠️ You cannot create or edit project settings — only admins can.</span>
        </div>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: "Validating Families",
    description: "When enumerators sync, family records arrive as Pending. Review each one and approve or reject it. Rejected records need a reason — it gets sent back to the enumerator to fix.",
    visual: (
      <div className="mt-4 space-y-2">
        {[
          { name: "Fomba Family", code: "FAM-001", status: "Pending", color: "bg-yellow-100 text-yellow-600" },
          { name: "Njoya Family", code: "FAM-002", status: "Approved", color: "bg-green-100 text-green-600" },
          { name: "Bello Family", code: "FAM-003", status: "Rejected", color: "bg-red-100 text-red-600" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
            <div>
              <p className="text-sm font-semibold text-gray-700">{item.name}</p>
              <p className="text-xs text-gray-400">{item.code}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.color}`}>{item.status}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 text-center pt-1">Only approved families are eligible for deliveries</p>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m7.875 14.25 1.214 1.942a2.25 2.25 0 0 0 1.908 1.058h2.006c.776 0 1.497-.4 1.908-1.058l1.214-1.942M2.41 9h4.636a2.25 2.25 0 0 1 1.872 1.002l.164.246a2.25 2.25 0 0 0 1.872 1.002h2.092a2.25 2.25 0 0 0 1.872-1.002l.164-.246A2.25 2.25 0 0 1 16.954 9h4.636M2.41 9a2.25 2.25 0 0 0-.16.832V12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 12V9.832c0-.287-.055-.57-.16-.832M2.41 9a2.25 2.25 0 0 1 .382-.632l3.285-3.832a2.25 2.25 0 0 1 1.708-.786h8.43c.657 0 1.281.287 1.709.786l3.284 3.832c.163.19.291.404.382.632M4.5 20.25h15A2.25 2.25 0 0 0 21.75 18v-2.625c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125V18a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "Validating Deliveries",
    description: "Delivery records follow the same review process. A delivery can only exist if the family is already approved. Review, approve or reject — always include a reason when rejecting.",
    visual: (
      <div className="mt-4 space-y-2">
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-green-600">✓ Family approved first</span>
          </div>
          <p className="text-xs text-gray-500">Then enumerator registers a delivery → syncs → you review it</p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg">✅</p>
            <p className="text-xs font-semibold text-gray-600">Approve</p>
            <p className="text-xs text-gray-400">Record confirmed</p>
          </div>
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg">❌</p>
            <p className="text-xs font-semibold text-gray-600">Reject</p>
            <p className="text-xs text-gray-400">Add a reason</p>
          </div>
        </div>
      </div>
    ),
  },

  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    ),
    title: "Audit Log & Need Help?",
    description: "Your Audit Log shows every action within your assigned projects. If you ever get stuck, reach out — or reopen this guide from the ⓘ button anytime.",
    visual: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <span className="text-lg">🗂️</span>
          <div>
            <p className="text-sm font-semibold text-gray-700">Audit Log</p>
            <p className="text-xs text-gray-400">Sync events, approvals & rejections in your projects</p>
          </div>
        </div>
        
        <a  href="mailto:hello@kora.onl"
          className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 hover:bg-primary/10 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-primary">hello@kora.onl</p>
            <p className="text-xs text-gray-500">We usually respond within 24 hours</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4 text-primary/40 group-hover:text-primary transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </a>
        <p className="text-xs text-center text-gray-400">
          Reopen this guide anytime via the <span className="font-semibold text-primary">ⓘ</span> button in the navbar
        </p>
      </div>
    ),
  },
];

// ─── EXPORT ──────────────────────────────────────────────────────
export const getSlides = (role: string): Slide[] => {
  if (role === "collaborator") return collaboratorSlides;
  return adminSlides; // default to admin
};