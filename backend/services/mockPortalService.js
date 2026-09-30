/**
 * Mock Government Portal Service
 * SIH Problem Statement 26100 (Ministry of Petroleum & Natural Gas / CPCL)
 * 
 * Simulates official API integrations for cross-verifying bidder statutory,
 * financial, and regulatory records against central government databases.
 */

// Simulated Mock Databases
const MOCK_GSTN_DATABASE = {
  "27AAACA1234A1Z5": {
    gstin: "27AAACA1234A1Z5",
    legalName: "Aravali Steel Works Pvt Ltd",
    tradeName: "Aravali Steels",
    status: "ACTIVE",
    registrationDate: "2018-04-12",
    taxpayerType: "Regular",
    state: "Maharashtra",
    returnFilingStatus: {
      gstr1: "FILED",
      gstr3b: "FILED",
      latestFilingPeriod: "August 2026",
      compliancePercentage: 100
    }
  },
  "07AABCN9876C1Z3": {
    gstin: "07AABCN9876C1Z3",
    legalName: "Nirmaan Infratech Pvt Ltd",
    tradeName: "Nirmaan Infra",
    status: "ACTIVE",
    registrationDate: "2016-09-20",
    taxpayerType: "Regular",
    state: "Delhi",
    returnFilingStatus: {
      gstr1: "FILED",
      gstr3b: "FILED",
      latestFilingPeriod: "August 2026",
      compliancePercentage: 98
    }
  },
  "33AAAFK5544K1Z9": {
    gstin: "33AAAFK5544K1Z9",
    legalName: "Kavya Medical Devices Ltd",
    tradeName: "Kavya MedTech",
    status: "SUSPENDED",
    registrationDate: "2021-01-15",
    taxpayerType: "Regular",
    state: "Tamil Nadu",
    returnFilingStatus: {
      gstr1: "DELAYED",
      gstr3b: "NOT_FILED",
      latestFilingPeriod: "May 2026",
      compliancePercentage: 62
    }
  },
  "24AAACT1122T1Z1": {
    gstin: "24AAACT1122T1Z1",
    legalName: "Trivedi Electronics & Solutions",
    tradeName: "Trivedi Tech",
    status: "ACTIVE",
    registrationDate: "2019-11-05",
    taxpayerType: "Regular",
    state: "Gujarat",
    returnFilingStatus: {
      gstr1: "FILED",
      gstr3b: "FILED",
      latestFilingPeriod: "August 2026",
      compliancePercentage: 95
    }
  },
  "09AAAFB7788B1Z7": {
    gstin: "09AAAFB7788B1Z7",
    legalName: "Bharat Logistics Corp",
    tradeName: "Bharat Express",
    status: "CANCELLED",
    registrationDate: "2015-03-30",
    taxpayerType: "Regular",
    state: "Uttar Pradesh",
    returnFilingStatus: {
      gstr1: "NOT_FILED",
      gstr3b: "NOT_FILED",
      latestFilingPeriod: "January 2026",
      compliancePercentage: 40
    }
  }
};

const MOCK_DEBARMENT_DATABASE = [
  {
    vendorName: "Bharat Logistics Corp",
    pan: "AAAFB7788B",
    gstin: "09AAAFB7788B1Z7",
    debarred: true,
    authority: "Ministry of Petroleum & Natural Gas / CPCL",
    reason: "Default on tender contract obligations & non-compliance",
    debarmentPeriod: "2025-06-01 to 2028-05-31",
    status: "ACTIVE_DEBARMENT"
  },
  {
    vendorName: "Kavya Medical Devices Ltd",
    pan: "AAAFK5544K",
    gstin: "33AAAFK5544K1Z9",
    debarred: true,
    authority: "GeM Debarment Authority",
    reason: "Submission of forged compliance document",
    debarmentPeriod: "2026-02-15 to 2027-02-14",
    status: "ACTIVE_DEBARMENT"
  }
];

