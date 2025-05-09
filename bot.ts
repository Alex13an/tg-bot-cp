import { Bot, Context, InlineKeyboard, Keyboard, session, type SessionFlavor } from "grammy";
import {
  greet_message,
  pay_message,
  subscription_variant_one,
  subscription_variant_two,
} from "./messages";

interface SessionData {
  step: string | null;
  fio: string;
  phone: string;
  type: number | null;
}

type MyContext = Context & SessionFlavor<SessionData>;
const bot = new Bot<MyContext>(
  `${process.env.BOT_TOKEN}`
);

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
      .oneTime()
  });
});

bot.hears([subscription_variant_one, subscription_variant_two], async (ctx) => {
  ctx.session.step = "awaiting_fio";
  const text = ctx.message?.text?.trim();
  const url = (text == subscription_variant_one) ? process.env.URL_PREMIUM : process.env.URL_NORMAL

  const inlineKeyboard = new InlineKeyboard().url("Оплатить", url || 'Не удалось получить ссылку...')

  await ctx.reply(pay_message, {
    reply_markup: inlineKeyboard
  })
});

// bot.on("message:text", async (ctx) => {
//   const { step } = ctx.session;
//   const text = ctx.message.text.trim();
//
//   if (step === "awaiting_fio") {
//     ctx.session.fio = text;
//     ctx.session.step = "awaiting_phone";
//     await ctx.reply("Введите ваш номер телефона (в формате +7XXXXXXXXXX):");
//   } else if (step === "awaiting_phone") {
//     const phoneRegex = /^\+7\d{10}$/;
//     if (!phoneRegex.test(text)) {
//       return await ctx.reply(
//         "Неверный формат номера. Попробуйте снова (например, +71234567890)."
//       );
//     }
//     ctx.session.phone = text;
//     ctx.session.step = "processing_payment";
//     if (ctx.session.type === 0) {
//       await ctx.reply("https://c.cloudpayments.ru/payments/df77fef1c19d4a48895270cbc751ea89");
//     } else {
//       await ctx.reply("https://c.cloudpayments.ru/payments/586d5d78248a491ca494191f7e0ea260");
//     }
//
//     // await ctx.reply("Обрабатываем ваш запрос...");
//     //
//     // try {
//     //   const response = await axios.post("https://api.payment.com/init", {
//     //     fio: ctx.session.fio,
//     //     phone: ctx.session.phone,
//     //   });
//     //
//     //   if (response.data?.status === "success") {
//     //     await ctx.reply("Платёж успешно инициирован! Спасибо за регистрацию.");
//     //   } else {
//     //     await ctx.reply(
//     //       "Произошла ошибка при обработке платежа. Попробуйте позже."
//     //     );
//     //   }
//     // } catch (error) {
//     //   console.error(error);
//     //   await ctx.reply("Сервер платёжной системы недоступен. Попробуйте позже.");
//     // }
//
//     // Очистка сессии
//     ctx.session = { step: null, fio: "", phone: "", type: null };
//   }
// });

bot.start()
