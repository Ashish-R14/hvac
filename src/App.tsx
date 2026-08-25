import { useState } from "react"
import ClimewaveWebsite from "./ClimewaveWebsite"
import HVACTool from "./HVACTool"
import UploadTest from "./UploadTest"
import CityPage from "./pages/CityPage"
import { CITY_PAGES } from "./pages/cityPagesData"
import './App.css'

export default function App() {
  const [view, setView] = useState<string>("home")

  if (typeof window !== "undefined" && window.location.search.includes("upload-test")) {
    return <UploadTest />
  }

  if (typeof window !== "undefined") {
    const pathname = window.location.pathname.endsWith("/") || window.location.pathname === ""
      ? window.location.pathname
      : `${window.location.pathname}/`;
    const cityPage = CITY_PAGES.find(p => p.path === pathname);
    if (cityPage) return <CityPage data={cityPage} />;
  }

  if (view === "tool") return <HVACTool setView={setView}/>
  return <ClimewaveWebsite setView={setView}/>
}