import express from "express"
import { articles_list } from "./routes"

/**
 * List views for published & draft articles
 */
const app = (module.exports = express())

app.set("views", __dirname)
app.set("view engine", "jade")

app.get("/", (_req, res) => res.redirect("/articles"))
app.get("/articles", articles_list)
