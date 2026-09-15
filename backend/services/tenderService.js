const extractTenderRequirements = (text) => {

  const requirements = {
  panRequired: false,
  gstRequired: false,

  minTurnover: null,

  legalEntityRequired: false,
epfoRequired: false,
esicRequired: false,
digilockerRequired: false,
debarmentCheckRequired: false,

  // Financial requirements
  positiveNetWorthRequired: false,
  minSolvencyAmount: null,
  solvencyValidityMonths: null,

  // Experience requirements
  minExperienceYears: null,
  experienceLookbackYears: null,

  experienceAlternatives: []
};


  // --------------------------------
  // PAN
  // --------------------------------

  if (/\bPAN\b/i.test(text)) {
    requirements.panRequired = true;
  }


  // --------------------------------
  // GST / GSTIN
  // --------------------------------

  if (/\bGST\b|\bGSTIN\b/i.test(text)) {
    requirements.gstRequired = true;
  }

    // Legal entity requirement
  requirements.legalEntityRequired =
    /legal\s+entity|constitution|incorporation|registration/i.test(text);

  // EPFO requirement
  requirements.epfoRequired =
    /EPFO/i.test(text);

  // ESIC requirement
  requirements.esicRequired =
    /ESIC/i.test(text);

  // DigiLocker / verification requirement
  requirements.digilockerRequired =
    /DigiLocker|UDIN|MCA\s+verification/i.test(text);

  // Debarment check
  requirements.debarmentCheckRequired =
    /blacklisting|debarment|debarred/i.test(text);


  // --------------------------------
  // Minimum Annual Turnover
  // --------------------------------

  const turnoverMatch = text.match(
    /minimum\s+turnover[\s\S]{0,100}?(?:₹|Rs\.?|INR)?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)?/i
  );

  if (turnoverMatch) {

    let amount = Number(turnoverMatch[1]);

    const unit = (
      turnoverMatch[2] || ""
    ).toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      amount = Math.round(amount * 10000000);
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      amount = Math.round(amount * 100000);
    }

    requirements.minTurnover = amount;
  }


  // --------------------------------
  // Minimum Registered Experience
  // --------------------------------

  const registeredExperienceMatch = text.match(
    /minimum\s+(\d+)\s*(?:years?|yrs?)\s+of\s+registered\s+experience/i
  );

  if (registeredExperienceMatch) {
    requirements.minExperienceYears =
      Number(registeredExperienceMatch[1]);
  }

  // --------------------------------
// Positive Net Worth Requirement
// --------------------------------

if (
  /positive\s+net\s+worth/i.test(text)
) {
  requirements.positiveNetWorthRequired = true;
}


// --------------------------------
// Solvency Certificate Requirement
// --------------------------------

const solvencyMatch = text.match(
  /solvency\s+certificate[\s\S]{0,150}?(?:₹|Rs\.?|INR)?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)/i
);

if (solvencyMatch) {

  let amount = Number(solvencyMatch[1]);

  const unit =
    (solvencyMatch[2] || "").toLowerCase();

  if (
    unit === "cr" ||
    unit === "crore" ||
    unit === "crores"
  ) {
    amount = Math.round(amount * 10000000);
  }

  if (
    unit === "lakh" ||
    unit === "lakhs"
  ) {
    amount = Math.round(amount * 100000);
  }

  requirements.minSolvencyAmount = amount;
}


// --------------------------------
// Solvency Certificate Validity
// --------------------------------

const solvencyValidityMatch = text.match(
  /solvency\s+certificate[\s\S]{0,200}?within\s+last\s+(\d+)\s+months?/i
);

if (solvencyValidityMatch) {

  requirements.solvencyValidityMonths =
    Number(solvencyValidityMatch[1]);

}


  // --------------------------------
  // Experience Look-back Period
  // --------------------------------

  const lookbackMatch = text.match(
    /experience[\s\S]{0,300}?last\s+(\d+)\s*(?:years?|yrs?)/i
  );

  if (lookbackMatch) {
    requirements.experienceLookbackYears =
      Number(lookbackMatch[1]);
  }


  // --------------------------------
  // Similar Work Requirement
  // --------------------------------

  // Option 1:
  // 1 similar completed work >= ₹2.72 Cr

  const oneWorkMatch = text.match(
    /at\s+least\s+1\s+similar\s+completed\s+work[\s\S]{0,100}?value\s*[≥>=]+\s*₹?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)/i
  );

  if (oneWorkMatch) {

    let value = Number(oneWorkMatch[1]);

    const unit = (
      oneWorkMatch[2] || ""
    ).toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      value = Math.round(value * 10000000);
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      value = Math.round(value * 100000);
    }

    requirements.experienceAlternatives.push({
      numberOfWorks: 1,
      minimumValue: value
    });
  }


  // --------------------------------
  // Option 2:
  // 2 works >= ₹1.7 Cr each
  // --------------------------------

  const twoWorksMatch = text.match(
    /2\s+works[\s\S]{0,50}?≥\s*₹?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)\s*each/i
  );

  if (twoWorksMatch) {

    let value = Number(twoWorksMatch[1]);

    const unit = (
      twoWorksMatch[2] || ""
    ).toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      value = Math.round(value * 10000000);
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      value = Math.round(value * 100000);
    }

    requirements.experienceAlternatives.push({
      numberOfWorks: 2,
      minimumValue: value
    });
  }


  // --------------------------------
  // Option 3:
  // 3 works >= ₹1.36 Cr each
  // --------------------------------

  const threeWorksMatch = text.match(
    /3\s+works[\s\S]{0,50}?≥\s*₹?\s*([\d.]+)\s*(Cr|crore|crores|lakh|lakhs)\s*each/i
  );

  if (threeWorksMatch) {

    let value = Number(threeWorksMatch[1]);

    const unit = (
      threeWorksMatch[2] || ""
    ).toLowerCase();

    if (
      unit === "cr" ||
      unit === "crore" ||
      unit === "crores"
    ) {
      value = Math.round(value * 10000000);
    }

    if (
      unit === "lakh" ||
      unit === "lakhs"
    ) {
      value = Math.round(value * 100000);
    }

    requirements.experienceAlternatives.push({
      numberOfWorks: 3,
      minimumValue: value
    });
  }


  return requirements;
};


module.exports = {
  extractTenderRequirements
};