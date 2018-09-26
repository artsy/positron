import React from "react"
import ReactDOM from "react-dom/server"
import request from "superagent"
import { DisplayPanel } from "@artsy/reaction/dist/Components/Publishing/Display/DisplayPanel"
import { ServerStyleSheet } from "styled-components"
import { DisplayQuery } from "client/apps/display/query"

const { API_URL, NODE_ENV, SEGMENT_WRITE_KEY_FORCE, WEBFONT_URL } = process.env

export const display = (req, res, next) => {
  res.setHeader("X-Frame-Options", "*")
  request
    .post(API_URL + "/graphql")
    .set("Accept", "application/json")
    .query({ query: DisplayQuery })
    .end((err, response) => {
      if (err) {
        return next(err)
      }

      const display = response.body.data.display
      let css = ""
      let body = ""

      if (display) {
        const DisplayPanelComponent = React.createFactory(DisplayPanel)
        const sheet = new ServerStyleSheet()
        body = ReactDOM.renderToString(
          sheet.collectStyles(
            DisplayPanelComponent({
              unit: display.panel,
              campaign: display,
              isMobile: true,
            })
          )
        )
        css = sheet.getStyleTags()
      }

      res.locals.sd.CAMPAIGN = display
      res.render("index", {
        css,
        body,
        fallback: !display,
        nodeEnv: NODE_ENV,
        segmentWriteKey: SEGMENT_WRITE_KEY_FORCE,
        webfontUrl: WEBFONT_URL,
      })
    })
}
