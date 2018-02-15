import Joi from 'api/lib/joi.coffee'
import { omit } from 'lodash'
import { ObjectId } from 'mongojs'

const db = require('api/lib/db.coffee')

const schema = Joi.object().keys({
  timestamp: Joi.date(),
  user: Joi.object().keys({
    id: Joi.string().objectid(),
    name: Joi.string()
  }),
  article: Joi.string().objectid(),
  channel: Joi.object().keys({
    id: Joi.string().objectid(),
    name: Joi.string(),
    type: Joi.string()
  })
})

const querySchema = {
  q: Joi.string().allow('')
}

export const where = (input, callback) => {
  Joi.validate(input, querySchema, (err, input) => {
    if (err) {
      return callback(err)
    }

    const cursor = db.sessions.find(input)

    cursor.toArray((err, sessions) => {
      callback(err, sessions)
    })
  })
}

export const save = (inputData, callback) => {
  const id = inputData.id
  delete inputData.id

  Joi.validate(inputData, schema, {}, (err, input) => {
    if (err) {
      callback(err)
    }

    const data = {
      ...omit(inputData, 'id'),
      _id: id
    }

    db.sessions.save(data, callback)
  })
}

export const destroy = (id, callback) => {
  db.sessions.remove({ _id: id }, callback)
}

export default { schema, querySchema }
