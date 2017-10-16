import jest from 'jest'
import sinon from 'sinon'
import Backbone from 'backbone'
import * as routes from 'client/apps/display/routes'
jest.mock('lokka')

describe('Display Routes', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = { user: new Backbone.Model() }
    res = { render: sinon.stub() }
    next = sinon.stub()
  })

  it('fetches an ad', () => {
    const display = {
      name: 'Campaign1'
    }
    // routes.promisedLokka = jest.fn(() => Promise.resolve({display}))
    console.log(routes)
    // routes.__RewireAPI__('lokka', sinon.stub().returns({
    //   query: sinon.stub(),
    //   createFragment: sinon.stub()
    // }))
    routes.display(req, res, next)
    console.log(res.render.args)
  })

  it('it renders the ad with display information', () => {

  })

  it('returns a fallback', () => {

  })
})
