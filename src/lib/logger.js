import pino from "pino"
const httpLogger = require("pino-http")({
  base: {
    pid: undefined,
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  // overwrite the req and res obejct specifying properties to keep
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        hostname: req.headers.host,
        useragent: req.headers["user-agent"],
        accept: req.headers.accept,
        remoteAddress: req.remoteAddress,
        port: req.remotePort,
      }
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      }
    },
  },

  formatters: {
    level(label, number) {
      return { level: label }
    },
  },
})

module.exports = {
  httpLogger,
}
