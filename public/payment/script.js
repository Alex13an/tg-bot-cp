this.pay = function (userData) {
  let payPrice
  let subPrice
  let subInterval

  switch(userData.sub_type) {
    case 1:
      payPrice = 4000.0
      subPrice = 2000.0
      subInterval = "Month"
      break;
    case 2:
      payPrice = 3700.0
      subPrice = 1700.0
      subInterval = "Month"
      break;
    case 3:
      payPrice = 2.0
      subPrice = 1.0
      subInterval = "Day"
      break;
    default:
      payPrice = 1.0
      subPrice = 1.0
      subInterval = "Day"
      break;
  }

  const subTitle =
    userData.sub_type == 1 ? "Подписка Безлимит" : "Дневная карта";
  const widget = new cp.CloudPayments({
    yandexPaySupport: false,
    applePaySupport: false,
    googlePaySupport: false,
    masterPassSupport: false,
    tinkoffInstallmentSupport: false,
  });

  const firstReceipt = {
    Items: [
      //товарные позиции
      {
        label: subTitle, //наименование товара
        price: subPrice, //цена
        quantity: 1.0, //количество
        amount: payPrice, //сумма
        vat: 20, //ставка НДС
      },
    ],
    taxationSystem: 0, //система налогообложения; необязательный, если у вас одна система налогообложения
    phone: `${userData.phone}`,
  };

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
    phone: `${userData.phone}`,
  };

  const data = {
    //содержимое элемента data
    CloudPayments: {
      phone: `${userData.phone}`,
      CustomerReceipt: firstReceipt, //чек для первого платежа
      recurrent: {
        interval: subInterval,
        amount: subPrice,
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
      accountId: userData.fio,
      invoiceId: userData.userId,
      description: subTitle,
      amount: payPrice,
      currency: "RUB",
      data: data,
      payer: {
        phone: `${userData.phone}`,
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
