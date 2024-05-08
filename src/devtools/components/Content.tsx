import { Fragment, useEffect, useState, type FC } from "react"

import type { Rule } from "~devtools/panels"

import Split from "./common/Split"
import { Input } from "./ui/input"

interface ContentProps {
  data?: Rule
  onEdit?: (value: string) => void
}

const Content: FC<ContentProps> = ({ data, onEdit }) => {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(data?.label)

  const escapeEdit = () => {
    setEditing(false)
  }

  useEffect(() => {
    setValue(data?.label)
  }, [data?.label])

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="h-10 px-4 flex items-center line-clamp-1 text-[14px] font-medium justify-between"
        onDoubleClick={() => data?.label && setEditing(true)}>
        {editing ? (
          <Input
            value={value}
            className="w-full h-full rounded-none border-none px-0 !ring-transparent"
            placeholder="esc to exit or enter to ok"
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onBlur={escapeEdit}
            onKeyUp={({ key, currentTarget }) => {
              switch (key) {
                case "Escape":
                  escapeEdit()
                  break
                case "Enter":
                  if (value) {
                    onEdit?.(value)
                  }
                  escapeEdit()
                  break
                default:
                  break
              }
            }}
          />
        ) : data?.label ? (
          <Fragment>
            {data?.label}
            <div className="text-muted-foreground text-[12px] font-normal pointer-events-none">
              双击编辑
            </div>
          </Fragment>
        ) : (
          ""
        )}
      </div>
      <Split />
      <div className="flex-1 p-2"></div>
    </div>
  )
}

export default Content
