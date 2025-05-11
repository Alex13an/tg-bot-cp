import express from "express";
import bot from "./bot";
import db from "./db.js";

const app = express();
const port = process.env.PORT || 3333;

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.get("/api/user", (req, res, next) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing id" });

  const stmt = db.query("SELECT fio, phone, sub_type FROM users WHERE id = ?");
  const row = stmt.get(`${id}`);

  if (!row) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(row);
});

app.post("/api/success", (req, res) => {
  const { userId } = req.body
  console.log('USERID', userId)
})

bot.start();
