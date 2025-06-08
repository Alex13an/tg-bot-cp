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
  get_pay_message,
  subscriptionVariants,
  select_another,
} from "./messages";
import { v1 as uuidv1 } from "uuid";
import db from "./db.js";

interface SessionData {
  step: string | null;
  fio: string;
  phone: string;
  type: number | null;
  re: boolean;
}

type MyContext = Context & SessionFlavor<SessionData>;
const bot = new Bot<MyContext>(`${process.env.BOT_TOKEN}`);

function initial(): SessionData {
  return {
    step: null,
    fio: "",
    phone: "",
    type: null,
    re: false,
  };
}
bot.use(session({ initial }));
bot.command("start", async (ctx) => {
  ctx.session.step = null;
  await ctx.reply(greet_message, {
    reply_markup: new Keyboard()
      .oneTime()
      .text(subscriptionVariants[0].description)
      .text(subscriptionVariants[1].description)
      .text(subscriptionVariants[2].description)
      .text(subscriptionVariants[3].description)
      .row()
      .toFlowed(1)
      .oneTime(),
  });
});

bot.hears(
  [...subscriptionVariants].map((s) => s.description),
  async (ctx) => {
    const text = ctx.message?.text?.trim();
    const type = subscriptionVariants.find((v) => v.description === text);
    ctx.session.type = type?.id || 1;

    if (!ctx.session.re) {
      ctx.session.step = "awaiting_fio";
      await ctx.reply("Введите ваше ФИО:", {
        reply_markup: { remove_keyboard: true },
      });
    } else {
      const existing = db
        .prepare(`SELECT id FROM users WHERE chat_id = ?`)
        .get(ctx.chat.id);
      const userId = existing?.id || uuidv1();

      const insert = db.prepare(`
      INSERT INTO users (id, chat_id, fio, phone, sub_type)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(chat_id) DO UPDATE SET fio=excluded.fio, phone=excluded.phone, sub_type=excluded.sub_type
    `);
      insert.run(
        userId,
        ctx.chat.id,
        ctx.session.fio,
        ctx.session.phone,
        ctx.session.type
      );

      const url = `${process.env.BASE_URL}?token=${userId}`;
      const inlineKeyboard = new InlineKeyboard()
        .url("Оплатить", url || "Не удалось получить ссылку...")
        .row()
        .text("Выбрать другой тариф", "select_another");

      const curent_variant =
        subscriptionVariants.find((v) => v.id === ctx.session.type) ||
        subscriptionVariants[0];
      const pay_message = get_pay_message(
        curent_variant.title,
        curent_variant.price
      );
      await ctx.reply(`Тариф изменен на ${curent_variant.title}`, {
        reply_markup: { remove_keyboard: true },
      });
      await ctx.reply(pay_message, {
        reply_markup: inlineKeyboard,
      });
    }
  }
);

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
      ON CONFLICT(chat_id) DO UPDATE SET fio=excluded.fio, phone=excluded.phone, sub_type=excluded.sub_type
    `);
    insert.run(
      userId,
      ctx.chat.id,
      ctx.session.fio,
      ctx.session.phone,
      ctx.session.type
    );

    const url = `${process.env.BASE_URL}?token=${userId}`;
    const inlineKeyboard = new InlineKeyboard()
      .url("Оплатить", url || "Не удалось получить ссылку...")
      .row()
      .text("Выбрать другой тариф", "select_another");

    const curent_variant =
      subscriptionVariants.find((v) => v.id === ctx.session.type) ||
      subscriptionVariants[0];
    const pay_message = get_pay_message(
      curent_variant.title,
      curent_variant.price
    );
    await ctx.reply(pay_message, {
      reply_markup: inlineKeyboard,
    });

    // Очистка сессии
    // ctx.session = { step: null, fio: "", phone: "", type: null };
  }
});

bot.callbackQuery("select_another", async (ctx) => {
  await ctx.answerCallbackQuery(); // убирает "часики"
  ctx.session.step = null;
  ctx.session.re = true;
  await ctx.reply(select_another, {
    reply_markup: new Keyboard()
      .oneTime()
      .text(subscriptionVariants[0].description)
      .text(subscriptionVariants[1].description)
      .text(subscriptionVariants[2].description)
      .text(subscriptionVariants[3].description)
      .row()
      .toFlowed(1)
      .oneTime(),
  });
});

export default bot;
