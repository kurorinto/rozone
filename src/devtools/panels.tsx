import { useCallback, useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import Split from "./components/common/Split"
import Content from "./components/Content"
import Sider, { type SiderRef } from "./components/Sider"

export interface Rule {
  label: string
  value: string
}

const RozoneLayer = () => {
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0)
  const [rules, setRules] = useState<Rule[] | undefined>()
  const siderRef = useRef<SiderRef>(null)

  const documentKeydownHandler = useCallback((event: KeyboardEvent) => {
    if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
      siderRef.current?.focus()
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", documentKeydownHandler)
    return () => {
      document.removeEventListener("keydown", documentKeydownHandler)
    }
  }, [])

  return (
    <div className="w-full h-full flex">
      <Sider
        ref={siderRef}
        current={currentRuleIndex}
        data={rules}
        onChange={setCurrentRuleIndex}
        onAdd={(value) => {
          setRules((prev) => [...(prev || []), { label: value, value }])
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
      <Content data={rules?.[currentRuleIndex]} />
    </div>
  )
}

const root = createRoot(document.getElementById("root"))
root.render(<RozoneLayer />)
