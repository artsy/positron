import { graphql, useFragment } from "react-relay"

export const Foo = () => {
  const data = useFragment(FRAGMENT, null)
  return <div>hey now</div>
}

const FRAGMENT = graphql`
  fragment client on RootQueryType {
    article(id: "hi") {
      id
    }
  }
`
