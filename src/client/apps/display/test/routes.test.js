import Backbone from "backbone"
import * as routes from "client/apps/display/routes"
import request from "superagent"
import { __DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS as scSecrets } from 'styled-components'
const { StyleSheet } = scSecrets

StyleSheet.reset(true)

jest.mock("superagent", () => {
  return {
    post: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.genMockFunction().mockReturnThis(),
    end: jest.fn(),
  }
})

describe("Display Routes", () => {
  let req
  let res
  let next
  let response

  beforeEach(() => {
    req = { user: new Backbone.Model() }
    res = {
      render: jest.fn(),
      locals: { sd: {} },
      setHeader: jest.fn(),
    }
    next = jest.fn()
    response = {
      body: {
        data: {
          display: {
            name: "Campaign 1",
            panel: {
              assets: [{ url: "http://image.jpg" }],
              link: {
                url: "http://artsy.net",
                text: "",
              },
            },
            canvas: {
              assets: [{ url: "http://image2.jpg" }],
              link: {
                url: "http://writer.artsy.net",
                text: "CTA link",
              },
              layout: "overlay",
            },
          },
        },
      },
    }
  })

  it("sets up a request and fetches an ad", () => {
    request.end.mockImplementation(cb => {
      cb(null, response)
    })
    routes.display(req, res, next)
    expect(res.render.mock.calls[0][1].body).toMatch("Sponsored by Campaign 1")
  })

  it("extracts css from component and passes it to the template", () => {
    request.end.mockImplementation(cb => {
      cb(null, response)
    })
    routes.display(req, res, next)

    expect(res.render.mock.calls[0][1].css).toMatch('<style')
    expect(res.render.mock.calls[0][1].css).toMatch("DisplayPanel")
  })

  it("calls next if there is an error with the request", () => {
    request.end.mockImplementation(cb => {
      cb("Error", {})
    })
    routes.display(req, res, next)
    expect(next).toBeCalled()
  })

  it("uses a fallback if there is no ad to show", () => {
    request.end.mockImplementation(cb => {
      cb(null, { body: { data: { display: null } } })
    })
    routes.display(req, res, next)
    expect(res.render.mock.calls[0][1].fallback).toBe(true)
  })

  it("sets the X-Frame-Options", () => {
    request.end.mockImplementation(cb => {
      cb(null, response)
    })
    routes.display(req, res, next)
    expect(res.setHeader.mock.calls[0][0]).toBe("X-Frame-Options")
    expect(res.setHeader.mock.calls[0][1]).toBe("*")
  })
})
