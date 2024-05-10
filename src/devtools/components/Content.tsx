import debounce from "lodash/debounce"
import { Ban } from "lucide-react"
import {
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FC
} from "react"

import type { Rule } from "~devtools/panels"

import { Input } from "../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select"
import Split from "./Split"

interface ContentProps {
  data?: Rule
  onEdit?: (rule: Rule) => void
}

const selectItems = [
  {
    label: "包含",
    value: "1"
  },
  {
    label: "正则",
    value: "2"
  }
]

const Content: FC<ContentProps> = ({ data, onEdit }) => {
  const [editing, setEditing] = useState(false)
  const [ruleLabel, setRuleLabel] = useState(data?.label)
  const [ruleDesc, setRuleDesc] = useState(data?.value.decs || "")

  const escapeEdit = () => {
    setEditing(false)
  }

  const descChangeHandler = useCallback(
    debounce((e: ChangeEvent<HTMLInputElement>) => {
      onEdit?.({ ...data, value: { ...data?.value, decs: e.target.value } })
    }, 500),
    [data]
  )

  useEffect(() => {
    setRuleLabel(data?.label)
  }, [data?.label])

  useEffect(() => {
    setRuleDesc(data?.value.decs)
  }, [data?.value.decs])

  return (
    <div className="flex-1 flex flex-col">
      <div
        className="h-10 px-4 flex items-center line-clamp-1 text-[14px] font-medium justify-between"
        onDoubleClick={() => data?.label && setEditing(true)}>
        {editing ? (
          <Input
            value={ruleLabel}
            className="w-full h-full rounded-none border-none px-0 !ring-transparent"
            placeholder="esc to exit or enter to ok"
            autoFocus
            onChange={(e) => setRuleLabel(e.target.value)}
            onBlur={escapeEdit}
            onKeyUp={({ key }) => {
              switch (key) {
                case "Escape":
                  escapeEdit()
                  break
                case "Enter":
                  if (ruleLabel) {
                    onEdit?.({ ...data, label: ruleLabel })
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
      <div className="flex-1 p-2">
        <div className="flex items-center gap-x-2">
          {data ? (
            <Fragment>
              <Select
                value={data?.value.mode}
                onValueChange={(value: "1" | "2") => {
                  onEdit?.({ ...data, value: { ...data.value, mode: value } })
                }}>
                <SelectTrigger className="flex-[80px] flex-shrink-0 flex-grow-0">
                  <SelectValue placeholder="选择匹配方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                value={ruleDesc}
                onChange={(e) => {
                  setRuleDesc(e.target.value)
                  descChangeHandler(e)
                }}
              />
            </Fragment>
          ) : null}
        </div>
        <div className="mt-4">
          {data ? (
            <Fragment>
              <div className="inline-flex items-center text-[14px] cursor-pointer">
                <Ban size={16} className="mr-1 rotate-180" /> 清空
              </div>
              <div className="mt-1 flex flex-col gap-y-1">
                {data?.records?.map((record, index) => (
                  <div
                    key={index}
                    className="rounded border border-solid border-border p-1">
                    <div>{record.url}</div>
                    <div className="text-muted-foreground">
                      {record.response}
                    </div>
                  </div>
                )) || <div className="text-muted-foreground">暂无拦截记录</div>}
              </div>
            </Fragment>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Content
