// @ts-ignore
import rozoneHTML from "./panels.html"

chrome.devtools.panels.create(
  "Rozone",
  null,
  // See: https://github.com/PlasmoHQ/plasmo/issues/106#issuecomment-1188539625
  rozoneHTML.split("/").pop()
)

function IndexDevtools() {
  return null
}

export default IndexDevtools
