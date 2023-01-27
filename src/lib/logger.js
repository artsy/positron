import pino from "pino"
const httpLogger = require("pino-http")({
  base: {
    pid: undefined,
  },

  redact: {
    paths: ['req.headers["x-access-token"]', "req.headers.cookie"],
    remove: true,
  },

  formatters: {
    level(label, number) {
      return { level: label }
    },
  },

  timestamp: pino.stdTimeFunctions.isoTime,
})

module.exports = {
  httpLogger,
}
