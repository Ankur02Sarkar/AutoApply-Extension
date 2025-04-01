/**
 * This function runs in the context of the target page to inject a PDF file
 * into a resume upload field
 * @param pdfSource URL or base64 data of the PDF file to inject
 * @param isBase64 Whether pdfSource is base64 data
 * @param filename The filename to use for the PDF
 */
export const injectPDFToPage = (pdfSource: string, isBase64 = false, filename = "resume.pdf") => {
  return new Promise((resolve) => {
    // Look for resume upload input in Greenhouse or Lever forms
    let fileInput: HTMLInputElement | null = document.querySelector("input#resume") || 
                    document.querySelector('input[name="resume"]') ||
                    document.querySelector('input[type="file"][accept*="pdf"]') as HTMLInputElement;
                      
    // Create a temporary file input if none is found (for testing purposes)
    let tempInputCreated = false;
    if (!fileInput) {
      console.log("Resume upload field not found! Creating temporary input for testing.");
      
      tempInputCreated = true;
      const tempInput = document.createElement('input');
      tempInput.setAttribute('type', 'file');
      tempInput.setAttribute('accept', 'application/pdf');
      tempInput.setAttribute('style', 'position: fixed; top: 10px; right: 10px; z-index: 9999;');
      document.body.appendChild(tempInput);
      fileInput = tempInput as HTMLInputElement;
    }
    
    // Cast to HTMLInputElement to access files property
    const inputElement = fileInput;

    // After successful upload, add functions to retrieve PDF data later
    const addPdfDataHelper = () => {
      // Inject a helper function in the page to access PDF data
      const helperScript = document.createElement('script');
      helperScript.textContent = `
        // PDF data helper functions
        window.AutoApply = window.AutoApply || {};
        window.AutoApply.getPdfData = async function() {
          return new Promise((resolve) => {
            // Send message to background script to get PDF data
            chrome.runtime.sendMessage(
              { type: "GET_PDF_DATA" },
              (response) => {
                if (response && response.success) {
                  resolve(response.pdfData);
                } else {
                  console.error("Failed to get PDF data");
                  resolve(null);
                }
              }
            );
          });
        };
        
        window.AutoApply.getPdfText = async function() {
          return new Promise((resolve) => {
            // Send message to background script to get PDF text
            chrome.runtime.sendMessage(
              { type: "GET_PDF_DATA" },
              (response) => {
                if (response && response.success) {
                  resolve(response.pdfText);
                } else {
                  console.error("Failed to get PDF text");
                  resolve("");
                }
              }
            );
          });
        };
        
        console.log("AutoApply PDF data helpers injected");
      `;
      document.head.appendChild(helperScript);
    };

    // Function to trigger form autofill
    const triggerFormAutofill = () => {
      // Dispatch an event for the content script to listen for
      const autofillEvent = new CustomEvent('AutoApply:PDFUploaded');
      document.dispatchEvent(autofillEvent);
      
      // Also try to send a message to the content script
      try {
        chrome.runtime.sendMessage({ type: "AUTOFILL_FORM" });
      } catch (e) {
        console.log("Form autofill message not sent - content script may not be active");
      }
    };

    // Process base64 data directly
    if (isBase64) {
      try {
        // Convert base64 to blob
        const base64Response = fetch(pdfSource);
        base64Response.then(res => res.blob())
          .then(blob => {
            const pdfFile = new File([blob], filename, {
              type: "application/pdf",
            });

            // Create a DataTransfer object and attach the file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(pdfFile);
            inputElement.files = dataTransfer.files;

            // Trigger the change event on the input
            const event = new Event("change", { bubbles: true });
            inputElement.dispatchEvent(event);

            console.log("PDF uploaded successfully!");
            if (tempInputCreated) {
              // Alert user about the test mode
              alert(`TEST MODE: PDF "${filename}" was successfully loaded. In a real job application, this would fill the resume field.`);
            }
            
            // Add PDF data helper to the page
            addPdfDataHelper();
            
            // Trigger form autofill
            triggerFormAutofill();
            
            resolve("Success: PDF uploaded.");
          })
          .catch(error => {
            console.error("Failed to process base64 data:", error);
            resolve("Failed: Could not process base64 data.");
          });
      } catch (error) {
        console.error("Error handling base64 data:", error);
        resolve("Failed: Error handling base64 data.");
      }
    }
    // Fetch from URL if not base64
    else if (pdfSource.startsWith("http")) {
      fetch(pdfSource)
        .then((response) => response.blob())
        .then((blob) => {
          const pdfFile = new File([blob], filename, {
            type: "application/pdf",
          });

          // Create a DataTransfer object and attach the file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFile);
          inputElement.files = dataTransfer.files;

          // Trigger the change event on the input
          const event = new Event("change", { bubbles: true });
          inputElement.dispatchEvent(event);

          console.log("PDF uploaded successfully!");
          if (tempInputCreated) {
            // Alert user about the test mode
            alert(`TEST MODE: PDF "${filename}" was successfully loaded. In a real job application, this would fill the resume field.`);
          }
          
          // Add PDF data helper to the page
          addPdfDataHelper();
          
          // Trigger form autofill
          triggerFormAutofill();
          
          resolve("Success: PDF uploaded.");
        })
        .catch((error) => {
          console.error("Failed to fetch the PDF:", error);
          resolve("Failed: Could not fetch the PDF.");
        });
    } 
    // Handle blob URL or other sources
    else {
      fetch(pdfSource)
        .then(response => response.blob())
        .then(blob => {
          const pdfFile = new File([blob], filename, {
            type: "application/pdf",
          });

          // Create a DataTransfer object and attach the file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(pdfFile);
          inputElement.files = dataTransfer.files;

          // Trigger the change event on the input
          const event = new Event("change", { bubbles: true });
          inputElement.dispatchEvent(event);

          console.log("PDF uploaded successfully!");
          if (tempInputCreated) {
            // Alert user about the test mode
            alert(`TEST MODE: PDF "${filename}" was successfully loaded. In a real job application, this would fill the resume field.`);
          }
          
          // Add PDF data helper to the page
          addPdfDataHelper();
          
          // Trigger form autofill
          triggerFormAutofill();
          
          resolve("Success: PDF uploaded.");
        })
        .catch(error => {
          console.error("Failed to process the PDF:", error);
          resolve("Failed: Could not process the PDF.");
        });
    }
  });
}; 