import cssText from "data-text:./index.css"
import sonnerCssText from "data-text:./sonner.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { Fragment, useCallback, useEffect, useRef, type FC } from "react"
import { toast, Toaster } from "sonner"
import { getCache } from "src/utils"

import { Button } from "~components/ui/button"
import { EXTENSION_ID } from "~constants"
import type { Rule } from "~devtools/panels"

type MessageHandler = Parameters<typeof chrome.runtime.onMessage.addListener>[0]

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
    .replaceAll(":root", ":root,:host(plasmo-csui)")
    .concat(sonnerCssText)
  return style
}

// 进行 content_scripts 的配置
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const Contents: FC<PlasmoCSUIProps> = ({ anchor }) => {
  // 初始化
  const init = async () => {
    const cacheData = await getCache()
  }

  const messageHandler = useCallback<MessageHandler>((messageJSON, sender) => {
    if (sender.id === EXTENSION_ID) {
      const data: Rule[] = JSON.parse(messageJSON)
    }
  }, [])

  useEffect(() => {
    init()

    const head = document.querySelector("head")
    const style = document.createElement("style")
    style.id = "rozone"
    style.textContent = cssText
    head.appendChild(style)

    chrome.runtime.onMessage.addListener(messageHandler)

    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler)
    }
  }, [])

  return (
    <Fragment>
      <Toaster
        closeButton
        richColors
        visibleToasts={Infinity}
        position="top-right"
        duration={Infinity}
        expand
      />
      <Button
        onClick={() => {
          toast.error("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM"
          })
        }}>
        click
      </Button>
    </Fragment>
  )
}

export default Contents
