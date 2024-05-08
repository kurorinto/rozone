// @ts-ignore
import fontPickerHTML from "./panels.html"

chrome.devtools.panels.create(
  "Rozone layer",
  null,
  // See: https://github.com/PlasmoHQ/plasmo/issues/106#issuecomment-1188539625
  fontPickerHTML.split("/").pop()
)

function IndexDevtools() {
  return null
}

export default IndexDevtools
