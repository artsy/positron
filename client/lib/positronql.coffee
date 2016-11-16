# Makes a GraphQL query

Lokka = require('lokka').Lokka
Transport = require('lokka-transport-http').Transport
{ API_URL } = process.env
Q = require 'bluebird-q'

positronql = ({ query, req } = {}) ->
  Q.promise (resolve, reject) ->

    client = new Lokka
      transport: new Transport(API_URL + '/graphql')

    client.query(query)
    .then (result) =>

      if result.errors?
        error = new Error JSON.stringify result.errors
        error.status = 404 if some(result.errors, ({ message }) -> message.match /Not Found/)
        return reject error

      resolve result
    .catch (err, res) =>
      console.log err
      console.log res

module.exports = positronql
