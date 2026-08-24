import { useState } from "react"
import ClimewaveWebsite from "./ClimewaveWebsite"
import HVACTool from "./HVACTool.jsx" // your existing App.jsx renamed
import './App.css'

export default function App() {
  const [view, setView] = useState("home")

  if (view === "tool") return <HVACTool setView={setView}/>
  return <ClimewaveWebsite setView={setView}/>
}