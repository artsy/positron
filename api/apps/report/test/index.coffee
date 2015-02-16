sinon = require 'sinon'
rewire = require 'rewire'
app = rewire '../'
request = require 'superagent'

describe 'report', ->

  beforeEach (done) ->
    app.__set__ 'mandrill', @mandrill = sinon.stub()
    app.listen '5001', ->
      done()

  it 'submits a report to mandril', (done) ->
    @mandrill.callsArgWith 2, null, { foo: 'bar' }
    request.get('http://localhost:5001/report?html=Foo').end (err, res) =>
      @mandrill.args[0][1].message.html.should.equal 'Foo'
      done()
