import Joi from 'api/lib/joi.coffee'

const schema = Joi.object().keys({ // fill in complete schema
  name: Joi.string()
})

const querySchema = {
  limit: Joi.number()
}

export default { schema, querySchema }
