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
  onClearRecords?: (id: number) => void
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

const Content: FC<ContentProps> = ({ data, onEdit, onClearRecords }) => {
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
    <div className="flex-1 flex flex-col h-full">
      <div
        className="h-10 flex-shrink-0 flex-grow-0 px-4 flex items-center line-clamp-1 text-[14px] font-medium justify-between"
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
      <div className="flex-1 py-2 h-[calc(100%-2.5rem-1px)]">
        <div className="flex px-2 items-center gap-x-2 h-[36px]">
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
        {data ? (
          <Fragment>
            <div className="h-[20px] leading-[20px] flex items-center px-2 mt-4">
              <div
                className="inline-flex h-full items-center text-[14px] cursor-pointer"
                onClick={() => onClearRecords?.(data.id)}>
                <Ban size={16} className="mr-1 rotate-180" /> 清空
              </div>
            </div>
            <div className="mt-1 flex flex-col gap-y-1 px-2 h-[calc(100%-36px-20px-1rem)] overflow-y-auto">
              {data?.records?.map((record, index) => (
                <div
                  key={index}
                  className="rounded border border-solid border-border p-1 break-all">
                  <div>{record.url}</div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">XRequestId:</span>{" "}
                    {record.xRequestId}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">RequestBody:</span>{" "}
                    {record.requestBody}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">ResponseBody:</span>{" "}
                    {record.response}
                  </div>
                </div>
              )) || <div className="text-muted-foreground">暂无拦截记录</div>}
            </div>
          </Fragment>
        ) : null}
      </div>
    </div>
  )
}

export default Content
