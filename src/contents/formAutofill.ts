import { fillFormFields, getPdfData } from "~utils/formFiller";

/**
 * This content script runs in the context of job application pages
 * It will detect form fields and autofill them using the parsed PDF data
 */

console.log("AutoApply form autofill content script loaded");

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Form autofill received message:", message);

  if (message.type === "AUTOFILL_FORM") {
    handleFormAutofill()
      .then(() => sendResponse({ success: true }))
      .catch((error) => {
        console.error("Error in form autofill:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Handle PDF upload complete
document.addEventListener("AutoApply:PDFUploaded", async () => {
  console.log("PDF upload detected, attempting to autofill form");
  await handleFormAutofill();
});

/**
 * Autofill the form with parsed PDF data
 */
async function handleFormAutofill() {
  console.log("Attempting to autofill form with PDF data");
  
  try {
    // Retrieve the PDF data from background script
    const pdfData = await getPdfData();
    
    if (!pdfData) {
      console.warn("No PDF data available for form autofill");
      return;
    }
    
    console.log("Retrieved PDF data for form filling:", pdfData);
    
    // Fill the form fields
    fillFormFields(pdfData);
    
    console.log("Form autofill completed");
  } catch (error) {
    console.error("Error in form autofill:", error);
  }
}

// Check if we have a form to fill and try to autofill it automatically
async function checkForForm() {
  // Check for common job application form elements
  const hasForm = 
    document.querySelector("input[name='first_name']") || 
    document.querySelector("input[name='last_name']") ||
    document.querySelector("input[name='email']") ||
    document.querySelector("#first_name") ||
    document.querySelector("#last_name") ||
    document.querySelector("#email");
    
  if (hasForm) {
    console.log("Job application form detected, attempting to autofill");
    await handleFormAutofill();
  }
}

// Wait for the page to fully load
window.addEventListener("load", () => {
  // Wait a bit for dynamic content to load
  setTimeout(checkForForm, 1000);
});

// Also run on DOM content loaded for faster response
document.addEventListener("DOMContentLoaded", () => {
  // Wait a bit for form fields to be ready
  setTimeout(checkForForm, 500);
}); 