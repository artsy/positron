import sinon from 'sinon'
import Backbone from 'backbone'
import * as routes from 'client/apps/display/routes'
import request from 'superagent'
import StyleSheet from 'styled-components/lib/models/StyleSheet'

StyleSheet.reset(true)

jest.mock('superagent', () => {
  return {
    post: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.genMockFunction().mockReturnThis(),
    end: jest.fn()
  }
})

describe('Display Routes', () => {
  let req
  let res
  let next
  let response

  beforeEach(() => {
    req = { user: new Backbone.Model() }
    res = { render: jest.fn() }
    next = jest.fn()
    response = {
      body: {
        data: {
          display: {
            name: 'Campaign 1',
            panel: {
              assets: [
                { url: 'http://image.jpg' }
              ],
              link: {
                url: 'http://artsy.net',
                text: ''
              }
            },
            canvas: {
              assets: [
                { url: 'http://image2.jpg' }
              ],
              link: {
                url: 'http://writer.artsy.net',
                text: 'CTA link'
              },
              layout: 'overlay'
            }
          }
        }
      }
    }
  })

  it('sets up a request and fetches an ad', () => {
    request.end.mockImplementation((cb) => {
      cb(null, response)
    })
    routes.display(req, res, next)
    expect(res.render.mock.calls[0][1].body).toMatch('Sponsored by Campaign 1')
    expect(res.render.mock.calls[0][1].body).toMatch('href="http://artsy.net"')
  })

  it('extracts css from component and passes it to the template', () => {
    request.end.mockImplementation((cb) => {
      cb(null, response)
    })
    routes.display(req, res, next)
    expect(res.render.mock.calls[0][1].css).toMatch('<style type="text/css"')
    expect(res.render.mock.calls[0][1].css).toMatch('DisplayPanel')
  })

  it('calls next if no ad is found', () => {
    request.end.mockImplementation((cb) => {
      cb('Error', {})
    })
    routes.display(req, res, next)
    expect(next).toBeCalled()
  })
})
