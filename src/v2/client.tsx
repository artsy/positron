import "regenerator-runtime/runtime"
import { App } from "App"
import { createRoot } from "react-dom/client"

// Render your React component instead
const root = createRoot(document.getElementById("root"))
root.render(<App />)

// import { graphql, useFragment } from "react-relay"

// export const Foo = () => {
//   const data = useFragment(FRAGMENT, null)
//   return <div>hey now</div>
// }

// const FRAGMENT = graphql`
//   fragment client on RootQueryType {
//     article(id: "hi") {
//       id
//     }
//   }
// `
