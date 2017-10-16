import React from 'react'
import ReactDOM from 'react-dom/server'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing'
// import { DisplayQuery } from 'client/apps/display/display_query'
import { Lokka } from 'lokka'
import { Transport } from 'lokka-transport-http'
const { API_URL } = process.env
console.log(DisplayPanel)

export const display = async (req, res, next) => {
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

  client.query(DisplayQuery)
  .then((result) => {
    console.log(result)
    const DisplayPanelComponent = React.createFactory(DisplayPanel)
    const appString = ReactDOM.renderToString(DisplayPanelComponent({unit: result.display.panel, campaign: display}))
    console.log(appString)
    res.render('helloooo')
  })
}
