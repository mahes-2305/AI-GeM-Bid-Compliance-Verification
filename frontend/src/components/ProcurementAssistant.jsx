import { useState, useRef, useEffect } from "react";
import { useLanguage, GlobalLanguageSelector } from "../context/LanguageContext";
import "./ProcurementAssistant.css";

export default function ProcurementAssistant() {
    const { language, t } = useLanguage();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const chatContainerRef = useRef(null);

    const initialGreeting = {
        sender: "ai",
        text: t("welcomeBotMsg"),
        engine: "NexVerify AI (Ollama Llama3 & RAG Engine)",
        showServices: true,
        suggestedActions: [
            { label: t("service1"), query: "Check GSTN, PAN, and Central Debarment status for vendor Aravali Steel Works." },
            { label: t("service2"), query: "What are the key eligibility requirements under GFR 2017 Rule 151 for GeM tenders?" },
            { label: t("service3"), query: "Draft an official GeM Bid Clarification Notice to Bidder for missing CA turnover certificate." },
            { label: t("service4"), query: "How is annual turnover shortfall evaluated for CPCL procurement tenders?" }
        ]
    };

    const [chatHistory, setChatHistory] = useState([initialGreeting]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    const handleSend = async (textToSend) => {
        const messageText = textToSend || query;
        if (!messageText.trim() || loading) return;

        const userMsg = { sender: "user", text: messageText };
        setChatHistory((prev) => [...prev, userMsg]);
        if (!textToSend) setQuery("");
        setLoading(true);

        try {
            const response = await fetch("/api/documents/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: messageText, language })
            });

            const textResponse = await response.text();
            let data = {};
            try {
                data = textResponse ? JSON.parse(textResponse) : {};
            } catch (pErr) {
                throw new Error(`AI response parsing error (${response.status})`);
            }

            if (data.success) {
                // Conversational Follow-up Suggestions
                const followUps = [];
                if (messageText.toLowerCase().includes("debar") || messageText.toLowerCase().includes("blacklist")) {
                    followUps.push({ label: " Draft Disqualification Notice", query: "Draft formal disqualification letter under GFR Rule 151." });
                    followUps.push({ label: " Check GST Portal Status", query: "Verify GSTN portal registration status for vendor." });
                } else if (messageText.toLowerCase().includes("clarification") || messageText.toLowerCase().includes("draft") || messageText.toLowerCase().includes("letter")) {
                    followUps.push({ label: " Copy Letter to Clipboard", action: "copy" });
                    followUps.push({ label: " Calculate Financial Eligibility", query: "Calculate turnover shortfall and net worth criteria." });
                } else {
                    followUps.push({ label: " View GFR 2017 Rules", query: "Explain GFR 2017 procurement guidelines." });
                    followUps.push({ label: " Draft Clarification Letter", query: "Draft an official clarification letter for the bidder." });
                }

                setChatHistory((prev) => [
                    ...prev,
                    {
                        sender: "ai",
                        text: data.answer,
                        engine: data.engine || "Ollama (Llama3)",
                        suggestedActions: followUps
                    }
                ]);
            } else {
                throw new Error(data.message || "Failed to query AI engine");
            }
        } catch (err) {
            setChatHistory((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: ` AI Conversational Assistant Notice: ${err.message || "Engine notice"}\n\nRule Guidance: Under GFR 2017 Rule 151, active GSTIN registration and non-debarment status across CPSE registries are mandatory prerequisites before financial bid opening.`,
                    engine: "NexVerify RAG Knowledge Base",
                    suggestedActions: [
                        { label: " Draft Official Notice", query: "Draft an official clarification notice for bidder." },
                        { label: " Re-run Portal Check", query: "Check GSTN and Income Tax PAN database status." }
                    ]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickService = (serviceQuery) => {
        handleSend(serviceQuery);
    };

    return (
        <div className="pa-container">
            {/* HEADER WITH LANGUAGE SELECTOR */}
            <header className="pa-header">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <span className="pa-pill"> Official Government AI Copilot</span>
                        <h1>{t("copilotHeader")}</h1>
                        <p>{t("copilotSub")}</p>
                    </div>
                    <GlobalLanguageSelector />
                </div>
            </header>

            {/* CHAT MESSAGES CONTAINER */}
            <div className="pa-chat-box" ref={chatContainerRef}>
                {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`pa-msg-wrapper ${msg.sender === "user" ? "user-side" : "ai-side"}`}>
                        <div className="pa-msg-bubble">
                            {msg.sender === "ai" && (
                                <div className="pa-msg-meta">
                                    <span className="pa-ai-badge"> NexVerify AI Officer</span>
                                    <span className="pa-engine-tag">{msg.engine}</span>
                                </div>
                            )}

                            <div className="pa-msg-text" style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                                {msg.text}
                            </div>

                            {/* SERVICE MENU CARDS IN INITIAL BOT GREETING */}
                            {msg.showServices && (
                                <div style={{ marginTop: "15px", paddingTop: "12px", borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}>
                                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#60a5fa", marginBottom: "10px" }}>
                                        {t("servicesTitle")}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "8px" }}>
                                        <button className="pa-quick-btn" onClick={() => handleQuickService("Check GSTN, PAN, and Central Debarment status for bidder Aravali Steel.")}>
                                            {t("service1")}
                                        </button>
                                        <button className="pa-quick-btn" onClick={() => handleQuickService("Explain GFR 2017 Rule 151 statutory compliance guidelines.")}>
                                            {t("service2")}
                                        </button>
                                        <button className="pa-quick-btn" onClick={() => handleQuickService("Draft official GeM Bid Clarification Notice for CA Turnover certificate.")}>
                                            {t("service3")}
                                        </button>
                                        <button className="pa-quick-btn" onClick={() => handleQuickService("Calculate financial eligibility and turnover shortfall for bidder.")}>
                                            {t("service4")}
                                        </button>
                                        <button className="pa-quick-btn" onClick={() => handleQuickService("What are GeM Terms of Portal compliance policies?")}>
                                            {t("service5")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* INTERACTIVE FOLLOW-UP SUGGESTIONS */}
                            {msg.suggestedActions && msg.suggestedActions.length > 0 && !msg.showServices && (
                                <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px dashed rgba(0, 0, 0, 0.2)", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "100%", fontWeight: "600" }}> Conversational Next Steps:</span>
                                    {msg.suggestedActions.map((act, i) => (
                                        <button
                                            key={i}
                                            onClick={() => act.action === "copy" ? navigator.clipboard.writeText(msg.text) : handleSend(act.query)}
                                            style={{
                                                padding: "4px 10px",
                                                background: "rgba(37, 99, 235, 0.2)",
                                                border: "1px solid rgba(59, 130, 246, 0.4)",
                                                color: "#93c5fd",
                                                borderRadius: "16px",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {act.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="pa-msg-wrapper ai-side">
                        <div className="pa-msg-bubble loading">
                            <span> {t("thinking")}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT BAR */}
            <div className="pa-input-bar">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={t("askPromptPlaceholder")}
                />
                <button onClick={() => handleSend()} disabled={loading}>
                    {loading ? t("thinking") : t("sendQuery")}
                </button>
            </div>
        </div>
    );
}
