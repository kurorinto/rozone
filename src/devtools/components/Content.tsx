import type { FC } from "react"

import type { Rule } from "~devtools/panels"
import Split from "./common/Split"

interface ContentProps {
  data?: Rule
}

const Content: FC<ContentProps> = ({ data }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-10 px-4 flex items-center line-clamp-1 text-[14px] font-medium">
        {data?.label}
      </div>
      <Split />
      <div className="flex-1 p-2">

      </div>
    </div>
  )
}

export default Content
