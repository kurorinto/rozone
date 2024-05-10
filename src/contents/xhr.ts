import type { PlasmoCSConfig } from "plasmo";
import { DEV_EXTENSION_ID, EXTENSION_ID } from "~constants";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

export interface XHRMessageData {
  url: string
  response: string
}

window.addEventListener("load", () => {
  // 重写ajax方法，以便在请求结束后通知content_script
  // inject_script无法直接与background通信，所以先传到content_script，再通过他传到background
  (function (xhr) {
    var XHR = xhr.prototype;
    var open = XHR.open;
    var send = XHR.send;

    // 对open进行patch 获取url和method
    XHR.open = function (method, url) {
      this._method = method;
      this._url = url;
      return open.apply(this, arguments);
    };
    // 同send进行patch 获取responseData.
    XHR.send = function (postData) {
      this.addEventListener('load', async function () {
        var myUrl = this._url ? this._url.toLowerCase() : this._url;
        if (myUrl) {
          if (this.responseType != 'blob' && this.responseText) {
            // responseText is string or null
            try {
              var arr = this.responseText;

              // 发送给background
              // // chrome.extension.
              // // const res = await sendToBackground<MessageResponseRequestBody, MessageResponseResponseBody>({
              // //   name: "response",
              // //   body: { url: this._url, response: arr },
              // //   extensionId: process.env.NODE_ENV === 'development' ? DEV_EXTENSION_ID : EXTENSION_ID // find this in chrome's extension manager
              // // })
              window.postMessage({'url': this._url, "response": arr}, '*');
            } catch (err) {
              console.log(err);
              console.log("Error in responseType try catch");
            }
          }
        }
      });
      return send.apply(this, arguments);
    };
  })(XMLHttpRequest);
})