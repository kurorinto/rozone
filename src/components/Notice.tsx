import type { FC } from "react"

interface NoticeProps {
  title?: string
  message?: string
}

const Notice: FC<NoticeProps> = ({ title, message }) => {
  return (
    <div className="w-[356px] p-[16px] bg-background rounded-[6px] shadow border border-solid border-border">
      <div>{title}</div>
      <div>{message}</div>
    </div>
  )
}

export default Notice
