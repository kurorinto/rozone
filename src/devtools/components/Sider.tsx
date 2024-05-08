import { Command, Plus, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type FC } from "react"

import type { Rule } from "~devtools/panels"

import Split from "./common/Split"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface SiderProps {
  current: number
  data?: Rule[]
  onChange?: (index: number) => void
  onDelete?: (index: number) => void
  onAdd?: (value: string) => void
}

const Sider: FC<SiderProps> = ({
  current,
  data,
  onChange,
  onDelete,
  onAdd
}) => {
  const [adding, setAdding] = useState(false)
  const [addValue, setAddValue] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const escapeAdd = () => {
    setAdding(false)
    setAddValue("")
  }

  const documentKeydownHandler = useCallback((event: KeyboardEvent) => {
    if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
      setAdding(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", documentKeydownHandler)
    return () => {
      document.removeEventListener("keydown", documentKeydownHandler)
    }
  }, [])

  return (
    <div className="flex-[200px] flex-shrink-0 flex-grow-0 flex flex-col">
      <div className="h-10">
        <Input
          value={addValue}
          className={`w-full h-10 rounded-none border-none ${adding ? "" : "hidden"}`}
          autoFocus
          placeholder="esc to exit or enter to ok"
          onBlur={escapeAdd}
          onKeyUp={({ key }) => {
            switch (key) {
              case "Escape":
                escapeAdd()
                break
              case "Enter":
                if (addValue) {
                  onAdd?.(addValue)
                }
                escapeAdd()
                break
              default:
                break
            }
          }}
          onChange={(e) => setAddValue(e.target.value)}
        />
        <Button
          variant="ghost"
          className={`w-full h-10 rounded-none relative ${adding ? "hidden" : ""}`}
          onClick={() => setAdding(true)}>
          <Plus size={14} className="mr-[4px]" />
          <span>添加规则</span>
          <span className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-muted pointer-events-none rounded-sm border border-solid border-border px-1 inline-flex items-center gap-x-0.5 text-[12px]">
            <Command size={12} />K
          </span>
        </Button>
      </div>
      <Split />
      <div
        ref={containerRef}
        className="flex-1 p-2 flex flex-col gap-y-2 overflow-y-auto">
        {data?.map((rule, index) => (
          <div
            key={index}
            className={`h-8 flex-shrink-0 flex-grow-0 rounded-sm px-3 flex items-center justify-between gap-x-2 line-clamp-1 hover:bg-accent group ${current === index ? "bg-primary text-white hover:bg-primary/90" : ""}`}
            onClick={() => index !== current && onChange?.(index)}>
            {rule.label}
            <Trash2
              size={14}
              className="group-hover:visible invisible cursor-pointer"
              onClick={(e) => {
                onDelete?.(index)
                if (index === current && containerRef.current) {
                  containerRef.current.scrollTop = 0
                }
                e.stopPropagation()
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sider
