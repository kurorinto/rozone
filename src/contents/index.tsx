import cssText from "data-text:./index.css"
import sonnerCssText from "data-text:./sonner.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { Fragment, useCallback, useEffect, useState, type FC } from "react"
import { toast, Toaster } from "sonner"

import { DEV_EXTENSION_ID, EXTENSION_ID } from "~constants"
import type { Rule } from "~devtools/panels"
import { getCache, type RozoneStorage } from "~utils"

import type { XHRMessageData } from "./xhr"

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
  const [rules, setRules] = useState<Rule[]>([])

  const init = async () => {
    const cacheData = await getCache()
    setRules(cacheData.rules || [])
  }

  const windowMessageHandler = useCallback(
    (e: MessageEvent<XHRMessageData>) => {
      const messageData = e.data
      // 拦截规则匹配
      const isMatched = rules.some(
        ({ value }) =>
          value.decs &&
          (value.mode === "1"
            ? messageData.url.includes(value.decs)
            : value.mode === "2"
              ? new RegExp(value.decs).test(messageData.url)
              : false)
      )
      if (isMatched) {
        const responseData = JSON.parse(messageData.response) as Object
        // 先写死我们自己的接口
        if (responseData.hasOwnProperty("success")) {
          if (!responseData["success" as keyof typeof responseData]) {
            toast.error(messageData.url, {
              description: messageData.response
            })
          }
        }
      }
    },
    [rules]
  )

  const chromeMessageHandler = useCallback<MessageHandler>(
    (messageJSON, sender) => {
      if (
        sender.id ===
        (process.env.NODE_ENV === "development"
          ? DEV_EXTENSION_ID
          : EXTENSION_ID)
      ) {
        const data = JSON.parse(messageJSON) as RozoneStorage
        setRules(data.rules)
      }
    },
    []
  )

  useEffect(() => {
    window.addEventListener("message", windowMessageHandler)
    return () => {
      window.removeEventListener("message", windowMessageHandler)
    }
  }, [windowMessageHandler])

  useEffect(() => {
    init()

    chrome.runtime.onMessage.addListener(chromeMessageHandler)
    return () => {
      chrome.runtime.onMessage.removeListener(chromeMessageHandler)
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
      {/* <Button
        onClick={() => {
          toast.error("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM"
          })
        }}>
        click
      </Button> */}
    </Fragment>
  )
}

export default Contents
