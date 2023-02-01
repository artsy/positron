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
        useragent: req.headers["user-agent"],
        sourceIP: req.remoteAddress,
        hostname: req.headers.host,
        port: req.headers.remotePort,
        requestURI: req.url,
        requestMethod: req.method,
        accept: req.headers.accept,
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

  customReceivedMessage: function(req, res) {
    return "request received"
  },
})

module.exports = {
  httpLogger,
}
