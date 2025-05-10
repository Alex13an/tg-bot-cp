import express from "express";
import bot from './bot'

const app = express();
const port = process.env.PORT || 3333;

app.use(express.static('public'));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

bot.start()
