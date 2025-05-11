import express from "express";
import bot from "./bot";
import db from "./db.js";
import { massive_success } from "./messages";

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

app.get("/api/ping", (req, res) => {
  res.send("pong");
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

app.post("/api/success", async (req, res) => {
  const { userId } = req.body;

  const stmt = db.query("SELECT chat_id, fio, phone FROM users WHERE id = ?");
  const user = stmt.get(userId);

  try {
    await bot.api.sendMessage(user.chat_id, massive_success);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to send message" });
  }
});

app.post('/api/cloudpayments/webhook', (req, res) => {
  const event = req.body;
  console.log('WEBHOOK', req.body)
  const type = req.headers['x-content-type-event'] || ''; // CloudPayments может передавать тип события

  console.log('Получен webhook:', type, event);

  if (event.SubscriptionId && event.AccountId) {
    const stmtGet = db.query("SELECT chat_id FROM users WHERE phone = ?");
    const user = stmtGet.get(event.AccountId);
    
    const stmt = db.prepare("UPDATE users SET sub_id = ? WHERE phone = ?");
    const updates = stmt.run(event.SubscriptionId, event.AccountId)

    console.log(`Сохранили подписку: ${event.AccountId} → ${event.SubscriptionId}`);

    try {
      bot.api.sendMessage(user.chat_id, massive_success);
    } catch (err) {
      console.log(`Бот не смог отправить сообщение об успехе`);
    }
  }


  // CloudPayments требует ответ 200 с JSON {code: 0}
  res.json({ code: 0 });
});

bot.start();
