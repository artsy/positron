import React from 'react'
import ReactDOM from 'react-dom/server'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
import { ServerStyleSheet } from 'styled-components'
import { DisplayQuery } from 'client/apps/display/query'
import request from 'superagent'

const { API_URL } = process.env

export const display = (req, res, next) => {
  request
  .post(API_URL + '/graphql')
  .set('Accept', 'application/json')
  .query({query: DisplayQuery})
  .end((err, response) => {
    if (err) { return next(err) }

    const display = response.body.data.display
    const DisplayPanelComponent = React.createFactory(DisplayPanel)
    const sheet = new ServerStyleSheet()
    const body = ReactDOM.renderToString(
      sheet.collectStyles(
        DisplayPanelComponent({
          unit: display.panel,
          campaign: display
        })
      )
    )
    const css = sheet.getStyleTags()

    res.render('index', { css, body })
  })
}
