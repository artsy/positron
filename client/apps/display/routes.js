import React from 'react'
import ReactDOM from 'react-dom/server'
import request from 'superagent'
import { DisplayPanel } from '@artsy/reaction-force/dist/Components/Publishing/Display/DisplayPanel'
import { ServerStyleSheet } from 'styled-components'
import { DisplayQuery } from 'client/apps/display/query'
import AWS from 'aws-sdk'
import _s from 'underscore.string'

const {
  API_URL,
  NODE_ENV,
  S3_DISPLAY_BUCKET,
  S3_KEY,
  S3_SECRET,
  SEGMENT_WRITE_KEY_FORCE,
  WEBFONT_URL
} = process.env

export const display = (req, res, next) => {
  res.setHeader('X-Frame-Options', '*')
  request
  .post(API_URL + '/graphql')
  .set('Accept', 'application/json')
  .query({ query: DisplayQuery })
  .end((err, response) => {
    if (err) { return next(err) }

    const display = response.body.data.display
    let css = ''
    let body = ''

    if (display) {
      const DisplayPanelComponent = React.createFactory(DisplayPanel)
      const sheet = new ServerStyleSheet()
      body = ReactDOM.renderToString(
        sheet.collectStyles(
          DisplayPanelComponent({
            unit: display.panel,
            campaign: display,
            isMobile: true
          })
        )
      )
      css = sheet.getStyleTags()
    }

    res.locals.sd.CAMPAIGN = display
    res.render('index', {
      css,
      body,
      fallback: !display,
      nodeEnv: NODE_ENV,
      segmentWriteKey: SEGMENT_WRITE_KEY_FORCE,
      webfontUrl: WEBFONT_URL
    })
  })
}

export const upload = (req, res, next) => {
  AWS.config.update({
    accessKeyId: S3_KEY,
    secretAccessKey: S3_SECRET,
    region: 'us-east-1'
  })

  const signatureRequest = new AWS.S3({
    signatureVersion: 'v4'
  })

  const file = _s.strLeftBack(req.body.name, '.')
  const extension = `.${req.body.type.split('/')[1]}`

  const key = _s.slugify(file) + extension

  const s3Params = {
    Bucket: S3_DISPLAY_BUCKET,
    Key: key,
    Expires: 60,
    ContentType: req.body.type,
    ACL: 'public-read'
  }

  signatureRequest.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      res.err()
    }
    const signature = {
      signedRequest: data,
      url: `https://${S3_DISPLAY_BUCKET}.s3.amazonaws.com/${key}`
    }

    res.json(signature)
  })
}
