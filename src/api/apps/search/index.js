import express from "express"
import { index } from "api/apps/search/routes"
import { setUser, authenticated, editorialOnly } from "api/apps/users/routes.coffee"

const app = (module.exports = express())

app.get("/search", setUser, authenticated, editorialOnly, index)
