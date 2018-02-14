import Joi from 'api/lib/joi.coffee'
import db from 'api/lib/db.coffee'
import { omit } from 'lodash'
import { ObjectId } from 'mongojs'

const schema = Joi.object().keys({
  timestamp: Joi.date(),
  user: Joi.object().keys({
    id: Joi.string().objectid(),
    name: Joi.string()
  }),
  article_id: Joi.string().objectid(),
  channel_id: Joi.string().objectid()
})

const querySchema = {
  q: Joi.string().allow('')
}

export const where = (input, callback) => {
  Joi.validate(input, querySchema, (err, input) => {
    if (err) {
      return callback(err)
    }

    const cursor = db
      .sessions
      .find(input)

    cursor.toArray((err, sessions) => {
      callback(err, sessions)
    })
  })
}

export const save = (input, callback) => {
  Joi.validate(input, schema, {}, (err, input) => {
    if (err) {
      callback(err)
    }

    const data = {
      ...omit(input, 'id'),
      _id: input.id
    }

    db.sessions.save(data, callback)
  })
}

export const destroy = (id, callback) => {
  db.sessions.remove({ _id: ObjectId(id) }, callback)
}

export default { schema, querySchema }
