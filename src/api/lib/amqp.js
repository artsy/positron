const { RABBIT_URL } = process.env

const amqplib = require("amqplib/callback_api")

const amqp = {}
amqp.publish = (exchange, routingKey, message) => {
  amqplib.connect(
    RABBIT_URL,
    (err, conn) => {
      if (err) throw err

      conn.createChannel((err, ch1) => {
        if (err) throw err

        ch1.assertExchange(exchange)
        ch1.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)))
      })
    }
  )
}

module.exports = { amqp }
