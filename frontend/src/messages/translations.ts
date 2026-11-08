/**
 * Unified Multilingual Dictionary (UZ, RU, EN) for ZaminFlow Platform
 * Standardized per DOC-LOC-001 (Uzbek Latin default, Russian, English)
 */

export type Locale = "uz" | "ru" | "en";

export interface Translations {
  nav: {
    brand: string;
    company: string;
    team: string;
    stats: string;
    contact: string;
    signIn: string;
    signUp: string;
    signOut: string;
    dashboard: string;
  };
  hero: {
    headlineStart: string;
    headlineAccent: string;
    subheadline: string;
    joinUs: string;
    exploreStats: string;
    cards: {
      livePricing: string;
      grade: string;
      fat: string;
      snf: string;
      logistics: string;
      cold: string;
      lockEta: string;
      securedEscrow: string;
      bankLocked: string;
      autoRelease: string;
    };
  };
  team: {
    title: string;
    subtitle: string;
    roles: {
      founder: string;
      coFounder: string;
      leadDev: string;
      adviser: string;
    };
  };
  stats: {
    titleStart: string;
    titleAccent: string;
    delayedNotice: string;
    refreshNow: string;
    filterRange: string;
    ranges: {
      today: string;
      d7: string;
      d30: string;
      m12: string;
    };
    allRegions: string;
    avgPrice: string;
    volumeToday: string;
    activeShipments: string;
    securedEscrow: string;
    litersUnit: string;
    currencyUnit: string;
    priceTrendTitle: string;
    titrationAcidity: string;
    fatContent: string;
    snfContent: string;
    subsecondTicker: string;
    qualityGrades: string;
    todaysDeliveries: string;
    byRegion: string;
    pricePerLiter: string;
    liveShipments: string;
    viewAll: string;
    trucksUnit: string;
    low: string;
    high: string;
    retry: string;
    noRegionalData: string;
    noShipmentsData: string;
  };
  liveStats: {
    headingStart: string;
    headingAccent: string;
    subtitle: string;
    cta: string;
    successfulDeals: string;
    platformUsers: string;
    milkTradedDelivered: string;
    dailyAvgPrice: string;
    temporarilyUnavailable: string;
    lastUpdated: string;
  };
  contact: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    fullName: string;
    fullNamePlaceholder: string;
    phoneOrEmail: string;
    phoneOrEmailPlaceholder: string;
    roleLabel: string;
    roles: {
      farmer: string;
      dairy: string;
      driver: string;
      other: string;
    };
    message: string;
    messagePlaceholder: string;
    consent: string;
    privacyPolicy: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    sendAnother: string;
    requiredError: string;
    consentError: string;
  };
  footer: {
    republic: string;
    rights: string;
  };
  regions: {
    all: string;
    tashkent: string;
    samarqand: string;
    fergana: string;
    namangan: string;
    andijan: string;
    qashqadaryo: string;
    syrdarya: string;
    bukhara: string;
    khorezm: string;
    navoiy: string;
    jizzakh: string;
    surxondaryo: string;
    karakalpakstan: string;
  };
}

