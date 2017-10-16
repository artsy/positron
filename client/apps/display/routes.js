import React from 'react'
import ReactDOM from 'react-dom/server'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
import { Lokka } from 'lokka'
import { Transport } from 'lokka-transport-http'
import { ServerStyleSheet } from 'styled-components'
import { displayQuery, displayFragment } from 'client/apps/display/query'

const { API_URL } = process.env

export const display = async (req, res, next) => {
  const headers = {
    'X-Access-Token': req.user.get('access_token')
  }

  const client = new Lokka({
    transport: new Transport(API_URL + '/graphql', { headers })
  })

  const lokkaFragment = client.createFragment(displayFragment)
  const query = displayQuery(lokkaFragment)

  client
  .query(query)
  .then((results) => {
    const DisplayPanelComponent = React.createFactory(DisplayPanel)
    const sheet = new ServerStyleSheet()
    const body = ReactDOM.renderToString(
      sheet.collectStyles(
        DisplayPanelComponent({
          unit: results.display.panel,
          campaign: results.display
        })
      )
    )
    const css = sheet.getStyleTags()
    res.render('index', { css, body })
  })
}

// const { display } = await exports.promisedLokka(client, query)
// export const promisedLokka = (client, query) => {
//   return new Promise((resolve, reject) => {
//     client
//     .query(query)
//     .then((results) => {
//       resolve(results)
//     }).catch((err) => {
//       if (err) { reject(new Error('Error fetching display')) }
//     })
//   })
// }
