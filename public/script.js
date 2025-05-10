this.pay = function () {
  const widget = new cp.CloudPayments();
  widget.pay(
    "auth", // или 'charge'
    {
      //options
      publicId: `${process.env.PAYMENT_PUBLIC_ID}`, //id из личного кабинета
      description: "Оплата товаров в example.com", //назначение
      amount: 100, //сумма
      currency: "RUB", //валюта
      accountId: "user@example.com", //идентификатор плательщика (необязательно)
      invoiceId: "1234567", //номер заказа  (необязательно)
      email: "user@example.com", //email плательщика (необязательно)
      skin: "mini", //дизайн виджета (необязательно)
      data: {
        myProp: "myProp value",
      },
    },
    {
      onSuccess: function (options) {
        // success
        //действие при успешной оплате
      },
      onFail: function (reason, options) {
        // fail
        //действие при неуспешной оплате
      },
      onComplete: function (paymentResult, options) {
        //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
        //например вызов вашей аналитики Facebook Pixel
      },
    }
  );
};

this.pay()