export const translations: Record<Locale, Translations> = {
  uz: {
    nav: {
      brand: "ZaminFlow",
      company: "Bizning kompaniya",
      team: "Bizning jamoa",
      stats: "Jonli statistika",
      contact: "Bog'lanish",
      signIn: "Kirish",
      signUp: "Ro'yxatdan o'tish",
      signOut: "Chiqish",
      dashboard: "Boshqaruv paneli",
    },
    hero: {
      headlineStart: "Kichik fermerlarni yirik ",
      headlineAccent: "xaridorlar bilan bog'laymiz",
      subheadline:
        "O'zbekiston sut sanoatini raqamli buyurtmalar, logistika optimizatsiyasi, sifatga asoslangan dinamik sut narxlari hamda kafolatlangan eskrou va faktoring to'lovlari bilan kuchaytiramiz.",
      joinUs: "Qo'shiling",
      exploreStats: "Jonli statistika",
      cards: {
        livePricing: "Jonli narx",
        grade: "A+ nav",
        fat: "Yog'lilik",
        snf: "QYSQ",
        logistics: "Logistika",
        cold: "Sovuq",
        lockEta: "GPS 250m qulf • 28 daqiqa ETA",
        securedEscrow: "Himoyalangan eskrou",
        bankLocked: "Bank hisobida bloklangan",
        autoRelease: "Titrlash tekshiruvidan so'ng avto-chiqarish",
      },
    },
    team: {
      title: "Bizning jamoa",
      subtitle: "O'zbekistonning raqamli sut infratuzilmasi ortidagi fidoyi mutaxassislar.",
      roles: {
        founder: "Asoschi",
        coFounder: "Hammuassis",
        leadDev: "Yetakchi dasturchi",
        adviser: "Maslahatchi",
      },
    },
    stats: {
      titleStart: "Faol",
      titleAccent: "savdo ko'rsatkichlari",
      delayedNotice: "Eslatma: Jonli telemetriya kechikmoqda. Keshdagi savdo ma'lumotlari ko'rsatilmoqda.",
      refreshNow: "Yangilash",
      filterRange: "Vaqt oralig'ini tanlang",
      ranges: {
        today: "Bugun",
        d7: "7 kun",
        d30: "30 kun",
        m12: "12 oy",
      },
      allRegions: "Barcha viloyatlar",
      avgPrice: "Xom sut o'rtacha narxi",
      volumeToday: "Bugungi savdo hajmi",
      activeShipments: "Yo'ldagi partiyalar",
      securedEscrow: "Eskrouda saqlanmoqda",
      litersUnit: "litr",
      currencyUnit: "so'm",
      priceTrendTitle: "Narx tendensiyasi va sifat indeksi",
      titrationAcidity: "Titrlanadigan kislotalilik",
      fatContent: "Yog'lilik darajasi",
      snfContent: "Quruq yog'siz qoldiq (QYSQ)",
      subsecondTicker: "Jonli tiker",
      qualityGrades: "Sifat navlari",
      todaysDeliveries: "Bugungi yetkazib berishlar",
      byRegion: "Hududlar bo'yicha",
      pricePerLiter: "Litr narxi, so'm",
      liveShipments: "Jonli yuk tashishlar",
      viewAll: "Barchasini ko'rish",
      trucksUnit: "mashina",
      low: "Past",
      high: "Baland",
      retry: "Qayta urinish",
      noRegionalData: "Ushbu hudud bo'yicha ma'lumot mavjud emas.",
      noShipmentsData: "Ayni paytda faol yuk tashishlar mavjud emas.",
    },
    liveStats: {
      headingStart: "Haqiqiy bitimlar, toza sut, ",
      headingAccent: "haqiqiy narxlar",
      subtitle: "ZaminFlow platformasidagi jonli ma'lumotlar, har daqiqada yangilanadi.",
      cta: "Jonli ko'rsatkichlarni ko'rish →",
      successfulDeals: "Muvaffaqiyatli bitimlar",
      platformUsers: "Platforma foydalanuvchilari",
      milkTradedDelivered: "Savdo qilingan va yetkazilgan sut",
      dailyAvgPrice: "Kunlik o'rtacha xom sut narxi",
      temporarilyUnavailable: "Ma'lumotlar vaqtincha mavjud emas",
      lastUpdated: "Oxirgi yangilanish",
    },
    contact: {
      badge: "Bog'lanish",
      titleStart: "Sut ta'minoti zanjiringiz haqida ",
      titleAccent: "gaplashamiz",
      fullName: "To'liq ism (F.I.SH)",
      fullNamePlaceholder: "Ism va familiyangiz",
      phoneOrEmail: "Telefon yoki elektron pochta",
      phoneOrEmailPlaceholder: "+998 90 123 45 67",
      roleLabel: "Men — …",
      roles: {
        farmer: "Fermer xo'jaligi",
        dairy: "Sutni qayta ishlash korxonasi",
        driver: "Logistika haydovchisi",
        other: "Boshqa hamkor",
      },
      message: "Xabar",
      messagePlaceholder: "Sizga qanday yordam bera olamiz?",
      consent: "Shaxsiy ma'lumotlarimni qayta ishlashga rozilik bildiraman: ",
      privacyPolicy: "Maxfiylik siyosati",
      submitBtn: "Xabarni yuborish →",
      submitting: "Yuborilmoqda...",
      successTitle: "Xabar muvaffaqiyatli yuborildi",
      successDesc: "Rahmat! Murojaatingiz hududiy ta'minot bo'limiga yo'naltirildi. Mutaxassis tez orada siz bilan bog'lanadi.",
      sendAnother: "Yana xabar yuborish",
      requiredError: "Iltimos, yuborishdan oldin barcha majburiy maydonlarni to'ldiring.",
      consentError: "Iltimos, Maxfiylik siyosatiga rozilik bildiring.",
    },
    footer: {
      republic: "O'zbekiston Respublikasi",
      rights: "© 2026 ZaminFlow Technologies. Barcha huquqlar himoyalangan.",
    },
    regions: {
      all: "Barcha viloyatlar",
      tashkent: "Toshkent shahri va viloyati",
      samarqand: "Samarqand viloyati",
      fergana: "Farg'ona viloyati",
      namangan: "Namangan viloyati",
      andijan: "Andijon viloyati",
      qashqadaryo: "Qashqadaryo viloyati",
      syrdarya: "Sirdaryo viloyati",
      bukhara: "Buxoro viloyati",
      khorezm: "Xorazm viloyati",
      navoiy: "Navoiy viloyati",
      jizzakh: "Jizzax viloyati",
      surxondaryo: "Surxondaryo viloyati",
      karakalpakstan: "Qoraqalpog'iston Respublikasi",
    },
  },
  ru: {
    nav: {
      brand: "ZaminFlow",
      company: "О компании",
      team: "Команда",
      stats: "Живая статистика",
      contact: "Контакты",
      signIn: "Войти",
      signUp: "Регистрация",
      signOut: "Выйти",
      dashboard: "Панель управления",
    },
    hero: {
      headlineStart: "Объединяем фермеров с ",
      headlineAccent: "коммерческими переработчиками",
      subheadline:
        "Развитие молочной отрасли Узбекистана: цифровые заказы, оптимизация логистики, динамическое ценообразование по качеству и защищенные эскроу- и факторинговые выплаты.",
      joinUs: "Присоединиться",
      exploreStats: "Живая статистика",
      cards: {
        livePricing: "Текущая цена",
        grade: "Высший сорт",
        fat: "Жир",
        snf: "СОМО",
        logistics: "Логистика",
        cold: "Охлаждение",
        lockEta: "GPS фиксация 250м • 28 мин до прибытия",
        securedEscrow: "Защищенный эскроу",
        bankLocked: "Заблокировано в банке",
        autoRelease: "Автовыплата после проверки титрования",
      },
    },
    team: {
      title: "Наша команда",
      subtitle: "Команда создателей цифровой молочной инфраструктуры Узбекистана.",
      roles: {
        founder: "Основатель",
        coFounder: "Сооснователь",
        leadDev: "Ведущий разработчик",
        adviser: "Советник",
      },
    },
    stats: {
      titleStart: "Активные",
      titleAccent: "показатели торгов",
      delayedNotice: "Внимание: Поток телеметрии задерживается. Отображаются сохраненные данные.",
      refreshNow: "Обновить",
      filterRange: "Период времени",
      ranges: {
        today: "Сегодня",
        d7: "7 дней",
        d30: "30 дней",
        m12: "12 мес.",
      },
      allRegions: "Все регионы",
      avgPrice: "Средняя цена сырого молока",
      volumeToday: "Объем торгов за сегодня",
      activeShipments: "Активные партии в пути",
      securedEscrow: "Защищено в эскроу",
      litersUnit: "л",
      currencyUnit: "UZS",
      priceTrendTitle: "Динамика цен и индекс качества",
      titrationAcidity: "Титруемая кислотность",
      fatContent: "Массовая доля жира",
      snfContent: "СОМО",
      subsecondTicker: "Тикер сделок",
      qualityGrades: "Сорта качества",
      todaysDeliveries: "Поставки за сегодня",
      byRegion: "По регионам",
      pricePerLiter: "Цена за литр, UZS",
      liveShipments: "Рейсы в реальном времени",
      viewAll: "Смотреть все",
      trucksUnit: "рейсов",
      low: "Мин.",
      high: "Макс.",
      retry: "Повторить",
      noRegionalData: "Нет данных по выбранному региону.",
      noShipmentsData: "В настоящее время нет активных рейсов.",
    },
    liveStats: {
      headingStart: "Реальные сделки, чистое молоко, ",
      headingAccent: "реальные цены",
      subtitle: "Прямые данные с платформы ZaminFlow, обновляются каждую минуту.",
      cta: "Смотреть показатели онлайн →",
      successfulDeals: "Успешные сделки",
      platformUsers: "Пользователи платформы",
      milkTradedDelivered: "Продано и доставлено молока",
      dailyAvgPrice: "Среднесуточная цена сырого молока",
      temporarilyUnavailable: "Данные временно недоступны",
      lastUpdated: "Последнее обновление",
    },
    contact: {
      badge: "Контакты",
      titleStart: "Обсудим вашу цепочку ",
      titleAccent: "поставок молока",
      fullName: "Полное имя (ФИО)",
      fullNamePlaceholder: "Ваше имя и фамилия",
      phoneOrEmail: "Телефон или эл. почта",
      phoneOrEmailPlaceholder: "+998 90 123 45 67",
      roleLabel: "Я — …",
      roles: {
        farmer: "Фермерское хозяйство",
        dairy: "Молокоперерабатывающий завод",
        driver: "Водитель-логист",
        other: "Другой партнер",
      },
      message: "Сообщение",
      messagePlaceholder: "Чем мы можем помочь?",
      consent: "Я согласен на обработку персональных данных в соответствии с ",
      privacyPolicy: "Политикой конфиденциальности",
      submitBtn: "Отправить сообщение →",
      submitting: "Отправка...",
      successTitle: "Сообщение успешно отправлено",
      successDesc: "Спасибо! Ваше обращение передано региональной команде. Специалист свяжется с вами в ближайшее время.",
      sendAnother: "Отправить еще сообщение",
      requiredError: "Пожалуйста, заполните все обязательные поля.",
      consentError: "Пожалуйста, подтвердите согласие с Политикой конфиденциальности.",
    },
    footer: {
      republic: "Республика Узбекистан",
      rights: "© 2026 ZaminFlow Technologies. Все права защищены.",
    },
    regions: {
      all: "Все регионы",
      tashkent: "Ташкент и Ташкентская обл.",
      samarqand: "Самаркандская область",
      fergana: "Ферганская область",
      namangan: "Наманганская область",
      andijan: "Андижанская область",
      qashqadaryo: "Кашкадарьинская область",
      syrdarya: "Сырдарьинская область",
      bukhara: "Бухарская область",
      khorezm: "Хорезмская область",
      navoiy: "Навоийская область",
      jizzakh: "Джизакская область",
      surxondaryo: "Сурхандарьинская область",
      karakalpakstan: "Республика Каракалпакстан",
    },
  },
  en: {
    nav: {
      brand: "ZaminFlow",
      company: "Our Company",
      team: "Our Team",
      stats: "Live statistics",
      contact: "Contact us",
      signIn: "Sign in",
      signUp: "Sign up",
      signOut: "Sign out",
      dashboard: "Dashboard",
    },
    hero: {
      headlineStart: "Connecting smallholder farmers with ",
      headlineAccent: "commercial buyers",
      subheadline:
        "Empowering Uzbekistan's dairy industry through digital ordering, logistics optimization, dynamic quality-based milk pricing, and secure escrow & factoring payment workflows.",
      joinUs: "Join Us",
      exploreStats: "Explore Live Stats",
      cards: {
        livePricing: "Live Pricing",
        grade: "Grade A+",
        fat: "Fat",
        snf: "SNF",
        logistics: "Logistics",
        cold: "Cold",
        lockEta: "GPS 250m Lock • 28 min ETA",
        securedEscrow: "Secured Escrow",
        bankLocked: "Bank Vault Locked",
        autoRelease: "Auto-release upon titration",
      },
    },
    team: {
      title: "Our Team",
      subtitle: "The dedicated builders behind Uzbekistan's digital dairy infrastructure.",
      roles: {
        founder: "Founder",
        coFounder: "Co-Founder",
        leadDev: "Lead Software Developer",
        adviser: "Adviser",
      },
    },
    stats: {
      titleStart: "Active",
      titleAccent: "Trade Metrics",
      delayedNotice: "Notice: Real-time telemetry feed is delayed. Showing cached trade data.",
      refreshNow: "Refresh now",
      filterRange: "Filter time range",
      ranges: {
        today: "Today",
        d7: "7D",
        d30: "30D",
        m12: "12M",
      },
      allRegions: "All regions",
      avgPrice: "Avg. Raw Milk Price",
      volumeToday: "Volume Traded Today",
      activeShipments: "Active Shipments",
      securedEscrow: "Secured in Escrow",
      litersUnit: "L",
      currencyUnit: "UZS",
      priceTrendTitle: "Price Trend & Quality Index",
      titrationAcidity: "Titration Acidity",
      fatContent: "Fat Content",
      snfContent: "SNF Content",
      subsecondTicker: "Sub-second Ticker",
      qualityGrades: "Quality grades",
      todaysDeliveries: "Today's deliveries",
      byRegion: "By region",
      pricePerLiter: "Price per litre, UZS",
      liveShipments: "Live shipments",
      viewAll: "View all",
      trucksUnit: "trucks",
      low: "Low",
      high: "High",
      retry: "Retry",
      noRegionalData: "No regional breakdown available for this selection.",
      noShipmentsData: "No active shipments currently reporting telemetry.",
    },
    liveStats: {
      headingStart: "Real deals, real milk, ",
      headingAccent: "real prices",
      subtitle: "Live figures from the ZaminFlow platform, refreshed every minute.",
      cta: "Explore live metrics →",
      successfulDeals: "Successful deals",
      platformUsers: "Platform users",
      milkTradedDelivered: "Milk traded & delivered",
      dailyAvgPrice: "Daily avg. raw milk price",
      temporarilyUnavailable: "Data temporarily unavailable",
      lastUpdated: "Last updated",
    },
    contact: {
      badge: "Contact us",
      titleStart: "Let's talk about your ",
      titleAccent: "dairy supply chain",
      fullName: "Full name",
      fullNamePlaceholder: "Your full name",
      phoneOrEmail: "Phone or email",
      phoneOrEmailPlaceholder: "+998 90 123 45 67",
      roleLabel: "I am a…",
      roles: {
        farmer: "Dairy Farmer",
        dairy: "Dairy Processor",
        driver: "Logistics Driver",
        other: "Partner / Other",
      },
      message: "Message",
      messagePlaceholder: "How can we help?",
      consent: "I agree to the processing of my personal data in line with the ",
      privacyPolicy: "Privacy Policy",
      submitBtn: "Send message →",
      submitting: "Sending inquiry...",
      successTitle: "Message Sent Successfully",
      successDesc: "Thank you! Your inquiry has been routed to our regional supply team. A specialist will follow up shortly.",
      sendAnother: "Send another message",
      requiredError: "Please complete all required fields before sending.",
      consentError: "Please confirm your consent to the Privacy Policy.",
    },
    footer: {
      republic: "Republic of Uzbekistan",
      rights: "© 2026 ZaminFlow Technologies. All Rights Reserved.",
    },
    regions: {
      all: "All regions",
      tashkent: "Tashkent City & Region",
      samarqand: "Samarqand Region",
      fergana: "Fergana Region",
      namangan: "Namangan Region",
      andijan: "Andijan Region",
      qashqadaryo: "Qashqadaryo Region",
      syrdarya: "Syrdarya Region",
      bukhara: "Bukhara Region",
      khorezm: "Khorezm Region",
      navoiy: "Navoiy Region",
      jizzakh: "Jizzakh Region",
      surxondaryo: "Surxondaryo Region",
      karakalpakstan: "Republic of Karakalpakstan",
    },
  },
};
