import express from "express"
import { index, saveSession, deleteSession } from "./routes"

const app = (module.exports = express())

app.get("/sessions", index)
app.post("/sessions", saveSession)
app.put("/sessions/:id", saveSession)
app.delete("/sessions/:id", deleteSession)
