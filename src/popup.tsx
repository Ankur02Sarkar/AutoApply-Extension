import { useState, useEffect } from "react"
import { Toaster } from "react-hot-toast"
import WelcomeScreen from "./components/WelcomeScreen"
import NotSupportedScreen from "./components/NotSupportedScreen"
import { isSupportedDomain } from "./utils/domainChecker"
import "./style.css"

function IndexPopup() {
  const [currentUrl, setCurrentUrl] = useState<string>("")
  const [isSupported, setIsSupported] = useState<boolean>(false)

  useEffect(() => {
    // Get the URL of the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url || ""
      setCurrentUrl(url)
      setIsSupported(isSupportedDomain(url))
    })
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        width: "300px",
      }}>
      <Toaster position="top-center" />
      {isSupported ? <WelcomeScreen /> : <NotSupportedScreen />}
    </div>
  )
}

export default IndexPopup
