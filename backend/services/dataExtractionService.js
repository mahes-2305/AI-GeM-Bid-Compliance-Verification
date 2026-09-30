/**
 * Data Extraction & Validation Engine
 * NexVerify AI Procurement Platform (SIH PS 26100)
 */

/**
 * Official Indian GSTIN Modulus 36 Checksum Validation Algorithm
 * Validates the 15th checksum character of any 15-digit GSTIN string.
 */
const validateGstinChecksum = (gstin) => {
  if (!gstin || typeof gstin !== "string") return false;
  const clean = gstin.trim().toUpperCase();

  // Basic GSTIN format check
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z0-9][A-Z0-9]$/.test(clean)) {
    return false;
  }

  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let factor = 1;
  let sum = 0;

  for (let i = 0; i < 14; i++) {
    const code = chars.indexOf(clean[i]);
    if (code === -1) return false;
    let val = code * factor;
    factor = factor === 1 ? 2 : 1;
    val = Math.floor(val / 36) + (val % 36);
    sum += val;
  }

  const remainder = sum % 36;
  const checkCode = (36 - remainder) % 36;
  const expectedCheckChar = chars[checkCode];

  // Return true if checksum matches or if basic format matches for flexible OCR
  return clean[14] === expectedCheckChar;
};

/**
 * Contextual PAN Validation
 */
const validatePanNumber = (pan) => {
  if (!pan || typeof pan !== "string") return false;
  const clean = pan.trim().toUpperCase();
  // Fourth character of PAN indicates entity type: C=Company, P=Person, H=HUF, F=Firm, A=AOP, T=Trust
  return /^[A-Z]{3}[CPHFATBLJG][A-Z][0-9]{4}[A-Z]$/.test(clean);
};

/**
 * Main Bidder Document Data Extraction Engine
 */
const extractBidData = (text) => {
  if (!text) text = "";
  const normalizedText = text.replace(/\s+/g, " ");

  // --------------------------------
  // PAN Extraction & Validation
  // --------------------------------
  const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]/i);
  let extractedPan = panMatch ? panMatch[0].toUpperCase() : null;
  const isPanValid = extractedPan ? validatePanNumber(extractedPan) : false;

  // --------------------------------
  // GSTIN Extraction & Validation
  // --------------------------------
  const gstMatch = text.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z0-9][A-Z0-9]/i);
  let extractedGst = gstMatch ? gstMatch[0].toUpperCase() : null;
  const isGstValid = extractedGst ? validateGstinChecksum(extractedGst) : false;

  // --------------------------------
  // Annual Turnover Extraction
  // --------------------------------
  let annualTurnover = null;

  const averageTurnoverMatch = text.match(
    /(?:average\s+annual\s+turnover|annual\s+turnover|turnover)[\s\S]{0,60}?(?:₹|Rs\.?|INR)?\s*([\d,.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
  );

  if (averageTurnoverMatch) {
    let amount = Number(averageTurnoverMatch[1].replace(/,/g, ""));
    const unit = (averageTurnoverMatch[2] || "").toLowerCase();

    if (unit === "cr" || unit === "crore" || unit === "crores") {
      amount *= 10000000;
    } else if (unit === "lakh" || unit === "lakhs") {
      amount *= 100000;
    }

    if (!isNaN(amount)) {
      annualTurnover = Math.round(amount);
    }
  }

  // --------------------------------
  // Positive Net Worth
  // --------------------------------
  let positiveNetWorth = null;
  const netWorthMatch = normalizedText.match(
    /(?:positive\s+)?net\s+worth\s*:?\s*(positive|negative|yes|no)/i
  );

  if (netWorthMatch) {
    const value = netWorthMatch[1].toLowerCase();
    positiveNetWorth = value === "positive" || value === "yes";
  }

  // --------------------------------
  // Solvency Certificate
  // --------------------------------
  let solvencyAmount = null;
  const solvencyMatch = normalizedText.match(
    /solvency\s+(?:certificate\s+)?(?:amount|value)?\s*:?\s*(?:₹|Rs\.?|INR)?\s*([\d,.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
  );

  if (solvencyMatch) {
    let amount = Number(solvencyMatch[1].replace(/,/g, ""));
    const unit = (solvencyMatch[2] || "").toLowerCase();

    if (unit === "cr" || unit === "crore" || unit === "crores") {
      amount *= 10000000;
    } else if (unit === "lakh" || unit === "lakhs") {
      amount *= 100000;
    }

    if (!isNaN(amount)) {
      solvencyAmount = Math.round(amount);
    }
  }

  // Solvency Date
  let solvencyDate = null;
  const solvencyDateMatch = normalizedText.match(
    /solvency[\s\S]{0,100}?(?:dated|date)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i
  );
  if (solvencyDateMatch) {
    solvencyDate = solvencyDateMatch[1];
  }

  // --------------------------------
  // Registered Experience Years
  // --------------------------------
  const experienceMatch =
    text.match(/years\s+of\s+experience\s+declared\s+(\d+)\s*years?/i) ||
    text.match(/(\d+)\s*years?\s+(?:of\s+)?experience/i) ||
    text.match(/experience[\s\S]{0,50}?(\d+)\s*years?/i);

  const experienceYears = experienceMatch ? Number(experienceMatch[1]) : null;

  // --------------------------------
  // Largest Single Order Value
  // --------------------------------
  const largestOrderMatch = text.match(
    /largest\s+single\s+order\s+value[\s\S]{0,40}?(?:₹|Rs\.?|INR)?\s*([\d,.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
  );

  let largestOrderValue = null;
  if (largestOrderMatch) {
    let amount = Number(largestOrderMatch[1].replace(/,/g, ""));
    const unit = (largestOrderMatch[2] || "").toLowerCase();

    if (unit === "cr" || unit === "crore" || unit === "crores") {
      amount *= 10000000;
    } else if (unit === "lakh" || unit === "lakhs") {
      amount *= 100000;
    }

    if (!isNaN(amount)) {
      largestOrderValue = Math.round(amount);
    }
  }

  // --------------------------------
  // Statutory Compliances Context Extraction
  // --------------------------------
  const epfoRegistered = /EPFO|Provident\s+Fund|PF\s+Registration/i.test(text);
  const esicRegistered = /ESIC|State\s+Insurance|ESI\s+Registration/i.test(text);
  const digilockerVerified = /DigiLocker|Digital\s+Locker|Digi\s+Locker/i.test(text);

  // Debarment Check
  let debarred = null;
  const debarMatch = normalizedText.match(/(?:debarred|blacklisted)\s*:?\s*(yes|no|true|false)/i);
  if (debarMatch) {
    debarred = debarMatch[1].toLowerCase() === "yes" || debarMatch[1].toLowerCase() === "true";
  }

  // Legal Entity
  const legalEntityMatch = normalizedText.match(
    /(?:legal\s+entity|constitution)\s*:?\s*(private\s*limited\s*company|public\s*limited\s*company|llp|partnership\s*firm|proprietorship)/i
  );
  const legalEntity = legalEntityMatch ? legalEntityMatch[1].trim() : null;

  return {
    pan: extractedPan,
    isPanValid,
    gst: extractedGst,
    isGstValid,
    legalEntity,
    annualTurnover,
    positiveNetWorth,
    solvencyAmount,
    solvencyDate,
    experienceYears,
    largestOrderValue,
    epfoRegistered,
    esicRegistered,
    digilockerVerified,
    debarred,
  };
};

module.exports = {
  extractBidData,
  validateGstinChecksum,
  validatePanNumber,
};