const httpLogger = require("pino-http")({
  // overwrite the req and res obejct specifying properties to keep
  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        host: req.headers.host,
        params: req.params,
        query: req.query,
        useragent: req.headers["user-agent"],
        accept: req.headers.accept,
        address: req.remoteAddress,
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
