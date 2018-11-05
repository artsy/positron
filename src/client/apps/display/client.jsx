import React from "react"
import ReactDOM from "react-dom"
import { DisplayPanel } from "@artsy/reaction/dist/Components/Publishing/Display/DisplayPanel"
import track from "react-tracking"
const sd = require("sharify").data

@track(
  { is_instant_article: true },
  {
    dispatch: data => {
      const { action, ...rest } = data
      window.analytics.track(action, rest)
    },
  }
)
class DisplayWrapper extends React.Component {
  render() {
    return (
      <DisplayPanel unit={sd.CAMPAIGN.panel} campaign={sd.CAMPAIGN} isMobile />
    )
  }
}

export const init = () => {
  ReactDOM.render(
    React.createElement(DisplayWrapper),
    document.getElementById("react-root")
  )
}
