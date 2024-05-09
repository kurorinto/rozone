import { useCallback, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import Split from "./components/Split"
import Content from "./components/Content"
import Sider from "./components/Sider"

export interface Rule {
  label: string
  value: { mode: "1" | "2"; decs: string }
}

const RozoneLayer = () => {
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0)
  const [rules, setRules] = useState<Rule[]>([])

  const requestCompletedHandler = useCallback(
    (details: chrome.webRequest.WebResponseCacheDetails) => {
      // todo: 拦截类型配置
      const allowsTypes: chrome.webRequest.ResourceType[] = [
        "ping",
        "xmlhttprequest"
      ]
      // 拦截规则匹配
      const isMatched = rules.some(({ value }) =>
        value.mode === "1"
          ? details.url.includes(value.decs)
          : value.mode === "2"
            ? new RegExp(value.decs).test(details.url)
            : false
      )

      if (allowsTypes.includes(details.type) && isMatched) {
        console.log(details, details.responseHeaders)
      }
    },
    [rules]
  )

  useEffect(() => {
    chrome.webRequest.onCompleted.addListener(
      requestCompletedHandler,
      {
        // todo: 拦截网址配置
        urls: ["<all_urls>"]
      },
    )
    return () => {
      chrome.webRequest.onCompleted.removeListener(requestCompletedHandler)
    }
  }, [rules])

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
