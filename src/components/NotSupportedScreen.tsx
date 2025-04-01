import React from "react"
import "./NotSupportedScreen.css"

const NotSupportedScreen = () => {
  return (
    <div className="not-supported-container">
      <div className="not-supported-card">
        <div className="not-supported-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#ff5252" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="not-supported-title">Not Supported</h2>
        <p className="not-supported-message">
          This extension only works on Greenhouse job application pages.
        </p>
        <button className="not-supported-button" onClick={() => window.history.back()}>
          Go Back
        </button>
      </div>
    </div>
  )
}

export default NotSupportedScreen 