const MOCK_UDYAM_DATABASE = {
  "UDYAM-MH-12-0012345": {
    udyamRegNo: "UDYAM-MH-12-0012345",
    enterpriseName: "Aravali Steel Works Pvt Ltd",
    enterpriseType: "Medium",
    majorActivity: "Manufacturing",
    dateOfIncorporation: "2018-04-01",
    socialCategory: "General",
    womenOwned: false,
    status: "VERIFIED"
  },
  "UDYAM-DL-03-0098765": {
    udyamRegNo: "UDYAM-DL-03-0098765",
    enterpriseName: "Nirmaan Infratech Pvt Ltd",
    enterpriseType: "Small",
    majorActivity: "Services / Construction",
    dateOfIncorporation: "2016-08-15",
    socialCategory: "OBC",
    womenOwned: false,
    status: "VERIFIED"
  },
  "UDYAM-GJ-05-0044332": {
    udyamRegNo: "UDYAM-GJ-05-0044332",
    enterpriseName: "Trivedi Electronics & Solutions",
    enterpriseType: "Micro",
    majorActivity: "Manufacturing",
    dateOfIncorporation: "2019-10-10",
    socialCategory: "General",
    womenOwned: true,
    status: "VERIFIED"
  }
};

/**
 * Verify GSTN Portal Registration & Filing Status
 */
const verifyGSTN = async (gstinInput, vendorNameInput) => {
  const normalizedGstin = (gstinInput || "").toUpperCase().trim();
  const foundRecord = MOCK_GSTN_DATABASE[normalizedGstin];

  if (foundRecord) {
    return {
      portal: "GSTN Portal (Official)",
      verified: true,
      gstin: foundRecord.gstin,
      legalName: foundRecord.legalName,
      status: foundRecord.status,
      taxpayerType: foundRecord.taxpayerType,
      state: foundRecord.state,
      returnFilingStatus: foundRecord.returnFilingStatus,
      isCompliant: foundRecord.status === "ACTIVE" && foundRecord.returnFilingStatus.gstr3b === "FILED",
      notes: `Active GSTIN registered in ${foundRecord.state}. Returns filed up to ${foundRecord.returnFilingStatus.latestFilingPeriod}.`
    };
  }

  // Fallback heuristic simulation if GSTIN format is valid but not in exact mock map
  const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z][0-9A-Z]$/.test(normalizedGstin);

  if (isValidFormat) {
    return {
      portal: "GSTN Portal (Official)",
      verified: true,
      gstin: normalizedGstin,
      legalName: vendorNameInput || "Registered GST Taxpayer",
      status: "ACTIVE",
      taxpayerType: "Regular",
      state: "State Procurement Zone",
      returnFilingStatus: {
        gstr1: "FILED",
        gstr3b: "FILED",
        latestFilingPeriod: "August 2026",
        compliancePercentage: 96
      },
      isCompliant: true,
      notes: "GSTIN validated against central GSTN database. Active regular taxpayer with up-to-date monthly returns."
    };
  }

  return {
    portal: "GSTN Portal (Official)",
    verified: false,
    gstin: normalizedGstin || "NOT_PROVIDED",
    status: "UNVERIFIED",
    isCompliant: false,
    notes: "GSTIN record could not be verified in GSTN portal."
  };
};

/**
 * Verify PAN & Income Tax Compliance
 */
const verifyPAN = async (panInput, vendorNameInput) => {
  const normalizedPan = (panInput || "").toUpperCase().trim();
  const isValidFormat = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalizedPan);

  if (!isValidFormat) {
    return {
      portal: "Income Tax Department (PAN Database)",
      verified: false,
      pan: normalizedPan || "NOT_PROVIDED",
      status: "INVALID_FORMAT",
      isCompliant: false,
      notes: "PAN format is invalid or missing."
    };
  }

  // Determine entity category from 4th character
  const fourthChar = normalizedPan.charAt(3);
  let entityType = "Company / Entity";
  if (fourthChar === "C") entityType = "Company (Private / Public)";
  if (fourthChar === "P") entityType = "Individual / Proprietorship";
  if (fourthChar === "F") entityType = "Partnership Firm";
  if (fourthChar === "A") entityType = "Association of Persons";

  return {
    portal: "Income Tax Department (PAN Database)",
    verified: true,
    pan: normalizedPan,
    entityType,
    status: "ACTIVE_VALID",
    nameOnPan: vendorNameInput || "Registered Entity",
    aadhaarSeeded: true,
    itrFilingCompliance: {
      fy2023_24: "FILED",
      fy2024_25: "FILED",
      fy2025_26: "FILED",
      complianceStatus: "UP_TO_DATE"
    },
    isCompliant: true,
    notes: `PAN is active and verified under ${entityType}. Income Tax Returns filed up to FY 2025-26.`
  };
};

/**
 * Verify Udyam / MSME Registration
 */
const verifyUdyam = async (udyamInput, vendorNameInput) => {
  const searchKey = (udyamInput || "").toUpperCase().trim();
  const found = MOCK_UDYAM_DATABASE[searchKey];

  if (found) {
    return {
      portal: "Udyam MSME Portal",
      verified: true,
      udyamRegNo: found.udyamRegNo,
      enterpriseName: found.enterpriseName,
      enterpriseType: found.enterpriseType,
      majorActivity: found.majorActivity,
      status: found.status,
      msmeExemptionEligible: true,
      notes: `Verified ${found.enterpriseType} ${found.majorActivity} enterprise under Udyam portal.`
    };
  }

  // General simulation if vendor has MSME keywords
  if (/udyam|msme|micro|small|medium/i.test(udyamInput || vendorNameInput || "")) {
    return {
      portal: "Udyam MSME Portal",
      verified: true,
      udyamRegNo: "UDYAM-SIM-2026-99001",
      enterpriseName: vendorNameInput || "MSME Bidder",
      enterpriseType: "Small",
      majorActivity: "Manufacturing & Services",
      status: "VERIFIED",
      msmeExemptionEligible: true,
      notes: "Verified Small Enterprise under Ministry of MSME Udyam portal."
    };
  }

  return {
    portal: "Udyam MSME Portal",
    verified: false,
    udyamRegNo: udyamInput || "NOT_PROVIDED",
    status: "NOT_FOUND",
    msmeExemptionEligible: false,
    notes: "No Udyam registration record found. Vendor evaluated under general non-MSME criteria."
  };
};

/**
 * Verify MCA21 Corporate Registry
 */
const verifyMCA21 = async (vendorNameInput, panInput) => {
  return {
    portal: "Ministry of Corporate Affairs (MCA21)",
    verified: true,
    cin: "U74999MH2018PTC308891",
    companyName: vendorNameInput || "Registered Corporate Entity",
    companyCategory: "Company limited by Shares",
    companySubCategory: "Non-govt company",
    classOfCompany: "Private Limited",
    dateOfIncorporation: "2018-04-05",
    mcaStatus: "ACTIVE",
    lastAnnualReturnDate: "2025-09-30",
    lastBalanceSheetDate: "2025-03-31",
    isCompliant: true,
    notes: "Active corporate status verified on MCA21 portal. Financial statements & annual returns filed."
  };
};

/**
 * Verify EPFO & ESIC Statutory Compliance
 */
const verifyEPFO_ESIC = async (text, vendorName) => {
  const hasEpfo = /epfo|provident\s+fund|pf\s+reg/i.test(text);
  const hasEsic = /esic|employee\s+state\s+insurance/i.test(text);

  return {
    epfo: {
      portal: "EPFO Portal (Employees' Provident Fund Organisation)",
      verified: true,
      establishmentCode: "MH/BAN/0049812/000",
      status: "ACTIVE",
      lastChallanPaidDate: "2026-08-15",
      coveredEmployees: 84,
      isCompliant: true,
      notes: "Active EPFO establishment code. Monthly ECR payments up to date."
    },
    esic: {
      portal: "ESIC Portal (Employees' State Insurance Corporation)",
      verified: true,
      employerCode: "31000897650000999",
      status: "ACTIVE",
      lastContributionDate: "2026-08-20",
      isCompliant: true,
      notes: "Active ESIC employer registration verified."
    }
  };
};

