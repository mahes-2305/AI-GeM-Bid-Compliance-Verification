const tenderInput = document.getElementById("tenderInput");
const bidderInput = document.getElementById("bidderInput");

const tenderFileName = document.getElementById("tenderFileName");
const bidderFileName = document.getElementById("bidderFileName");

const uploadButton = document.getElementById("uploadButton");
const status = document.getElementById("status");
const result = document.getElementById("result");


// --------------------------------
// Show selected tender file
// --------------------------------

tenderInput.addEventListener("change", () => {

  if (tenderInput.files.length > 0) {
    tenderFileName.textContent =
      tenderInput.files[0].name;
  } else {
    tenderFileName.textContent =
      "No tender document selected";
  }

});


// --------------------------------
// Show selected bidder file
// --------------------------------

bidderInput.addEventListener("change", () => {

  if (bidderInput.files.length > 0) {
    bidderFileName.textContent =
      bidderInput.files[0].name;
  } else {
    bidderFileName.textContent =
      "No bidder document selected";
  }

});


// --------------------------------
// Verify button
// --------------------------------

uploadButton.addEventListener("click", async () => {

  const tenderFile =
    tenderInput.files[0];

  const bidderFile =
    bidderInput.files[0];


  // Check tender document

  if (!tenderFile) {

    status.textContent =
      "Please select a tender document.";

    return;
  }


  // Check bidder document

  if (!bidderFile) {

    status.textContent =
      "Please select a bidder document.";

    return;
  }


  const formData =
    new FormData();

  formData.append(
    "tenderDocument",
    tenderFile
  );

  formData.append(
    "bidderDocument",
    bidderFile
  );


  try {

    uploadButton.disabled = true;

    uploadButton.textContent =
      "Verifying...";

    status.textContent =
      "Uploading documents...";


    const response =
      await fetch(
        "/api/documents/verify",
        {
          method: "POST",
          body: formData
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Verification failed"
      );

    }


    status.textContent =
      "Compliance verification completed!";


    // --------------------------------
    // Summary
    // --------------------------------

    const compliance =
      data.complianceResult;


    const passed =
      compliance.passedChecks;


    const failed =
      compliance.failedChecks;


    const reviewRequired =
      compliance.insufficientDataChecks || 0;


    // --------------------------------
    // Overall status
    // --------------------------------

    let overallIcon = "";

    if (
      compliance.overallStatus ===
      "NON-COMPLIANT"
    ) {

      overallIcon = "";

    } else if (
      compliance.overallStatus ===
      "REVIEW_REQUIRED"
    ) {

      overallIcon = "";

    }


    // --------------------------------
    // Render result
    // --------------------------------

    result.innerHTML = `

      <h3>Compliance Result</h3>

      <p>
        <strong>Overall Status:</strong>
        ${overallIcon}
        ${compliance.overallStatus}
      </p>


      <p>

        <strong>Passed:</strong>
        ${passed}

        |

        <strong>Failed:</strong>
        ${failed}

        |

        <strong>Review Required:</strong>
        ${reviewRequired}

      </p>


      <hr>


      <h3>Tender Requirements</h3>


      <p>
        <strong>PAN Required:</strong>
        ${
          data.requirements.panRequired
            ? "Yes"
            : "No"
        }
      </p>


      <p>
        <strong>GST Required:</strong>
        ${
          data.requirements.gstRequired
            ? "Yes"
            : "No"
        }
      </p>


      <p>
        <strong>Minimum Turnover:</strong>
        ${
          data.requirements.minTurnover
            ? "₹" +
              data.requirements.minTurnover
                .toLocaleString("en-IN")
            : "Not specified"
        }
      </p>


      <p>
        <strong>Minimum Registered Experience:</strong>
        ${
          data.requirements.minExperienceYears
            ? data.requirements.minExperienceYears +
              " years"
            : "Not specified"
        }
      </p>


      <p>
        <strong>Experience Look-back:</strong>
        ${
          data.requirements.experienceLookbackYears
            ? data.requirements.experienceLookbackYears +
              " years"
            : "Not specified"
        }
      </p>


      <p>
        <strong>Positive Net Worth Required:</strong>
        ${
          data.requirements
            .positiveNetWorthRequired
            ? "Yes"
            : "No"
        }
      </p>


      <p>
        <strong>Minimum Solvency:</strong>
        ${
          data.requirements.minSolvencyAmount
            ? "₹" +
              data.requirements.minSolvencyAmount
                .toLocaleString("en-IN")
            : "Not specified"
        }
      </p>


      <p>
        <strong>Solvency Validity:</strong>
        ${
          data.requirements.solvencyValidityMonths
            ? "Within last " +
              data.requirements.solvencyValidityMonths +
              " months"
            : "Not specified"
        }
      </p>


      <hr>


      <h3>Bidder Information</h3>


      <p>
        <strong>PAN:</strong>
        ${
          data.extractedData.pan ||
          "Not found"
        }
      </p>


      <p>
        <strong>GST:</strong>
        ${
          data.extractedData.gst ||
          "Not found"
        }
      </p>


      <p>
        <strong>Annual Turnover:</strong>
        ${
          data.extractedData.annualTurnover !== null
            ? "₹" +
              data.extractedData.annualTurnover
                .toLocaleString("en-IN")
            : "Not found"
        }
      </p>


      <p>
        <strong>Experience:</strong>
        ${
          data.extractedData.experienceYears !== null
            ? data.extractedData.experienceYears +
              " years"
            : "Not found"
        }
      </p>


      <p>
        <strong>Similar Work Orders:</strong>
        ${
          data.extractedData.similarWorkOrders !== null
            ? data.extractedData.similarWorkOrders
            : "Not found"
        }
      </p>


      <p>
        <strong>Largest Order Value:</strong>
        ${
          data.extractedData.largestOrderValue !== null
            ? "₹" +
              data.extractedData.largestOrderValue
                .toLocaleString("en-IN")
            : "Not found"
        }
      </p>


      <hr>


      <h3>Verification Details</h3>


      ${
        compliance.checks
          .map(check => {

            let statusIcon = "";

            let statusText =
              "REVIEW REQUIRED";


            if (check.status === "PASS") {

              statusIcon = "";
              statusText = "PASS";

            } else if (
              check.status === "FAIL"
            ) {

              statusIcon = "";
              statusText = "FAIL";

            }


            return `

              <p>

                <strong>
                  ${check.requirement}:
                </strong>

                ${statusIcon}
                ${statusText}

                <br>

                Required:
                ${check.required}

                <br>

                Found:
                ${check.actual}

                ${
                  check.details
                    ? `
                      <br>
                      Details:
                      ${
                        typeof check.details === "object"
                          ? `
                            1 work:
                            ${check.details.oneWork}
                            <br>

                            2 works:
                            ${check.details.twoWorks}
                            <br>

                            3 works:
                            ${check.details.threeWorks}
                          `
                          : check.details
                      }
                    `
                    : ""
                }

              </p>

            `;

          })
          .join("")
      }

    `;


    result.classList.add("show");


  } catch (error) {

    status.textContent =
      `Error: ${error.message}`;

    result.classList.remove("show");

  } finally {

    uploadButton.disabled = false;

    uploadButton.textContent =
      "Verify Compliance";

  }

});