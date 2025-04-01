/**
 * Form filler utility for job applications
 * This mimics the functionality in the Greenhouse.jsx component
 */

interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
}

interface PdfData {
  personal_info?: PersonalInfo;
  // Other fields as needed
}

/**
 * Fills form fields on the current page using PDF data
 * Works in content scripts
 * @param pdfData The parsed PDF data
 */
export const fillFormFields = (pdfData: PdfData) => {
  console.log("Filling form fields with PDF data:", pdfData);
  
  // Extract personal info
  const personalInfo = pdfData?.personal_info || {};
  
  // Map data fields to form field IDs for common job application forms
  const fieldMapping = {
    firstName: {
      value: extractFirstName(personalInfo.name || ""),
      selectors: ["#first_name", "input[name='first_name']", "input[placeholder*='First Name']"]
    },
    lastName: {
      value: extractLastName(personalInfo.name || ""),
      selectors: ["#last_name", "input[name='last_name']", "input[placeholder*='Last Name']"]
    },
    email: {
      value: personalInfo.email || "",
      selectors: ["#email", "input[name='email']", "input[type='email']", "input[placeholder*='Email']"]
    },
    phone: {
      value: personalInfo.phone || "",
      selectors: ["#phone", "input[name='phone']", "input[type='tel']", "input[placeholder*='Phone']"]
    },
    website: {
      value: personalInfo.website || "",
      selectors: ["#website", "input[name='website']", "input[placeholder*='Website']"]
    },
    linkedIn: {
      value: personalInfo.linkedIn || "",
      selectors: ["#linkedin", "input[name='linkedin']", "input[placeholder*='LinkedIn']"]
    },
    github: {
      value: personalInfo.github || "",
      selectors: ["#github", "input[name='github']", "input[placeholder*='GitHub']"]
    }
  };
  
  // Fill in each field
  Object.values(fieldMapping).forEach(field => {
    if (!field.value) return;
    
    // Try each selector until we find a match
    for (const selector of field.selectors) {
      const element = document.querySelector(selector) as HTMLInputElement;
      if (element) {
        element.value = field.value;
        // Trigger input event to ensure any event listeners are notified
        const inputEvent = new Event("input", { bubbles: true });
        element.dispatchEvent(inputEvent);
        break;
      }
    }
  });
};

/**
 * Get PDF data that was previously parsed
 * This function must be called in a content script
 */
export const getPdfData = async (): Promise<PdfData | null> => {
  return new Promise((resolve) => {
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

/**
 * Get PDF text that was previously parsed
 * This function must be called in a content script
 */
export const getPdfText = async (): Promise<string> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "GET_PDF_DATA" },
      (response) => {
        if (response && response.success) {
          resolve(response.pdfText || "");
        } else {
          console.error("Failed to get PDF text");
          resolve("");
        }
      }
    );
  });
};

/**
 * Helper functions for name parsing
 */
function extractFirstName(fullName: string): string {
  return fullName.split(' ')[0] || "";
}

function extractLastName(fullName: string): string {
  const parts = fullName.split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : "";
} 