import tracer from "dd-trace"

export function init() {
  const ddServicePrefix = "positron"

  tracer.init({
    // Setting the service name to  `.undetected` so that we detect services that
    // are running as part of the application, but aren't explicitly configured
    // with `tracer.use`. We want to to explicitly configure services so that we
    // can enforce our `.`-deliminited Service naming convention.
    service: `${ddServicePrefix}.undetected`,
    hostname: process.env.DATADOG_AGENT_HOSTNAME,
  })

  tracer.use("express", {
    service: `${ddServicePrefix}`,
  })

  tracer.use("mongodb-core", {
    service: `${ddServicePrefix}.mongodb`,
  })

  tracer.use("elasticsearch", {
    service: `${ddServicePrefix}.elasticsearch`,
  })

  tracer.use("http", {
    service: `${ddServicePrefix}.http`,
  })
}
