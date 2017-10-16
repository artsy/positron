import React from 'react'
import ReactDOM from 'react-dom/server'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
import { Lokka } from 'lokka'
import { Transport } from 'lokka-transport-http'
import { ServerStyleSheet } from 'styled-components'
const { API_URL } = process.env

export const display = (req, res, next) => {
  const headers = {
    'X-Access-Token': req.user.get('access_token')
  }

  const client = new Lokka({
    transport: new Transport(API_URL + '/graphql', { headers })
  })

  const DisplayUnit = client.createFragment(`
    fragment on DisplayUnit {
      assets {
        url
      }
      body
      disclaimer
      headline
      layout
      link {
        text
        url
      }
      logo
      name
    }
  `)

  const DisplayQuery = `
    {
      display {
        name
        canvas {
          ...${DisplayUnit}
        }
        panel {
          ...${DisplayUnit}
        }
      }
    }
  `

  client
  .query(DisplayQuery)
  .then((result) => {
    const DisplayPanelComponent = React.createFactory(DisplayPanel)
    const sheet = new ServerStyleSheet()
    const body = ReactDOM.renderToString(sheet.collectStyles(DisplayPanelComponent({unit: result.display.panel, campaign: display})))
    const css = sheet.getStyleTags()
    res.render('index', { css, body })
  })
}
