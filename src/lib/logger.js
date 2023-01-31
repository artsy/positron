import pino from "pino"
const httpLogger = require("pino-http")({
  base: {
    pid: undefined,
  },

  redact: {
    paths: [
      'req.headers["x-access-token"]',
      "req.headers.cookie",
      "req.headers.connection",
      'req.headers["sec-ch-ua"]',
      'req.headers["sec-ch-ua-mobile"]',
      'req.headers["sec-ch-ua-platform"]',
      'req.headers["upgrade-insecure-requests"]',
      'req.headers["sec-fetch-site"]',
      'req.headers["sec-fetch-mode"]',
      'req.headers["sec-fetch-user"]',
      'req.headers["sec-fetch-dest"]',
      'req.headers["if-none-match"]',
      'req.headers["x-datadog-trace-id"]',
      'req.headers["x-datadog-parent-id"]',
      'req.headers["x-datadog-sampling-priority"]',
      "res.headers.etag",
      'res.headers["access-control-allow-origin"]',
    ],
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
