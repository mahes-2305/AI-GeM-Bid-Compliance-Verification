const checkCompliance = (bidData, requirements) => {

  const checks = [];


  // --------------------------------
  // PAN Check
  // --------------------------------

  if (requirements.panRequired) {

    checks.push({
      requirement: "Valid PAN",
      required: "PAN must be provided",
      actual: bidData.pan || "Not found",
      status: bidData.pan ? "PASS" : "FAIL"
    });

  }


  // --------------------------------
  // GST Check
  // --------------------------------

  if (requirements.gstRequired) {

    checks.push({
      requirement: "Valid GST",
      required: "GST must be provided",
      actual: bidData.gst || "Not found",
      status: bidData.gst ? "PASS" : "FAIL"
    });

  }

    // Legal Entity
  if (requirements.legalEntityRequired) {
    const legalEntity = bidData.legalEntity;

    checks.push({
      requirement: "Valid Legal Entity",
      required: "Company / LLP / Partnership / Proprietorship",
      actual: legalEntity || "Not found",
      status: legalEntity
        ? "PASS"
        : "INSUFFICIENT_DATA"
    });
  }

    // EPFO
  if (requirements.epfoRequired) {
    checks.push({
      requirement: "EPFO Registration",
      required: "EPFO registration required",
      actual: bidData.epfoRegistered
        ? "Registered"
        : "Not registered",
      status: bidData.epfoRegistered
        ? "PASS"
        : "FAIL"
    });
  }

    // ESIC
  if (requirements.esicRequired) {
    checks.push({
      requirement: "ESIC Registration",
      required: "ESIC registration required",
      actual: bidData.esicRegistered
        ? "Registered"
        : "Not registered",
      status: bidData.esicRegistered
        ? "PASS"
        : "FAIL"
    });
  }

    // DigiLocker Verification
  if (requirements.digilockerRequired) {
    checks.push({
      requirement: "DigiLocker Verification",
      required: "Documents must be verified",
      actual: bidData.digilockerVerified
        ? "Verified"
        : "Not verified",
      status: bidData.digilockerVerified
        ? "PASS"
        : "FAIL"
    });
  }

    // Debarment
  if (requirements.debarmentCheckRequired) {
    let debarmentStatus = "INSUFFICIENT_DATA";

    if (bidData.debarred !== null) {
      debarmentStatus = bidData.debarred
        ? "FAIL"
        : "PASS";
    }

    checks.push({
      requirement: "Debarment Status",
      required: "Bidder must not be debarred",
      actual:
        bidData.debarred === null
          ? "No information found"
          : bidData.debarred
            ? "Debarred"
            : "Not debarred",
      status: debarmentStatus
    });
  }


  // --------------------------------
  // Annual Turnover Check
  // --------------------------------

  if (requirements.minTurnover) {

    const turnover =
      Number(bidData.annualTurnover || 0);

    checks.push({

      requirement: "Minimum Annual Turnover",

      required:
        `₹${requirements.minTurnover.toLocaleString("en-IN")}`,

      actual:
        bidData.annualTurnover !== null
          ? `₹${turnover.toLocaleString("en-IN")}`
          : "Not found",

      status:
        turnover >= requirements.minTurnover
          ? "PASS"
          : "FAIL"

    });

  }

  // --------------------------------
// Positive Net Worth Check
// --------------------------------

if (requirements.positiveNetWorthRequired) {

  let netWorthStatus = "INSUFFICIENT_DATA";

  if (bidData.positiveNetWorth !== null) {

    netWorthStatus =
      bidData.positiveNetWorth === true
        ? "PASS"
        : "FAIL";

  }

  checks.push({

    requirement: "Positive Net Worth",

    required:
      "Positive net worth in each of the last 3 financial years",

    actual:
      bidData.positiveNetWorth === null
        ? "Net worth evidence not provided"
        : bidData.positiveNetWorth
          ? "Positive"
          : "Not positive",

    status: netWorthStatus

  });

}


    // Solvency Certificate
  if (requirements.minSolvencyAmount) {

    let solvencyStatus = "INSUFFICIENT_DATA";

    const solvencyAmount =
      bidData.solvencyAmount !== null
        ? Number(bidData.solvencyAmount)
        : null;

    // Check amount
    if (solvencyAmount !== null) {

      if (solvencyAmount < requirements.minSolvencyAmount) {
        solvencyStatus = "FAIL";
      } else if (!bidData.solvencyDate) {
        solvencyStatus = "INSUFFICIENT_DATA";
      } else {

        // Convert DD/MM/YYYY or DD-MM-YYYY to a Date
        const parts = bidData.solvencyDate.split(/[\/-]/);

        const certificateDate = new Date(
          Number(parts[2]),
          Number(parts[1]) - 1,
          Number(parts[0])
        );

        const today = new Date();

        const validityDate = new Date(certificateDate);
        validityDate.setMonth(
          validityDate.getMonth() +
          requirements.solvencyValidityMonths
        );

        if (today <= validityDate) {
          solvencyStatus = "PASS";
        } else {
          solvencyStatus = "FAIL";
        }
      }
    }

    checks.push({
      requirement: "Solvency Certificate",

      required:
        `Minimum ₹${requirements.minSolvencyAmount.toLocaleString("en-IN")} ` +
        `issued within last ${requirements.solvencyValidityMonths} months`,

      actual:
        solvencyAmount !== null
          ? `₹${solvencyAmount.toLocaleString("en-IN")}` +
            (
              bidData.solvencyDate
                ? ` | Date: ${bidData.solvencyDate}`
                : ""
            )
          : "Solvency certificate not provided",

      status: solvencyStatus
    });
  }


  // --------------------------------
  // Registered Experience Check
  // --------------------------------

  if (requirements.minExperienceYears) {

    const experience =
      Number(bidData.experienceYears || 0);

    checks.push({

      requirement:
        "Minimum Registered Experience",

      required:
        `${requirements.minExperienceYears} years`,

      actual:
        bidData.experienceYears !== null
          ? `${experience} years`
          : "Not found",

      status:
        experience >= requirements.minExperienceYears
          ? "PASS"
          : "FAIL"

    });

  }


  // --------------------------------
  // Similar Work Experience
  // --------------------------------

  if (
    requirements.experienceAlternatives &&
    requirements.experienceAlternatives.length > 0
  ) {

    const workOrders =
      Number(bidData.similarWorkOrders || 0);

    const largestOrder =
      Number(bidData.largestOrderValue || 0);


    const alternatives =
      requirements.experienceAlternatives;


    const oneWork =
      alternatives.find(
        option => option.numberOfWorks === 1
      );

    const twoWork =
      alternatives.find(
        option => option.numberOfWorks === 2
      );

    const threeWork =
      alternatives.find(
        option => option.numberOfWorks === 3
      );


    // --------------------------------
    // Check 1-work option
    // --------------------------------

    let oneWorkStatus = "INSUFFICIENT_DATA";

    if (oneWork && bidData.largestOrderValue !== null) {

      oneWorkStatus =
        largestOrder >= oneWork.minimumValue
          ? "PASS"
          : "FAIL";

    }


    // --------------------------------
    // Check 2-work option
    // --------------------------------

    let twoWorkStatus = "INSUFFICIENT_DATA";

    if (
      twoWork &&
      Array.isArray(bidData.workOrders) &&
      bidData.workOrders.length >= 2
    ) {

      const sortedWorks =
        [...bidData.workOrders]
          .map(work => Number(work.value))
          .sort((a, b) => b - a);


      twoWorkStatus =
        sortedWorks[0] >= twoWork.minimumValue &&
        sortedWorks[1] >= twoWork.minimumValue
          ? "PASS"
          : "FAIL";

    }


    // --------------------------------
    // Check 3-work option
    // --------------------------------

    let threeWorkStatus = "INSUFFICIENT_DATA";

    if (
      threeWork &&
      Array.isArray(bidData.workOrders) &&
      bidData.workOrders.length >= 3
    ) {

      const sortedWorks =
        [...bidData.workOrders]
          .map(work => Number(work.value))
          .sort((a, b) => b - a);


      threeWorkStatus =
        sortedWorks[0] >= threeWork.minimumValue &&
        sortedWorks[1] >= threeWork.minimumValue &&
        sortedWorks[2] >= threeWork.minimumValue
          ? "PASS"
          : "FAIL";

    }


    // --------------------------------
    // Overall Similar Work Result
    // --------------------------------

    let similarWorkStatus;

    if (
      oneWorkStatus === "PASS" ||
      twoWorkStatus === "PASS" ||
      threeWorkStatus === "PASS"
    ) {

      similarWorkStatus = "PASS";

    } else if (
      oneWorkStatus === "FAIL" &&
      twoWorkStatus === "FAIL" &&
      threeWorkStatus === "FAIL"
    ) {

      similarWorkStatus = "FAIL";

    } else {

      similarWorkStatus = "INSUFFICIENT_DATA";

    }


    checks.push({

      requirement:
        "Similar Work Experience",

      required:
        alternatives
          .map(option =>
            `${option.numberOfWorks} work(s) >= ₹${option.minimumValue.toLocaleString("en-IN")}`
          )
          .join(" OR "),

      actual:
        `${workOrders} similar work orders found; largest order ₹${largestOrder.toLocaleString("en-IN")}`,

      status:
        similarWorkStatus,

      details: {
        oneWork: oneWorkStatus,
        twoWorks: twoWorkStatus,
        threeWorks: threeWorkStatus
      }

    });

  }


  // --------------------------------
  // Overall Result
  // --------------------------------

  const hasFailure =
    checks.some(
      check => check.status === "FAIL"
    );

  const hasInsufficientData =
    checks.some(
      check => check.status === "INSUFFICIENT_DATA"
    );


  let overallStatus;

  if (hasFailure) {

    overallStatus = "NON-COMPLIANT";

  } else if (hasInsufficientData) {

    overallStatus = "REVIEW_REQUIRED";

  } else {

    overallStatus = "COMPLIANT";

  }


  // --------------------------------
  // Return Result
  // --------------------------------

  return {

    overallStatus,

    totalChecks: checks.length,

    passedChecks:
      checks.filter(
        check => check.status === "PASS"
      ).length,

    failedChecks:
      checks.filter(
        check => check.status === "FAIL"
      ).length,

    insufficientDataChecks:
      checks.filter(
        check => check.status === "INSUFFICIENT_DATA"
      ).length,

    checks

  };

};


module.exports = {
  checkCompliance
};