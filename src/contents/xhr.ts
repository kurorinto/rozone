import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

export interface XHRMessageData {
  url: string
  requestBody: string
  xRequestId: string
  response: string
  timestamp: string
}

function absolutelyUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//") ? url : location.origin + url;
}

function convertHeadersToObject(headersString) {
  let headersArray = headersString.trim().split('\n');
  let headersObject = {};

  headersArray.forEach(header => {
    let [key, value] = header.split(': ');
    headersObject[key] = value;
  });

  return headersObject;
}

window.addEventListener("load", () => {
  // 重写ajax方法，以便在请求结束后通知content_script
  // inject_script无法直接与background通信，所以先传到content_script，再通过他传到background
  (function (xhr) {
    const XHR = xhr.prototype;
    const open = XHR.open;
    const send = XHR.send;

    // 对open进行patch 获取url和method
    XHR.open = function (method, url) {
      this._method = method;
      this._url = absolutelyUrl(url);
      return open.apply(this, arguments);
    };
    // 同send进行patch 获取responseData.
    XHR.send = function (postData) {
      this.addEventListener('load', async function () {
        if (this._url) {
          if (this.responseType != 'blob' && this.responseText) {
            // responseText is string or null
            try {
              const arr = this.responseText;
              const headers = convertHeadersToObject(this.getAllResponseHeaders());
              // 发送给content-ui
              window.postMessage({ url: this._url, requestBody: postData, xRequestId: headers['x-request-id'], response: arr, timestamp: Date.now() }, '*');
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