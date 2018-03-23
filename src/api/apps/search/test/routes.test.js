import sinon from 'sinon'
// import {index, __RewireAPI__ as RewiredRoute} from '../routes'

const rewire = require('rewire')('../routes')

describe('Search route', () => {
  const req = {
    query: {
      term: 'apples'
    }
  }
  const res = {send: sinon.stub()}
  const next = () => {}
  const search = sinon.stub()

  beforeEach(() => {
    rewire.__set__('search', {client: { search }})
  })

  it('makes a search request', () => {
    index(req, res, next)
    search.args[0][0].body.query.bool.must.multi_match.query.should.equal('apples')
  })

  it('does not send back results if there is an error', () => {
    index(req, res, next)
    search.args[0][1]('error')
    res.send.called.should.be.false()
  })

  it('returns results from search', () => {
    index(req, res, next)
    search.args[0][1](null, {hits: ['Abigail']})
    res.send.args[0][0][0].should.equal('Abigail')
  })
})
