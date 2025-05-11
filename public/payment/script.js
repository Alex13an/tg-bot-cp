this.pay = function (userData) {
  const subPrice = userData.sub_type == 1 ? 2000.0 : 1500.0;
  const subTitle =
    userData.sub_type == 1 ? "Подписка Безлимит" : "Дневная карта";
  const widget = new cp.CloudPayments({
    yandexPaySupport: false,
    applePaySupport: false,
    googlePaySupport: false,
    masterPassSupport: false,
    tinkoffInstallmentSupport: false,
  });

  const receipt = {
    Items: [
      //товарные позиции
      {
        label: subTitle, //наименование товара
        price: subPrice, //цена
        quantity: 1.0, //количество
        amount: subPrice, //сумма
        vat: 20, //ставка НДС
      },
    ],
    taxationSystem: 0, //система налогообложения; необязательный, если у вас одна система налогообложения
    phone: userData.phone, //телефон покупателя в любом формате, если нужно отправить сообщение со ссылкой на чек
  };

  const data = {
    //содержимое элемента data
    CloudPayments: {
      phone: userData.phone,
      CustomerReceipt: receipt, //чек для первого платежа
      recurrent: {
        interval: "Month",
        period: 1,
        customerReceipt: receipt, //чек для регулярных платежей
      },
    },
  };

  widget.pay(
    "charge",
    {
      // options
      publicId: "test_api_00000000000000000000002",
      accountId: userData.phone,
      invoiceId: userData.userId,
      description: subTitle,
      amount: subPrice,
      currency: "RUB",
      data: data,
      payer: {
        phone: userData.phone,
      },
    },
    {
      onSuccess: function (options) {
        // fetch("/api/success", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ userId: userData.userId }),
        // });
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

(function init() {
  const userId = new URLSearchParams(window.location.search).get("token");
  if (!userId) {
    return;
  }

  fetch(`/api/user?id=${userId}`)
    .then((res) => res.json())
    .then((data) => {
      pay({ ...data, userId });
    });
})();
