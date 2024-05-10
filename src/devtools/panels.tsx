import { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import type { XHRMessageData } from "~contents/xhr"
import {
  getCache,
  isSelfExtension,
  sendMessageToContent,
  setCache
} from "~utils"

import Content from "./components/Content"
import Sider from "./components/Sider"
import Split from "./components/Split"

export interface Rule {
  id: number
  label: string
  value: { mode: "1" | "2"; decs: string }
  records?: XHRMessageData[]
}

type MessageHandler = Parameters<typeof chrome.runtime.onMessage.addListener>[0]

const RozoneLayer = () => {
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0)
  const currentId = useRef(0)
  const [rules, setRules] = useState<Rule[]>([])

  const init = async () => {
    const cacheData = await getCache()
    setRules(cacheData.rules || [])
    currentId.current = cacheData.currentId || 0
  }

  const runtimeMessageHandler: MessageHandler = (messageJSON, sender) => {
    if (isSelfExtension(sender)) {
      // todo
      const data = JSON.parse(messageJSON)
      setRules(data.rules)
    }
  }

  useEffect(() => {
    sendMessageToContent({ rules })
    setCache({ rules, currentId: currentId.current })
    console.log(rules, currentId.current)
  }, [rules])

  useEffect(() => {
    init()

    chrome.runtime.onMessage.addListener(runtimeMessageHandler)
    return () => {
      chrome.runtime.onMessage.removeListener(runtimeMessageHandler)
    }
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
            {
              id: ++currentId.current,
              label: value,
              value: { mode: "1", decs: "" }
            }
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
