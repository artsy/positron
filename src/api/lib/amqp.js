const { RABBIT_URL } = process.env

const amqplib = require("amqplib/callback_api")

const amqp = {}
amqp.publish = (queue, routingKey, message) => {
  amqplib.connect(
    RABBIT_URL,
    (err, conn) => {
      if (err) throw err

      conn.createChannel((err, ch1) => {
        if (err) throw err

        ch1.assertQueue(queue)
        ch1.publish(queue, routingKey, Buffer.from(JSON.stringify(message)))
      })
    }
  )
}

module.exports = { amqp }
