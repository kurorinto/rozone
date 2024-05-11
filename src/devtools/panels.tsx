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
  const [currentRuleId, setCurrentRuleId] = useState(0)
  const currentId = useRef(0)
  const [rules, setRules] = useState<Rule[]>([])

  const init = async () => {
    const cacheData = await getCache()
    setRules(cacheData.rules || [])
    currentId.current = cacheData.currentId || 0
    setCurrentRuleId(cacheData.rules ? cacheData.rules[0]?.id : 0)
  }

  const runtimeMessageHandler: MessageHandler = (messageJSON, sender) => {
    if (isSelfExtension(sender)) {
      const data = JSON.parse(messageJSON) as {
        rule: Rule
        xhrInfo: XHRMessageData
      }
      setRules((prev) =>
        prev.map((item) => {
          if (item.id === data.rule.id) {
            item.records?.length
              ? item.records.push(data.xhrInfo)
              : (item.records = [data.xhrInfo])
          }
          return item
        })
      )
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
        currentId={currentRuleId}
        data={rules}
        onChange={setCurrentRuleId}
        onAdd={(value) => {
          setRules((prev) => [
            ...prev,
            {
              id: ++currentId.current,
              label: value,
              value: { mode: "1", decs: "" }
            }
          ])
          setCurrentRuleId(currentId.current)
        }}
        onDelete={(id) => {
          setRules((prev) => prev.filter((item) => item.id !== id))
          setCurrentRuleId((prev) => {
            const prevIndex = rules.findIndex((item) => item.id === prev)
            const currentIndex = rules.findIndex((item) => item.id === id)
            return prevIndex === currentIndex
              ? 0
              : prevIndex > currentIndex
                ? prevIndex - 1
                : prevIndex
          })
        }}
      />
      <Split type="vertical" />
      <Content
        data={rules.find((item) => item.id === currentRuleId)}
        onEdit={(rule) => {
          setRules((prev) =>
            prev.map((item) => (item.id === currentRuleId ? rule : item))
          )
        }}
        onClearRecords={(id) => {
          setRules((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                item.records = []
              }
              return item
            })
          )
        }}
      />
    </div>
  )
}

const root = createRoot(document.getElementById("root"))
root.render(<RozoneLayer />)
