import { useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import { getCache, sendMessageToContent, setCache } from "~utils"

import Content from "./components/Content"
import Sider from "./components/Sider"
import Split from "./components/Split"

export interface Rule {
  label: string
  value: { mode: "1" | "2"; decs: string }
}

const RozoneLayer = () => {
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0)
  const [rules, setRules] = useState<Rule[]>([])

  const init = async () => {
    const cacheData = await getCache()
    setRules(cacheData.rules || [])
  }

  useEffect(() => {
    sendMessageToContent({ rules })
  }, [rules])

  useEffect(() => {
    setCache({ rules })
  }, [rules])

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="w-full h-full flex">
      <Sider
        current={currentRuleIndex}
        data={rules}
        onChange={setCurrentRuleIndex}
        onAdd={(value) => {
          setRules((prev) => [
            ...prev,
            { label: value, value: { mode: "1", decs: "" } }
          ])
          setCurrentRuleIndex(rules.length)
        }}
        onDelete={(index) => {
          setRules((prev) => prev.filter((_, i) => i !== index))
          setCurrentRuleIndex((prev) =>
            prev === index ? 0 : prev > index ? prev - 1 : prev
          )
        }}
      />
      <Split type="vertical" />
      <Content
        data={rules[currentRuleIndex]}
        onEdit={(rule) => {
          setRules((prev) => {
            const newRules = [...prev]
            newRules[currentRuleIndex] = rule
            return newRules
          })
        }}
      />
    </div>
  )
}

const root = createRoot(document.getElementById("root"))
root.render(<RozoneLayer />)
