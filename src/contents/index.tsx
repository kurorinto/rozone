import cssText from "data-text:./index.css"
import sonnerCssText from "data-text:./sonner.css"
import type { PlasmoCSConfig, PlasmoCSUIProps } from "plasmo"
import { Fragment, useCallback, useEffect, useRef, type FC } from "react"
import { toast, Toaster } from "sonner"
import { getCache } from "src/utils"

import { Button } from "~components/ui/button"
import { DEV_EXTENSION_ID, EXTENSION_ID } from "~constants"
import type { Rule } from "~devtools/panels"
import type { XHRMessageData } from "./xhr"

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
  const messageHandler = useCallback((e: MessageEvent<XHRMessageData>) => {
    const messageData = e.data
    
  }, [])

  useEffect(() => {
    window.addEventListener('message', messageHandler)
    return () => {
      window.removeEventListener('message', messageHandler)
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
