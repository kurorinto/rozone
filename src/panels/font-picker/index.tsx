import { createRoot } from "react-dom/client"

const RozoneLayer = () => {
  return (
    <>
      <h2 className="bg-[pink]">Font Picker</h2>
      <p>HELLO WORLD</p>
    </>
  )
}

const root = createRoot(document.getElementById("root"))
root.render(<RozoneLayer />)