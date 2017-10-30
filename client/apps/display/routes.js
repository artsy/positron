import React from 'react'
import ReactDOM from 'react-dom/server'
import request from 'superagent'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
import { InstantArticleEmailSignup } from '@artsy/reaction-force/dist/Components/Publishing'
import { ServerStyleSheet } from 'styled-components'
import { DisplayQuery } from 'client/apps/display/query'

const { API_URL, FORCE_URL } = process.env

export const display = (req, res, next) => {
  request
  .post(API_URL + '/graphql')
  .set('Accept', 'application/json')
  .query({ query: DisplayQuery })
  .end((err, response) => {
    if (err) { return next(err) }

    const display = response.body.data.display

    if (!display) {
      const InstantArticleEmailSignupComponent = React.createFactory(InstantArticleEmailSignup)
      const sheet = new ServerStyleSheet()
      const body = ReactDOM.renderToString(
        sheet.collectStyles(
          InstantArticleEmailSignupComponent({
            signupUrl: `${FORCE_URL}/signup/editorial`
          })
        )
      )
      const css = sheet.getStyleTags()
      res.render('fallback', { css, body })
    } else {
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
    }
  })
}
