import React from 'react'
import sinon from 'sinon'
import Backbone from 'backbone'
import routes, { display } from 'client/apps/display/routes'

jest.mock('lokka')

describe('Display Routes', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = { user: new Backbone.Model() }
    res = { render: sinon.stub() }
    next = sinon.stub()
    routes.__set__()
  })

  it('fetches an ad', () => {
    display(req, res, next)
    .then((result) => {
      console.log(res.render)
    })
  })

  it('it renders the ad with display information', () => {

  })

  it('returns a fallback', () => {

  })
})
