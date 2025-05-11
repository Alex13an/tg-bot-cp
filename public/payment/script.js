this.pay = function () {
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
        label: "Наименование товара 3", //наименование товара
        price: 300.0, //цена
        quantity: 3.0, //количество
        amount: 900.0, //сумма
        vat: 20, //ставка НДС
        method: 0, // тег-1214 признак способа расчета - признак способа расчета
        object: 0, // тег-1212 признак предмета расчета - признак предмета товара, работы, услуги, платежа, выплаты, иного предмета расчета
      },
    ],
    taxationSystem: 0, //система налогообложения; необязательный, если у вас одна система налогообложения
    email: "user@example.com", //e-mail покупателя, если нужно отправить письмо с чеком
    phone: "", //телефон покупателя в любом формате, если нужно отправить сообщение со ссылкой на чек
    isBso: false, //чек является бланком строгой отчетности
    amounts: {
      electronic: 900.0, // Сумма оплаты электронными деньгами
      advancePayment: 0.0, // Сумма из предоплаты (зачетом аванса) (2 знака после запятой)
      credit: 0.0, // Сумма постоплатой(в кредит) (2 знака после запятой)
      provision: 0.0, // Сумма оплаты встречным предоставлением (сертификаты, др. мат.ценности) (2 знака после запятой)
    },
  };

  const data = {
    //содержимое элемента data
    CloudPayments: {
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
      accountId: "user@example.com",
      description: "Оплата товаров в example.com",
      amount: 123000,
      currency: "RUB",
      invoiceId: 1234567,
      data: data,
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

(function init() {
  const query = new URLSearchParams(window.location.search);

  // Читаем параметры
  const fio = query.get("fio");
  const phone = query.get("phone");

  console.log("PARTS", fio, phone);
  pay();
})();
