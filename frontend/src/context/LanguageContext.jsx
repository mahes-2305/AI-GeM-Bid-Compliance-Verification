import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const translations = {
    ENG: {
        // Top Bar & Navigation
        govtTitleText: "Government of India · Ministry of Petroleum & Natural Gas / MoPNG",
        portalTitle: "Government Procurement AI Platform",
        ministry: "Ministry of Petroleum & Natural Gas | Government of India",
        unit: "Chennai Petroleum Corporation Limited (CPCL)",
        dashboard: "Officer Dashboard",
        bids: "Active GeM Bids",
        compliance: "AI Multi-Portal Verification",
        compare: "Compare Bids",
        assistant: "AI Procurement Copilot",
        logout: "Sign Out",
        welcomeOfficer: "Welcome, Officer",

        // Common Buttons
        selectLanguage: "Language",
        refreshCaptcha: "↻ Refresh CAPTCHA",
        verifyNow: "Run Verification",
        sendOtp: "Send OTP Code",
        submit: "Submit",
        cancel: "Cancel",

        // Dashboard Home
        complianceOverview: "Compliance Overview",
        complianceSub: "GeM procurement bids · updated moments ago",
        statBids: "Bids Processed",
        statScore: "Avg. Compliance Score",
        statPending: "Pending Review",
        statFlagged: "Flagged Non-Compliant",

        // Dashboard Overview
        totalBids: "Total Submitted Bids",
        verifiedBids: "Verified Compliant Bids",
        highRiskBids: "High Risk / Disqualified Bids",
        debarredVendors: "Central Debarment Alerts",
        availableBids: "Available Bids",
        mySubmissions: "My Submissions",
        activeBids: "Active Bids",
        documentsUploaded: "Documents Uploaded",
        selectBid: "Select Bid",
        selected: "Selected",
        reports: "Reports & Certificates",
        settings: "Settings",

        // AI Copilot
        copilotHeader: "AI Procurement Assistant & Conversational Bot",
        copilotSub: "Official Government Procurement Copilot for GeM Bids & Statutory Verification.",
        welcomeBotMsg: "Namaste Officer! I am NexVerify AI, your Official Government Procurement Assistant. How can I assist you today? Select one of our services below or ask a question.",
        servicesTitle: "Official Procurement Services Offered:",
        service1: " Verify Bidder Compliance (GSTN / PAN / Debarment)",
        service2: " Query GFR 2017 & Procurement Guidelines",
        service3: " Draft Disqualification / Clarification Notice",
        service4: " Calculate Financial Eligibility & Shortfall",
        service5: " GeM Terms of Portal Policy Check",
        copyLetter: " Copy Official Letter",
        askPromptPlaceholder: "Ask NexVerify AI in English, Tamil, or Hindi...",
        sendQuery: "Send Query",
        thinking: "Querying Ollama AI...",

        // Authentication
        govAuthHeader: "GOVERNMENT OF INDIA SINGLE SIGN-ON PORTAL",
        secureLogin: "Authorized Official Login System",
        emailLabel: "Email / Officer Employee ID",
        passwordLabel: "Password",
        otpLabel: "6-Digit Security OTP",
        captchaLabel: "Security CAPTCHA Code",
        rememberMe: "Remember session",
        forgotPassword: "Forgot password?",
        signIn: "Sign In",
        signInOtp: "Verify OTP & Sign In",
        sso: "Sign in with Organization SSO",
        createAccount: "Register New Account",
        or: "or",
        passwordTab: "Password + CAPTCHA",
        otpTab: "OTP + CAPTCHA",
    },
    TA: {
        // Top Bar & Navigation
        govtTitleText: "இந்திய அரசு · பெட்ரோலியம் மற்றும் இயற்கை எரிவாயு அமைச்சகம் / MoPNG",
        portalTitle: "அரசு கொள்முதல் AI தளம்",
        ministry: "பெட்ரோலியம் மற்றும் இயற்கை எரிவாயு அமைச்சகம் | இந்திய அரசு",
        unit: "சென்னை பெட்ரோலியம் கார்ப்பரேஷன் லிமிடெட் (CPCL)",
        dashboard: "அதிகாரி டாஷ்போர்டு",
        bids: "செயலில் உள்ள டெண்டர்கள்",
        compliance: "AI பல போர்ட்டல் சரிபார்ப்பு",
        compare: "ஏலங்களை ஒப்பிடுக",
        assistant: "AI கொள்முதல் உதவியாளர்",
        logout: "வெளியேறு",
        welcomeOfficer: "வரவேற்கிறோம், அதிகாரி",

        // Common Buttons
        selectLanguage: "மொழி",
        refreshCaptcha: "↻ CAPTCHA புதுப்பி",
        verifyNow: "சரிபார்ப்பை இயக்கு",
        sendOtp: "OTP அனுப்பு",
        submit: "சமர்ப்பி",
        cancel: "ரத்து செய்",

        // Dashboard Home
        complianceOverview: "இணக்க கண்ணோட்டம்",
        complianceSub: "GeM கொள்முதல் ஏலங்கள் · சற்று முன்பு புதுப்பிக்கப்பட்டது",
        statBids: "பதப்படுத்தப்பட்ட ஏலங்கள்",
        statScore: "சராசரி இணக்க மதிப்பெண்",
        statPending: "மதிப்பாய்வு நிலுவையில் உள்ளது",
        statFlagged: "இணக்கமற்றது எனக் குறிக்கப்பட்டது",

        // Dashboard Overview
        totalBids: "மொத்த ஏலங்கள்",
        verifiedBids: "சரிபார்க்கப்பட்ட ஏலங்கள்",
        highRiskBids: "உயர் ஆபத்து ஏலங்கள்",
        debarredVendors: "கருப்புப்பட்டியல் விழிப்பூட்டல்கள்",
        availableBids: "கிடைக்கக்கூடிய ஏலங்கள்",
        mySubmissions: "என் சமர்ப்பிப்புகள்",
        activeBids: "செயலில் உள்ள ஏலங்கள்",
        documentsUploaded: "பதிவேற்றப்பட்ட ஆவணங்கள்",
        selectBid: "ஏலத்தைத் தேர்ந்தெடு",
        selected: "தேர்ந்தெடுக்கப்பட்டது",
        reports: "அறிக்கைகள் & சான்றிதழ்கள்",
        settings: "அமைப்புகள்",

        // AI Copilot
        copilotHeader: "AI கொள்முதல் உதவியாளர் & உரையாடல் பாட்",
        copilotSub: "GeM ஏலங்கள் மற்றும் சட்டப்பூர்வ சரிபார்ப்புக்கான அதிகாரப்பூர்வ அரசு கொள்முதல் பாட்.",
        welcomeBotMsg: "வணக்கம் அதிகாரி! நான் NexVerify AI, உங்கள் அதிகாரப்பூர்வ அரசு கொள்முதல் உதவியாளர். இன்று உங்களுக்கு நான் எவ்வாறு உதவ முடியும்? கீழே உள்ள சேவைகளில் ஒன்றைத் தேர்ந்தெடுக்கவும் அல்லது கேள்வி கேட்கவும்.",
        servicesTitle: "வழங்கப்படும் அதிகாரப்பூர்வ கொள்முதல் சேவைகள்:",
        service1: " விண்ணப்பதாரர் இணக்கத்தை சரிபார் (GSTN / PAN / நீக்கம்)",
        service2: " GFR 2017 விதிகள் மற்றும் வழிகாட்டுதல்கள்",
        service3: " தகுதி நீக்கம் / விளக்கக் கடிதம் வரைவு",
        service4: " நிதித் தகுதி மற்றும் வருவாய் பற்றாக்குறை கணக்கிடு",
        service5: " GeM போர்ட்டல் கொள்கை சரிபார்ப்பு",
        copyLetter: " கடிதத்தை நகலெடு",
        askPromptPlaceholder: "ஆங்கிலம், தமிழ் அல்லது இந்தியில் கேட்கவும்...",
        sendQuery: "அனுப்பு",
        thinking: "Ollama AI சிந்திக்கிறது...",

        // Authentication
        govAuthHeader: "இந்திய அரசு ஒற்றை உள்நுழைவு தளம்",
        secureLogin: "அதிகாரப்பூர்வ உள்நுழைவு அமைப்பு",
        emailLabel: "மின்னஞ்சல் / அதிகாரி ஐடி",
        passwordLabel: "கடவுச்சொல்",
        otpLabel: "6-இலக்க பாதுகாப்பு OTP",
        captchaLabel: "பாதுகாப்பு CAPTCHA குறியீடு",
        rememberMe: "என்னை நினைவில் கொள்",
        forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
        signIn: "உள்நுழைக",
        signInOtp: "OTP சரிபார்த்து உள்நுழைக",
        sso: "அமைப்பு SSO மூலம் உள்நுழைக",
        createAccount: "புதிய கணக்கை உருவாக்கு",
        or: "அல்லது",
        passwordTab: "கடவுச்சொல் + CAPTCHA",
        otpTab: "OTP + CAPTCHA",
    },
    HI: {
        // Top Bar & Navigation
        govtTitleText: "भारत सरकार · पेट्रोलियम और प्राकृतिक गैस मंत्रालय / MoPNG",
        portalTitle: "सरकारी खरीद एआई प्लेटफॉर्म",
        ministry: "पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय | भारत सरकार",
        unit: "चेन्नई पेट्रोलियम कॉर्पोरेशन लिमिटेड (CPCL)",
        dashboard: "अधिकारी डैशबोर्ड",
        bids: "सक्रिय निविदाएं",
        compliance: "एआई बहु-पोर्टल सत्यापन",
        compare: "बोलियों की तुलना करें",
        assistant: "एआई खरीद सहायक",
        logout: "साइन आउट",
        welcomeOfficer: "स्वागत है, अधिकारी",

        // Common Buttons
        selectLanguage: "भाषा",
        refreshCaptcha: "↻ कैप्चा ताज़ा करें",
        verifyNow: "सत्यापन चलाएं",
        sendOtp: "ओटीपी भेजें",
        submit: "जमा करें",
        cancel: "रद्द करें",

        // Dashboard Home
        complianceOverview: "अनुपालन सिंहावलोकन",
        complianceSub: "GeM खरीद बोलियां · कुछ पल पहले अपडेट किया गया",
        statBids: "संसाधित बोलियां",
        statScore: "औसत अनुपालन स्कोर",
        statPending: "समीक्षा लंबित",
        statFlagged: "गैर-अनुपालन चिह्नित",

        // Dashboard Overview
        totalBids: "कुल प्रस्तुत बोलियां",
        verifiedBids: "सत्यापित अनुपालन बोलियां",
        highRiskBids: "उच्च जोखिम बोलियां",
        debarredVendors: "ब्लैकलिस्ट अलर्ट",
        availableBids: "उपलब्ध बोलियां",
        mySubmissions: "मेरी प्रस्तुतियां",
        activeBids: "सक्रिय बोलियां",
        documentsUploaded: "अपलोड किए गए दस्तावेज़",
        selectBid: "बोली का चयन करें",
        selected: "चयनित",
        reports: "रिपोर्ट और प्रमाणपत्र",
        settings: "सेटिंग्स",

        // AI Copilot
        copilotHeader: "एआई खरीद सहायक और संवादात्मक बॉट",
        copilotSub: "GeM बोलियों और वैधानिक सत्यापन के लिए आधिकारिक सरकारी खरीद बॉट।",
        welcomeBotMsg: "नमस्ते अधिकारी! मैं NexVerify AI हूँ, आपका आधिकारिक सरकारी खरीद सहायक। आज मैं आपकी क्या सहायता कर सकता हूँ? नीचे दी गई सेवाओं में से चुनें या प्रश्न पूछें।",
        servicesTitle: "प्रदान की जाने वाली आधिकारिक खरीद सेवाएं:",
        service1: " बोलीदाता अनुपालन जांचें (GSTN / PAN / ब्लैकलिस्ट)",
        service2: " GFR 2017 नियम और खरीद दिशानिर्देश",
        service3: " अयोग्यता / स्पष्टीकरण पत्र का मसौदा तैयार करें",
        service4: " वित्तीय पात्रता और टर्नओवर की कमी की गणना करें",
        service5: " GeM पोर्टल नीति जांच",
        copyLetter: " पत्र कॉपी करें",
        askPromptPlaceholder: "अंग्रेजी, तमिल या हिंदी में पूछें...",
        sendQuery: "भेजें",
        thinking: "ओटीपी/एआई विचार कर रहा है...",

        // Authentication
        govAuthHeader: "भारत सरकार एकल साइन-ऑन पोर्टल",
        secureLogin: "आधिकारिक अधिकारी लॉगिन प्रणाली",
        emailLabel: "ईमेल / अधिकारी कर्मचारी आईडी",
        passwordLabel: "पासवर्ड",
        otpLabel: "6-अंकों का सुरक्षा ओटीपी",
        captchaLabel: "सुरक्षा कैप्चा कोड",
        rememberMe: "सत्र याद रखें",
        forgotPassword: "पासवर्ड भूल गए?",
        signIn: "साइन इन करें",
        signInOtp: "ओटीपी सत्यापित करें और साइन इन करें",
        sso: "संगठन SSO के साथ साइन इन करें",
        createAccount: "नया खाता पंजीकृत करें",
        or: "अथवा",
        passwordTab: "पासवर्ड + कैप्चा",
        otpTab: "ओटीपी + कैप्चा",
    },
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("NEXVERIFY_LANG") || "ENG";
    });

    const changeLanguage = (code) => {
        setLanguage(code);
        localStorage.setItem("NEXVERIFY_LANG", code);
    };

    const t = (key) => {
        return translations[language]?.[key] || translations.ENG[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};

export function GlobalLanguageSelector({ className = "" }) {
    const { language, changeLanguage } = useLanguage();

    return (
        <div className={`global-lang-selector ${className}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.08)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.15)" }}>
            <span style={{ fontSize: "13px" }}></span>
            <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                style={{
                    background: "transparent",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    outline: "none"
                }}
            >
                <option value="ENG" style={{ background: "#1e293b", color: "#fff" }}>English (ENG)</option>
                <option value="TA" style={{ background: "#1e293b", color: "#fff" }}>தமிழ் (TA)</option>
                <option value="HI" style={{ background: "#1e293b", color: "#fff" }}>हिंदी (HI)</option>
            </select>
        </div>
    );
}
