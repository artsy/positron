const httpLogger = require("pino-http")({
  // modify standard serialized properties of req and res, log only listed props
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
})

module.exports = {
  httpLogger,
}
