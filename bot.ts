import {
  Bot,
  Context,
  InlineKeyboard,
  Keyboard,
  session,
  type SessionFlavor,
} from "grammy";
import {
  greet_message,
  pay_message,
  subscription_variant_one,
  subscription_variant_two,
} from "./messages";
import { v1 as uuidv1 } from "uuid";
import db from "./db.js";

interface SessionData {
  step: string | null;
  fio: string;
  phone: string;
  type: number | null;
}

type MyContext = Context & SessionFlavor<SessionData>;
const bot = new Bot<MyContext>(`${process.env.BOT_TOKEN}`);

function initial(): SessionData {
  return {
    step: null,
    fio: "",
    phone: "",
    type: null,
  };
}
bot.use(session({ initial }));
bot.command("start", async (ctx) => {
  ctx.session.step = null;
  await ctx.reply(greet_message, {
    reply_markup: new Keyboard()
      .oneTime()
      .text(subscription_variant_one)
      .text(subscription_variant_two)
      .row()
      .resized()
      .oneTime(),
  });
});

bot.hears([subscription_variant_one, subscription_variant_two], async (ctx) => {
  const text = ctx.message?.text?.trim();
  if (text == subscription_variant_one) {
    ctx.session.type = 1
  } else {
    ctx.session.type = 2
  }

  ctx.session.step = "awaiting_fio";
  await ctx.reply("Введите ваше ФИО:", {
    reply_markup: { remove_keyboard: true }
  });



  // const text = ctx.message?.text?.trim();
  // const type = (text == subscription_variant_one) ?
  // const url = `${process.env.BASE_URL}` +
  //
  // const inlineKeyboard = new InlineKeyboard().url("Оплатить", url || 'Не удалось получить ссылку...')
  //
  // await ctx.reply(pay_message, {
  //   reply_markup: inlineKeyboard
  // })
});

bot.on("message:text", async (ctx) => {
  const { step } = ctx.session;
  const text = ctx.message.text.trim();

  if (step === "awaiting_fio") {
    ctx.session.fio = text;
    ctx.session.step = "awaiting_phone";
    await ctx.reply("Введите ваш номер телефона (в формате +7XXXXXXXXXX):");
  } else if (step === "awaiting_phone") {
    const phoneRegex = /^\+7\d{10}$/;
    if (!phoneRegex.test(text)) {
      return await ctx.reply(
        "Неверный формат номера. Попробуйте снова (например, +71234567890)."
      );
    }
    ctx.session.phone = text;
    ctx.session.step = "processing_payment";

    const existing = db
      .prepare(`SELECT id FROM users WHERE chat_id = ?`)
      .get(ctx.chat.id);
    const userId = existing?.id || uuidv1();

    const insert = db.prepare(`
      INSERT INTO users (id, chat_id, fio, phone, sub_type)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(chat_id) DO UPDATE SET fio=excluded.fio, phone=excluded.phone
    `);
    insert.run(userId, ctx.chat.id, ctx.session.fio, ctx.session.phone, ctx.session.type);

    const url = `${process.env.BASE_URL}?token=${userId}`;
    const inlineKeyboard = new InlineKeyboard().url("Оплатить", url || 'Не удалось получить ссылку...')

    await ctx.reply(pay_message, {
      reply_markup: inlineKeyboard
    })

    // Очистка сессии
    ctx.session = { step: null, fio: "", phone: "", type: null };
  }
});

export default bot;
