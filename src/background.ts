import { injectPDFToPage } from "./utils/pdfInject"

// This global persistent variable ensures the service worker stays active
let keepAlive = true;

// Store the parsed PDF data and text
let parsedPdfData = null;
let parsedPdfText = "";

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message)

  if (message.type === "INJECT_PDF") {
    const { pdfSource, isBase64, filename, pdfData, pdfText } = message
    
    // Store the PDF data and text if provided
    if (pdfData) {
      parsedPdfData = pdfData;
      console.log("Stored PDF data:", parsedPdfData);
    }
    
    if (pdfText) {
      parsedPdfText = pdfText;
      console.log("Stored PDF text with length:", parsedPdfText.length);
    }
    
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found.")
        sendResponse({ success: false, error: "No active tab found" })
        return
      }

      const tabId = tabs[0].id
      
      try {
        // Execute the injection script
        chrome.scripting.executeScript(
          {
            target: { tabId: tabId },
            func: injectPDFToPage,
            args: [pdfSource, isBase64, filename || "resume.pdf"],
          },
          (results) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Script execution failed:",
                chrome.runtime.lastError.message
              )
              try {
                sendResponse({ 
                  success: false, 
                  error: chrome.runtime.lastError.message 
                })
              } catch (e) {
                console.error("Failed to send response:", e)
              }
            } else if (results && results[0]?.result) {
              console.log("Upload status:", results[0].result)
              
              try {
                sendResponse({ 
                  success: true, 
                  result: results[0].result 
                })
              } catch (e) {
                console.error("Failed to send response:", e)
              }
              
              // Show notification after successful upload
              chrome.notifications.create({
                type: "basic",
                iconUrl: "/assets/icon.png",
                title: "AutoApply",
                message: "Resume uploaded successfully"
              })
            }
          }
        )
      } catch (error) {
        console.error("Error in executeScript:", error)
        try {
          sendResponse({ success: false, error: "Failed to execute script" })
        } catch (e) {
          console.error("Failed to send response:", e)
        }
      }
    })
    
    // Keep the service worker alive to handle async operations
    setTimeout(() => {
      keepAlive = true;
    }, 20000); // Keep alive for at least 20 seconds
    
    // Return true to indicate that we will send a response asynchronously
    return true
  }
  
  // Handle requests for the PDF data
  if (message.type === "GET_PDF_DATA") {
    sendResponse({ 
      success: true, 
      pdfData: parsedPdfData,
      pdfText: parsedPdfText
    });
    return true;
  }
})

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

// Make sure the service worker doesn't terminate
setInterval(() => {
  if (keepAlive) {
    console.log("Keeping service worker alive");
  }
}, 20000);
