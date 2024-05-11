import cssText from "data-text:./index.css"
import sonnerCssText from "data-text:./sonner.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { Fragment, useCallback, useEffect, useState, type FC } from "react"
import { toast, Toaster } from "sonner"

import type { Rule } from "~devtools/panels"
import { getCache, isSelfExtension, type RozoneStorage } from "~utils"

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

const Contents: FC<PlasmoCSUIProps> = () => {
  const [rules, setRules] = useState<Rule[]>([])

  const init = async () => {
    const cacheData = await getCache()
    setRules(cacheData.rules || [])
  }

  const windowMessageHandler = useCallback(
    (e: MessageEvent<XHRMessageData>) => {
      const xhrInfo = e.data
      // 拦截规则匹配
      const rule = rules.find(
        ({ value }) =>
          value.decs &&
          (value.mode === "1"
            ? xhrInfo.url.includes(value.decs)
            : value.mode === "2"
              ? new RegExp(value.decs).test(xhrInfo.url)
              : false)
      )
      if (rule) {
        const responseData = JSON.parse(xhrInfo.response) as Object
        // 先写死我们自己的接口
        if (responseData.hasOwnProperty("success")) {
          if (!responseData["success" as keyof typeof responseData]) {
            // 拦截 失败的请求 toast提示
            toast.error(xhrInfo.url, {
              description: `
                <span class="font-medium">XRequestID:</span>
                <span>${xhrInfo.xRequestId}</span><br />
                <span class="font-medium">RequestBody:</span>
                <span>${xhrInfo.requestBody}</span><br />
                <span class="font-medium">ResponseBody:</span>
                <span>${xhrInfo.response}</span>`
            })
            // 发消息给 devtools 页面
            chrome.runtime.sendMessage(JSON.stringify({ rule, xhrInfo }))
          }
        }
      }
    },
    [rules]
  )

  const chromeMessageHandler = useCallback<MessageHandler>(
    (messageJSON, sender) => {
      if (isSelfExtension(sender)) {
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
        toastOptions={{
          classNames: {
            toast: "items-start leading-[20px]",
            icon: "mt-[3px]",
            title: "leading-[22px] text-[16px] break-all",
            description:
              "leading-[20px] max-h-[150px] overflow-y-auto break-all"
          }
        }}
        visibleToasts={Infinity}
        position="top-right"
        duration={Infinity}
        expand
      />
    </Fragment>
  )
}

export default Contents
