import express from "express";
import bot from './bot'

const app = express();
const port = process.env.PORT || 3333;

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

bot.start()
