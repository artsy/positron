import express from "express"

const app = (module.exports = express())

app.get("/health", (req, res) => {
  return res.status(200).end()
})
