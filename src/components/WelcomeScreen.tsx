import React, { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { getPdfResumeContent } from "~utils/fn"

// Define a type for the parsed PDF data
interface PdfData {
  personal_info?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    linkedIn?: string;
    github?: string;
  };
  skills?: {
    languages?: string[];
    web_app_development?: string[];
    technologies?: string[];
  };
  work_experience?: Array<{
    company?: string;
    role?: string;
    location?: string;
    duration?: string;
    responsibilities?: string[];
  }>;
  education?: {
    degree?: string;
    institution?: string;
    location?: string;
    duration?: string;
    cgpa?: string;
  };
  // Other fields from schema
}

const WelcomeScreen = () => {
  const [file, setFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [pdfText, setPdfText] = useState<string>("")
  const [pdfData, setPdfData] = useState<PdfData | null>(null)

  // Fetch and parse PDF when URL is set or changed
  useEffect(() => {
    if (pdfUrl && pdfUrl.trim() !== "") {
      handleParsePdf(pdfUrl);
    }
  }, [pdfUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      // Create a blob URL for the file to parse it
      const fileUrl = URL.createObjectURL(selectedFile);
      handleParsePdf(fileUrl);
    } else if (selectedFile) {
      toast.error("Please select a PDF file")
    }
  }

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPdfUrl(event.target.value)
  }

  const handleParsePdf = async (url: string) => {
    if (!url || url.trim() === "") return;
    
    setIsParsing(true);
    try {
      const response = await fetch(`${process.env.PLASMO_PUBLIC_BACKEND_URL}/parse-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeUrl: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch parsed PDF text");
      }

      const { text } = await response.json();
      setPdfText(text);
      
      // Parse the text to extract structured data
      const parsedData = await getPdfResumeContent(`
        Parse Relevant data according to the given schema:

        ${text}
      `);
      
      setPdfData(parsedData);
      console.log("PDF parsed successfully:", parsedData);
      toast.success("Resume parsed successfully");
    } catch (error) {
      console.error("Error parsing PDF:", error);
      toast.error("Failed to parse PDF");
    } finally {
      setIsParsing(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleUpload = async () => {
    setIsLoading(true)
    
    try {
      if (file) {
        // Convert file to base64 string to avoid blob URL issues when popup closes
        const base64Data = await convertFileToBase64(file)
        
        // Send message to background script
        chrome.runtime.sendMessage(
          { 
            type: "INJECT_PDF", 
            pdfSource: base64Data,
            isBase64: true,
            filename: file.name,
            pdfData: pdfData, // Include parsed PDF data
            pdfText: pdfText // Include raw PDF text
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Runtime error:", chrome.runtime.lastError)
              // If the popup closes, this callback might not execute, but the message is still sent
            } else if (response && response.success) {
              toast.success("Resume upload initiated")
            } else {
              toast.error(response?.error || "Failed to upload resume")
            }
            setIsLoading(false)
          }
        )
        
        // Show immediate feedback
        toast.success("Upload started - you can close this popup")
      } else if (pdfUrl) {
        // Send message to background script
        chrome.runtime.sendMessage(
          { 
            type: "INJECT_PDF", 
            pdfSource: pdfUrl,
            isBase64: false,
            pdfData: pdfData, // Include parsed PDF data
            pdfText: pdfText // Include raw PDF text
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Runtime error:", chrome.runtime.lastError)
              // If the popup closes, this callback might not execute, but the message is still sent
            } else if (response && response.success) {
              toast.success("Resume upload initiated")
            } else {
              toast.error(response?.error || "Failed to upload resume")
            }
            setIsLoading(false)
          }
        )
        
        // Show immediate feedback
        toast.success("Upload started - you can close this popup")
      } else {
        toast.error("Please select a PDF file or enter a URL")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error uploading PDF:", error)
      toast.error("An error occurred during upload")
      setIsLoading(false)
    }
  }

  return (
    <div className="welcome-screen">
      <h1>
        Welcome to <a href="https://www.plasmo.com">AutoApply</a>!
      </h1>
      <p>This Chrome extension helps you apply to jobs on Greenhouse and Lever.</p>
      {/* <p><strong>Testing Mode Enabled:</strong> Works on any website for testing</p> */}
      
      <div className="upload-section">
        {/* <div className="file-input-container">
          <label htmlFor="pdf-upload" className="file-label">Choose PDF Resume</label>
          <input 
            id="pdf-upload" 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            className="file-input" 
          />
          {file && <span className="file-name">{file.name}</span>}
          {isParsing && <span className="parsing-status">Parsing resume...</span>}
        </div> */}
        
        <div className="url-input-container">
          <p>Or enter PDF URL:</p>
          <input 
            type="text" 
            value={pdfUrl} 
            onChange={handleUrlChange} 
            placeholder="https://example.com/resume.pdf"
            className="url-input"
          />
        </div>
        
        {pdfData && (
          <div className="data-preview">
            <p><strong>Resume data parsed:</strong> {pdfData.personal_info?.name}</p>
          </div>
        )}
        
        <button 
          className="primary-button" 
          onClick={handleUpload} 
          disabled={isLoading || isParsing || (!file && !pdfUrl)}
        >
          {isLoading ? "Uploading..." : isParsing ? "Parsing..." : "Upload Resume & Start Applying"}
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen 