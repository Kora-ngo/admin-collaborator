const Maintenance = () => {

    const sidebarItems = [
        { icon: "⊞", label: "Dashboard", active: true },
        { icon: "◈", label: "Projects" },
        { icon: "⊛", label: "Families" },
        { icon: "⊟", label: "Deliveries" },
        { icon: "◉", label: "Assistance" },
        { icon: "⊕", label: "Users" },
        { icon: "≡", label: "Audit log" },
    ];

    const statCards = [
        { label: "Total projects", value: "—" },
        { label: "Families", value: "—" },
        { label: "Deliveries", value: "—" },
        { label: "Pending review", value: "—" },
    ];

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f0f2f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>

            {/* Dashboard shell — the ghost */}
            <div style={{
                width: "100%",
                maxWidth: "900px",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e4e9",
                boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                position: "relative",
                userSelect: "none",
            }}>

                {/* Maintenance overlay */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)",
                    background: "rgba(255,255,255,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <div style={{
                        background: "#fff",
                        border: "1px solid #e2e4e9",
                        borderRadius: "14px",
                        padding: "2rem 2.25rem",
                        textAlign: "center",
                        maxWidth: "320px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.09)",
                    }}>
                        {/* Animated cog */}
                        <div className="text-primary" style={{
                            width: 52,
                            height: 52,
                            borderRadius: "50%",
                            background: "#eef2ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                            fontSize: 26,
                            animation: "spin 6s linear infinite",
                        }}>
                            ⚙
                        </div>

                        <div className="text-primary bg-primary/10" style={{
                            display: "inline-block",
                            fontSize: 11,
                            fontWeight: 500,
                            borderRadius: 6,
                            padding: "2px 10px",
                            marginBottom: "0.75rem",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                        }}>
                            Under maintenance
                        </div>

                        <h2 style={{
                            margin: "0 0 0.5rem",
                            fontSize: 17,
                            fontWeight: 600,
                            color: "#111827",
                            lineHeight: 1.3,
                        }}>
                            Kora will be right back
                        </h2>

                        <p style={{
                            margin: "0 0 1.25rem",
                            fontSize: 13,
                            color: "#6b7280",
                            lineHeight: 1.6,
                        }}>
                            We're upgrading our servers. Everything you see behind this message is coming back better, on <strong className="text-primary">August 2nd</strong>.
                        </p>


                        <a
                            href="https://www.kora.onl"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#fff",
                                background: "#4f46e5",
                                borderRadius: 8,
                                padding: "8px 18px",
                                textDecoration: "none",
                            }}
                        >
                            About Kora →
                        </a>
                    </div>
                </div>

                {/* ── Navbar ── */}
                <div style={{
                    height: 52,
                    background: "#fff",
                    borderBottom: "1px solid #e2e4e9",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 1.25rem",
                    gap: 12,
                    filter: "blur(0.5px)",
                }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#4f46e5", letterSpacing: "-0.5px" }}>
                        Kora
                    </div>
                    <div style={{ flex: 1 }} />
                    <div style={{ width: 120, height: 28, background: "#f3f4f6", borderRadius: 6 }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0e7ff" }} />
                </div>

                {/* ── Body ── */}
                <div style={{ display: "flex", height: 460, filter: "blur(0.5px)" }}>

                    {/* Sidebar */}
                    <div style={{
                        width: 180,
                        background: "#fff",
                        borderRight: "1px solid #e2e4e9",
                        padding: "1rem 0.75rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        flexShrink: 0,
                    }}>
                        {sidebarItems.map((item) => (
                            <div
                                key={item.label}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "7px 10px",
                                    borderRadius: 7,
                                    background: item.active ? "#eef2ff" : "transparent",
                                    color: item.active ? "#4f46e5" : "#9ca3af",
                                    fontSize: 13,
                                    fontWeight: item.active ? 500 : 400,
                                }}
                            >
                                <span style={{ fontSize: 15 }}>{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </div>

                    {/* Main content */}
                    <div style={{
                        flex: 1,
                        background: "#f8f9fb",
                        padding: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        overflowY: "hidden",
                    }}>
                        {/* Stat cards row */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                            {statCards.map((card) => (
                                <div
                                    key={card.label}
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e2e4e9",
                                        borderRadius: 10,
                                        padding: "0.85rem 1rem",
                                    }}
                                >
                                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 4 }}>{card.label}</div>
                                    <div style={{ fontSize: 22, fontWeight: 600, color: "#d1d5db" }}>{card.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Table ghost */}
                        <div style={{
                            background: "#fff",
                            border: "1px solid #e2e4e9",
                            borderRadius: 10,
                            padding: "1rem",
                            flex: 1,
                        }}>
                            <div style={{ width: 120, height: 14, background: "#f3f4f6", borderRadius: 4, marginBottom: 14 }} />
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        gap: 10,
                                        paddingBottom: 11,
                                        marginBottom: 11,
                                        borderBottom: i < 5 ? "1px solid #f3f4f6" : "none",
                                        alignItems: "center",
                                    }}
                                >
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f3f4f6", flexShrink: 0 }} />
                                    <div style={{ flex: 2, height: 10, background: "#f3f4f6", borderRadius: 4 }} />
                                    <div style={{ flex: 1, height: 10, background: "#f3f4f6", borderRadius: 4 }} />
                                    <div style={{ flex: 1, height: 10, background: "#f3f4f6", borderRadius: 4 }} />
                                    <div style={{ width: 50, height: 20, background: "#eef2ff", borderRadius: 20 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
            `}</style>
        </div>
    );
}

export default Maintenance;