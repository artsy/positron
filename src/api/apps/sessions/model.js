import Joi from "api/lib/joi.coffee"
import { omit } from "lodash"
import moment from "moment"

const db = require("api/lib/db.coffee")

const INVALID_THRESHOLD = 10 // in minutes

const schema = Joi.object().keys({
  timestamp: Joi.date(),
  user: Joi.object().keys({
    id: Joi.string().objectid(),
    name: Joi.string().default(""),
  }),
  article: Joi.string().objectid(),
  channel: Joi.object().keys({
    id: Joi.string().objectid(),
    name: Joi.string(),
    type: Joi.string(),
  }),
})

const querySchema = {
  q: Joi.string().allow(""),
}

export const where = (input, callback) => {
  Joi.validate(input, querySchema, (err, input) => {
    if (err) {
      return callback(err)
    }

    const timeLimit = moment()
      .subtract(INVALID_THRESHOLD, "minutes")
      .format()

    const cursor = db.collection("sessions").find({
      timestamp: {
        $gte: timeLimit,
      },
    })

    cursor.toArray((err, sessions) => {
      callback(err, sessions)
    })

    // clear out any session that hasn't been updated
    // in more than a given max
    db.collection("sessions").deleteMany({
      timestamp: {
        $lte: timeLimit,
      },
    })
  })
}

export const save = (inputData, callback) => {
  const id = inputData.id
  inputData = omit(inputData, "id", "_id")

  Joi.validate(inputData, schema, {}, (err, input) => {
    if (err) {
      callback(err)
    }

    const data = {
      ...omit(inputData, "id"),
      _id: id,
    }

    db.collection("sessions").updateOne(
      { _id: data._id },
      { $set: inputData },
      { upsert: true },
      (err, res) => {
        db.collection("sessions").findOne({ _id: res.upsertedId }, callback)
      }
    )
  })
}

export const destroy = (id, callback) => {
  db.collection("sessions").deleteOne({ _id: id }, (err, data) => {
    callback(err, { _id: id })
  })
}

export default { schema, querySchema }
