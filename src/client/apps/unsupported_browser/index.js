import express from "express"
import { index } from "client/apps/unsupported_browser/routes"

const app = (module.exports = express())

app.get("/unsupported", index)