/**
 * Check Central GeM & CPCL Debarment Database
 */
const checkDebarmentDatabase = async (vendorNameInput, panInput, gstinInput) => {
  const normVendor = (vendorNameInput || "").toLowerCase();
  const normPan = (panInput || "").toUpperCase();
  const normGst = (gstinInput || "").toUpperCase();

  const match = MOCK_DEBARMENT_DATABASE.find((item) => {
    return (
      (normVendor && item.vendorName.toLowerCase().includes(normVendor)) ||
      (normPan && item.pan === normPan) ||
      (normGst && item.gstin === normGst)
    );
  });

  if (match) {
    return {
      portal: "GeM & CPSE Central Debarment Database",
      isDebarred: true,
      status: "DEBARRED",
      authority: match.authority,
      reason: match.reason,
      debarmentPeriod: match.debarmentPeriod,
      riskImpact: "CRITICAL_DISQUALIFIER",
      notes: `CRITICAL ALERT: Vendor is currently DEBARRED by ${match.authority}. Reason: ${match.reason}`
    };
  }

  return {
    portal: "GeM & CPSE Central Debarment Database",
    isDebarred: false,
    status: "CLEAN_RECORD",
    authority: "Central Public Procurement Portal & GeM",
    riskImpact: "NONE",
    notes: "No active blacklisting or debarment records found across CPSE & GeM registries."
  };
};

/**
 * Verify DigiLocker & UDIN Document Authenticity
 */
const verifyDigiLocker = async (documentName) => {
  return {
    portal: "DigiLocker & ICAI UDIN Verification Portal",
    verified: true,
    digitalSignatureStatus: "VALID_EXPLICIT_SIGNATURE",
    udinVerification: "UDIN-24098712AABBCC1102 (Verified with ICAI Portal)",
    tamperCheck: "PASSED (SHA-256 Checksum Match)",
    issuer: "Certified Authority / DigiLocker Issuer",
    verificationTimestamp: new Date().toISOString(),
    notes: "Document cryptographically verified via DigiLocker token & ICAI UDIN repository."
  };
};

/**
 * Master Verification Suite Runner
 */
const runMultiPortalVerification = async (extractedData, bidderName, fullText = "") => {
  const panResult = await verifyPAN(extractedData.pan, bidderName);
  const gstResult = await verifyGSTN(extractedData.gst, bidderName);
  const udyamResult = await verifyUdyam(extractedData.udyamRegNo, bidderName);
  const mcaResult = await verifyMCA21(bidderName, extractedData.pan);
  const epfoEsicResult = await verifyEPFO_ESIC(fullText, bidderName);
  const debarmentResult = await checkDebarmentDatabase(bidderName, extractedData.pan, extractedData.gst);
  const digiLockerResult = await verifyDigiLocker(bidderName);

  return {
    timestamp: new Date().toISOString(),
    gstn: gstResult,
    pan: panResult,
    udyam: udyamResult,
    mca21: mcaResult,
    epfo: epfoEsicResult.epfo,
    esic: epfoEsicResult.esic,
    debarment: debarmentResult,
    digiLocker: digiLockerResult,
    summary: {
      totalPortalsChecked: 8,
      successfulVerifications: 8,
      hasDebarmentRisk: debarmentResult.isDebarred,
      hasGstSuspension: gstResult.status !== "ACTIVE"
    }
  };
};

module.exports = {
  verifyGSTN,
  verifyPAN,
  verifyUdyam,
  verifyMCA21,
  verifyEPFO_ESIC,
  checkDebarmentDatabase,
  verifyDigiLocker,
  runMultiPortalVerification
};
