import express from "express"
import { index } from "api/apps/search/routes"
import { setUser, authenticated, adminOnly } from "api/apps/users/routes.coffee"

const app = (module.exports = express())

app.get("/search", setUser, authenticated, adminOnly, index)
