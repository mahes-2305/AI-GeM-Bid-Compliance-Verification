const extractBidData = (text) => {

  // Normalize PDF whitespace
  const normalizedText = text.replace(/\s+/g, " ");

  // --------------------------------
  // PAN
  // --------------------------------

  const panMatch = text.match(
    /[A-Z]{5}[0-9]{4}[A-Z]/i
  );

  // --------------------------------
  // GSTIN
  // --------------------------------

  const gstMatch = text.match(
    /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z][0-9A-Z]/i
  );

  // --------------------------------
  // Annual Turnover
  // --------------------------------

  let annualTurnover = null;

  const averageTurnoverMatch = text.match(
    /average\s+annual\s+turnover[\s\S]{0,50}?(?:₹|Rs\.?|INR)?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
  );

  if (averageTurnoverMatch) {

    let amount = Number(averageTurnoverMatch[1]);

    const unit =
      (averageTurnoverMatch[2] || "").toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      amount *= 10000000;
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      amount *= 100000;
    }

    annualTurnover = Math.round(amount);
  }

  // Fallback turnover extraction

  if (annualTurnover === null) {

    const turnoverMatch = text.match(
      /turnover[\s\S]{0,50}?(?:₹|Rs\.?|INR)?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
    );

    if (turnoverMatch) {

      let amount = Number(turnoverMatch[1]);

      const unit =
        (turnoverMatch[2] || "").toLowerCase();

      if (
        unit === "cr" ||
        unit === "crore" ||
        unit === "crores"
      ) {
        amount *= 10000000;
      }

      if (
        unit === "lakh" ||
        unit === "lakhs"
      ) {
        amount *= 100000;
      }

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

    const value =
      netWorthMatch[1].toLowerCase();

    if (
      value === "positive" ||
      value === "yes"
    ) {
      positiveNetWorth = true;
    }

    else if (
      value === "negative" ||
      value === "no"
    ) {
      positiveNetWorth = false;
    }
  }

  // --------------------------------
  // Solvency Amount
  // --------------------------------

  let solvencyAmount = null;

  const solvencyMatch = normalizedText.match(
    /solvency\s+(?:certificate\s+)?(?:amount|value)?\s*:?\s*(?:₹|Rs\.?|INR)?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
  );

  if (solvencyMatch) {

    let amount =
      Number(solvencyMatch[1]);

    const unit =
      (solvencyMatch[2] || "").toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      amount *= 10000000;
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      amount *= 100000;
    }

    solvencyAmount =
      Math.round(amount);
  }

  // --------------------------------
  // Solvency Date
  // --------------------------------

  let solvencyDate = null;

  const solvencyDateMatch =
    normalizedText.match(
      /solvency[\s\S]{0,100}?(?:dated|date)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i
    );

  if (solvencyDateMatch) {

    solvencyDate =
      solvencyDateMatch[1];
  }

  // --------------------------------
  // Registered Experience
  // --------------------------------

  const experienceMatch =
    text.match(
      /years\s+of\s+experience\s+declared\s+(\d+)\s*years?/i
    ) ||
    text.match(
      /(\d+)\s*years?\s+(?:of\s+)?experience/i
    ) ||
    text.match(
      /experience[\s\S]{0,50}?(\d+)\s*years?/i
    );

  // --------------------------------
  // Similar Work Orders
  // --------------------------------

  const workOrdersMatch =
    text.match(
      /(\d+)\s+similar\s+work\s+orders?\s+completed/i
    );

  const similarWorkOrders =
    workOrdersMatch
      ? Number(workOrdersMatch[1])
      : null;

  // --------------------------------
  // Individual Work Order Values
  // --------------------------------

  // Current bidder document only provides
  // the number of work orders and largest
  // order value.

  const workOrders = [];

  // --------------------------------
  // Largest Single Order Value
  // --------------------------------

  const largestOrderMatch =
    text.match(
      /largest\s+single\s+order\s+value[\s\S]{0,30}?(?:₹|Rs\.?|INR)?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
    );

  let largestOrderValue = null;

  if (largestOrderMatch) {

    let amount =
      Number(largestOrderMatch[1]);

    const unit =
      (largestOrderMatch[2] || "").toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      amount *= 10000000;
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      amount *= 100000;
    }

    largestOrderValue =
      Math.round(amount);
  }

  // --------------------------------
  // Return Extracted Data
  // --------------------------------

  return {

    // Identity

    pan: panMatch
      ? panMatch[0].toUpperCase()
      : null,

    gst: gstMatch
      ? gstMatch[0].toUpperCase()
      : null,

    // Legal Entity

    legalEntity: (() => {

      const match =
        normalizedText.match(
          /constitution\s*:?\s*(private\s*limited\s*company|public\s*limited\s*company|llp|partnership\s*firm|proprietorship)/i
        );

      return match
        ? match[1].trim()
        : null;

    })(),

    // Financial

    annualTurnover,

    positiveNetWorth,

    solvencyAmount,

    solvencyDate,

    // Experience

    experienceYears:
      experienceMatch
        ? Number(experienceMatch[1])
        : null,

    similarWorkOrders,

    workOrders,

    largestOrderValue,

    // Statutory Compliance

    epfoRegistered:
      /EPFO\s+Details/i.test(text),

    esicRegistered:
      /ESIC\s+Details/i.test(text),

    digilockerVerified:
      /DigiLocker\s+Documents/i.test(text),

    debarred:
      (() => {

        const match =
          normalizedText.match(
            /debarred\s*(yes|no)/i
          );

        if (!match) {
          return null;
        }

        return (
          match[1].toLowerCase() === "yes"
        );

      })()
  };
};


module.exports = {
  extractBidData
};