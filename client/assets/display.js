import React from 'react'
import ReactDOM from 'react-dom'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
const sd = require('sharify').data

ReactDOM.render(
  React.createElement(
    DisplayPanel,
    {
      campaign: sd.CAMPAIGN,
      unit: sd.CAMPAIGN.panel
    }
  ),
  document.getElementById('react-root')
)
