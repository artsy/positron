const { RABBITMQ_URL } = process.env

const amqplib = require("amqplib/callback_api")

const amqp = {}
amqp.publish = (exchange, routingKey, message) => {
  console.log("[amqp.publish]", exchange, routingKey, message)

  amqplib.connect(
    RABBITMQ_URL,
    (err, conn) => {
      if (err) throw err

      conn.createChannel((err, ch) => {
        if (err) throw err

        ch.assertExchange(exchange, "topic")
        ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)))
      })
    }
  )
}

module.exports = { amqp }
