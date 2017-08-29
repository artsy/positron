import sinon from 'sinon'
import rewire from 'rewire'
const routes = rewire('../routes')

describe('Search route', () => {
  const req = {
    query: {
      term: 'apples'
    }
  }
  const res = {}
  const next = () => {}
  const search = sinon.stub()

  beforeEach(() => {
    routes.__set__('search', sinon.stub().returns({
      client: { search }
    }))
  })

  it('makes a search request', () => {
    routes.index(req, res, next)
    console.log(search.args)
  })
})
