import { display } from "./routes"
import cors from "cors"
import express from "express"
import path from "path"

const app = (module.exports = express())
app.set("views", path.resolve(__dirname, "./templates"))
app.set("view engine", "jade")

app.get("/display", cors(), display)
