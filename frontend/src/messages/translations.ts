/**
 * Unified Multilingual Dictionary (UZ, RU, EN) for ZaminFlow Platform
 * Standardized per DOC-LOC-001 (Uzbek Latin default, Russian, English)
 */

export type Locale = "uz" | "ru" | "en";

export interface SimulatorStepTranslation {
  step: number;
  roleKey: string;
  roleTitle: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  badgeColor: string;
  details: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  systemLog: string;
  actionText: string;
}

export interface Translations {
  nav: {
    brand: string;
    benefits: string;
    demo: string;
    team: string;
    stats: string;
    contact: string;
    signIn: string;
    signUp: string;
    signOut: string;
    dashboard: string;
  };
  hero: {
    headlineLine1: string;
    headlineLine2: string;
    headlineLine3: string;
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
  statsBar: {
    regionsTitle: string;
    regionsSub: string;
    milkTitle: string;
    milkSub: string;
    partnersTitle: string;
    partnersSub: string;
    escrowTitle: string;
    escrowSub: string;
  };
  benefitsSection: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    cards: Array<{
      icon: string;
      badge: string;
      title: string;
      description: string;
      gradient: string;
    }>;
  };
  simulatorSection: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    subtitle: string;
    stepBadge: string;
    actionComplete: string;
    nextStepBtn: string;
    restartBtn: string;
    steps: SimulatorStepTranslation[];
  };
  mapSection: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    titleEnd: string;
    subtitle: string;
    activeRegionLabel: string;
    monthlyVolumeLabel: string;
    avgPriceLabel: string;
    fatSnfLabel: string;
    gradeText: string;
    coldStorageLabel: string;
    certifiedFarmsSuffix: string;
    viewLotBtn: string;
  };
  team: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    title: string;
    subtitle: string;
    roles: {
      founder: string;
      coFounder: string;
      leadDev: string;
      adviser: string;
    };
    badges: {
      founder: string;
      coFounder: string;
      leadDev: string;
      adviser: string;
    };
  };
  testimonialsSection: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    subtitle: string;
    items: Array<{
      quote: string;
      name: string;
      role: string;
      company: string;
      rating: number;
      initials: string;
    }>;
  };
  faqSection: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    subtitle: string;
    emailPlaceholder: string;
    sendBtn: string;
    sending: string;
    successMsg: string;
    errorEmailMsg: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  footerSection: {
    mission: string;
    companyCol: string;
    benefits: string;
    team: string;
    liveStats: string;
    ecosystemCol: string;
    forFarmers: string;
    forDairies: string;
    forLogistics: string;
    forBanks: string;
    legalCol: string;
    stir: string;
    legalText: string;
    allRightsReserved: string;
    privacyPolicy: string;
    termsOfUse: string;
  };
  profileView: {
    backToDashboard: string;
    dossierLabel: string;
    dealFlow: string;
    escrowDepository: string;
    editProfile: string;
    shareTooltip: string;
    exportTooltip: string;
    callTooltip: string;
    emailTooltip: string;
    tabs: {
      overview: string;
      specs: string;
      contracts: string;
      team: string;
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
      benefits: "Afzalliklar",
      demo: "Jonli Demo",
      team: "Bizning jamoa",
      stats: "Jonli statistika",
      contact: "Boğlaniş",
      signIn: "Kiriş",
      signUp: "Röyxatdan ötiş",
      signOut: "Çiqiş",
      dashboard: "Boşqaruv paneli",
    },
    hero: {
      headlineLine1: "Kiçik Fermerlarni",
      headlineLine2: "Yirik Xaridorlar Bilan",
      headlineLine3: "Boğlaymiz!",
      headlineStart: "Kiçik fermerlarni yirik ",
      headlineAccent: "xaridorlar bilan boğlaymiz",
      subheadline:
        "Özbekiston sut sanoatini raqamli buyurtmalar, logistika optimizatsiyasi, sifatga asoslangan dinamik sut narxlari hamda kafolatlangan eskrou va faktoring tölovlari bilan kuçaytiramiz.",
      joinUs: "Qöşiling",
      exploreStats: "Jonli statistika",
      cards: {
        livePricing: "Jonli narx",
        grade: "A+ nav",
        fat: "Yoğlilik",
        snf: "QYSQ",
        logistics: "Logistika",
        cold: "Sovuq",
        lockEta: "GPS 250m qulf • 28 daqiqa ETA",
        securedEscrow: "Himoyalangan eskrou",
        bankLocked: "Bank hisobida bloklangan",
        autoRelease: "Titrlaş tekşiruvidan söng avto-çiqariş",
      },
    },
    statsBar: {
      regionsTitle: "Viloyat Qamrovi",
      regionsSub: "Özbekiston böylab töliq tarmoq",
      milkTitle: "Kafolatlangan Sut",
      milkSub: "Oylik yetkazib beriş (litr)",
      partnersTitle: "Tasdiqlangan Hamkor",
      partnersSub: "Fermer, zavod va tankerlar",
      escrowTitle: "Eskrou Kafolati",
      escrowSub: "Bank darajasidagi xavfsiz tölov",
    },
    benefitsSection: {
      badge: "AFZALLIKLARIMIZ",
      title1: "Sut Bozorida Yangi Davrni ",
      title2: "Biz Bilan Boşlang!",
      subtitle:
        "An'anaviy sut yetkazib berişdagi yöqotişlar va keçikkan tölovlarga çek qöying. ZaminFlow barça jarayonlarni raqamlaştiradi.",
      cards: [
        {
          icon: "🌐",
          badge: "Töğridan-töğri B2B",
          title: "Keng Tanlov & Şaffof Narx",
          description:
            "Örtakaşlarsiz 450+ tekşirilgan sut fermalari va qayta işlovçi zavodlar bilan töğridan-töğri savdo qiling.",
          gradient: "from-[#00ffc8]/20 via-[#00d3e0]/10 to-transparent",
        },
        {
          icon: "🚛",
          badge: "IoT Telematika",
          title: "Aqlli Sovuq Zanjir",
          description:
            "Har bir sut taşuvçi tankerning +3.2°C harorati va GPS marşruti IoT datçiklar orqali uzluksiz monitoring qilinadi.",
          gradient: "from-[#00d3e0]/20 via-[#0099ff]/10 to-transparent",
        },
        {
          icon: "🛡️",
          badge: "Bank Eskrou",
          title: "Kafolatlangan Tölov",
          description:
            "Mablağ bank eskrou hisobida saqlanadi va faqat zavod laboratoriyasi sifatni tasdiqlaganidan söng avtomatik çiqariladi.",
          gradient: "from-[#0099ff]/20 via-[#00ffc8]/10 to-transparent",
        },
      ],
    },
    simulatorSection: {
      badge: "INTERAKTIV TIZIM",
      titleStart: "Şartnomadan Tölovgaça: ",
      titleAccent: "Töliq Jarayon Simulyatsiyasi",
      subtitle:
        "5 bosqiçli interaktiv demo orqali xom sut partiyasi qanday yaratilişi, bankda bloklanişi, sovuq zanjirda yetkazilişi va tölov çiqişini köring.",
      stepBadge: "Bosqiç",
      actionComplete: "Bajarildi ✓",
      nextStepBtn: "Keyingi Bosqiçga Ötiş →",
      restartBtn: "Simulyatsiyani Qaytadan Boşlaş ↺",
      steps: [
        {
          step: 1,
          roleKey: "farmer",
          roleTitle: "Fermer (Işlab Çiqaruvçi)",
          title: "Xom Sut Partiyasini Eʼlon Qiliş",
          subtitle: "Sayxunobod Agro-Dairy Farm yangi soğilgan 5,000 L sutni tizimga joylaydi",
          icon: "🌾",
          badge: "Partiya Yaratildi",
          badgeColor: "#00ffc8",
          details: [
            { label: "Ferma Nomi", value: "Sayxunobod Agro MÇJ (№ UZ-99412)" },
            { label: "Sut Hajmi", value: "5,000 Litr", highlight: true },
            { label: "Sifat Körsatkiçi", value: "4.15% Yoğ • 8.65% SNF" },
            { label: "Boşlanğiç Sovutiş", value: "+3.2°C (GEA Tankida)" },
            { label: "Taklif Narxi", value: "4,450 UZS / Litr" },
            { label: "Jami Şartnoma Qiymati", value: "22,250,000 UZS", highlight: true },
          ],
          systemLog: "HAŞ-01: Smart-kontrakt partiya #ZF-9042 uçun muvaffaqiyatli yaratildi.",
          actionText: "Zavod Buyurtmasiga Ötiş",
        },
        {
          step: 2,
          roleKey: "bank",
          roleTitle: "Bank & Eskrou Depozitariysi",
          title: "100% Kafolatlangan Eskrou Bloklaş",
          subtitle: "Samarqand Sut Zavodi buyurtma beradi, AgroBank tölovni tranzit depozitga oladi",
          icon: "🏦",
          badge: "Eskrou Qulflangan",
          badgeColor: "#0099ff",
          details: [
            { label: "Xaridor Zavod", value: "Samarqand Sut Zavodi #4 MÇJ" },
            { label: "Depozitariy Hamkor", value: "AgroBank ATB (MB Litsenziyasi №14)" },
            { label: "Muzlatilgan Summa", value: "22,250,000 UZS", highlight: true },
            { label: "Kriptografik Protokol", value: "ISO 20022 (pacs.008 kliring)" },
            { label: "Fermer Kafolati", value: "100% Depozit Taʼminlangan" },
            { label: "Tölov Kafillik Kodi", value: "ESCROW-AGRO-2026-X89", highlight: true },
          ],
          systemLog: "HAŞ-02: Mablağ tranzit hisobvaraqda qulflangan. Logistika yuklaşga ruxsat berildi.",
          actionText: "Tanker Logistikasini Boşlaş",
        },
        {
          step: 3,
          roleKey: "driver",
          roleTitle: "Sovuq Zanjir Logistika Floti",
          title: "Tanker Yuklaş & IoT Telemetriya",
          subtitle: "MAN TGX 18.440 sisternasi e-TTN QR orqali partiyani qabul qiladi",
          icon: "🚛",
          badge: "Tranzitda: +3.2°C",
          badgeColor: "#00d3e0",
          details: [
            { label: "Transport & Haydovçi", value: "MAN TGX 18.440 (01 | 777 ZAM) • Bobur A." },
            { label: "Elektron Yöl Varaqasi", value: "e-TTN QR № TTN-2026-4412" },
            { label: "Termo-Sensorlar (PT100)", value: "+3.2°C (Barqaror sovutilgan)", highlight: true },
            { label: "GPS Sunʼiy Yöldoş", value: "RTK 0.5m aniqlik (Toşkent yölagi)" },
            { label: "Klapan Qulflari", value: "Elektron germetik plomba FAOL" },
            { label: "Taxminiy Yetib Boriş", value: "1 soat 45 daqiqa (98 km)", highlight: true },
          ],
          systemLog: "HAŞ-03: Real-vaqt telemetriya maʼlumotlari zanjirga yozilmoqda. Harorat normada.",
          actionText: "Zavod Darvoza Laboratoriyasiga Yetkaziş",
        },
        {
          step: 4,
          roleKey: "dairy",
          roleTitle: "Zavod Ekspress Laboratoriyasi",
          title: "15 Daqiqalik Ekspress Sifat Tahlili",
          subtitle: "Zavod qabulxonasida titratsiya, Gerber sentrifugasi va antibiotik tekşiruvi",
          icon: "🔬",
          badge: "Oliy A+ Tasdiqlandi",
          badgeColor: "#00ffc8",
          details: [
            { label: "Haqiqiy Yoğlilik (Gerber)", value: "4.18% (Talab: > 3.8%) ✓", highlight: true },
            { label: "Quruq Qoldiq (SNF)", value: "8.68% (Meʼyorida) ✓" },
            { label: "Ziçlik (Laktometr)", value: "1.028 g/sm³ ✓" },
            { label: "Antibiotik Tahlili", value: "NOL (Toza sut) ✓", highlight: true },
            { label: "Qabul Harorati", value: "+3.3°C (Sovuq zanjir buzilmagan)" },
            { label: "Qabul Dalolatnomasi", value: "Elektron E-IMZO bilan tasdiqlandi", highlight: true },
          ],
          systemLog: "HAŞ-04: Laboratoriya natijalari ISO 20022 protokoliga yuklandi. Eskrouga signal berildi.",
          actionText: "Eskrou Tölovini Fermerga Çiqariş",
        },
        {
          step: 5,
          roleKey: "bank",
          roleTitle: "Avtomatik Hisob-Kitob",
          title: "Tezkor Eskrou Tölovi & Faktoring",
          subtitle: "Mablağ fermer hisobiga 1 daqiqada tuşadi, heç qanday qarzdorliksiz",
          icon: "⚡",
          badge: "Tölov Amalga Oşirildi",
          badgeColor: "#00ffc8",
          details: [
            { label: "Çiqarilgan Summa", value: "22,250,000 UZS", highlight: true },
            { label: "Tranzaksiya Turi", value: "Avtomatik Bank Kliringi (RTGS)" },
            { label: "Komissiya", value: "0% (Xaridor tomonidan tölangan)" },
            { label: "Fermer Balansi", value: "+22,250,000 UZS (Mablağ tuşdi)" },
            { label: "Faktoring Imkoniyati", value: "Tasdiqlangan şartnoma böyiça oçiq" },
            { label: "Audit va Soliq Hujjati", value: "E-Faktura № EF-99412 yaratildi", highlight: true },
          ],
          systemLog: "HAŞ-05: Şartnoma töliq yakunlandi. Fermerga SMS-xabarnoma yuborildi.",
          actionText: "Jarayon Muvaffaqiyatli Yakunlandi",
        },
      ],
    },
    mapSection: {
      badge: "ÖZBEKISTON MILLIY SUT AGROSANOAT XARITASI",
      titleStart: "Hududingizdagi Eng Maqbul ",
      titleAccent: "Sut Partiyalarini ",
      titleEnd: "Toping",
      subtitle:
        "14 ta maʼmuriy hudud böylab real vaqt rejimida sertifikatlangan xom sut narxlari, hajmlari va sovuq zanjir tanker logistikasi telemetriyasi.",
      activeRegionLabel: "FAOL HUDUD",
      monthlyVolumeLabel: "Oylik Hajm:",
      avgPriceLabel: "Örtaça Narx:",
      fatSnfLabel: "Yoğlilik (SNF):",
      gradeText: "(A+ nav)",
      coldStorageLabel: "Sovuq Saqlaş:",
      certifiedFarmsSuffix: "ta tasdiqlangan fermer",
      viewLotBtn: "Partiyani Köriş →",
    },
    team: {
      badge: "FIDOYI MUTAXASSISLAR",
      titleStart: "Bizning ",
      titleAccent: "Jamoa",
      title: "Bizning jamoa",
      subtitle: "Özbekistonning raqamli sut infratuzilmasi va fintex ekotizimi ortidagi mutaxassislar.",
      roles: {
        founder: "Asosçi & Boş Direktor",
        coFounder: "Hammuassis & Operatsiyalar",
        leadDev: "Yetakçi Muhandis",
        adviser: "Strategik Maslahatçi",
      },
      badges: {
        founder: "Boşqaruvçi",
        coFounder: "Operatsiyalar",
        leadDev: "Yetakçi Muhandis",
        adviser: "Strategik Maslahatçi",
      },
    },
    testimonialsSection: {
      badge: "IŞLAB ÇIQARUVÇILAR FIKRI",
      titleStart: "Biznes Hamkorlarimiz ",
      titleAccent: "Nima Deydi?",
      subtitle: "Fermerlar, sutni qayta işlovçi zavodlar va logistika operatorlarining real tajribalari.",
      items: [
        {
          quote:
            "ZaminFlow platformasi tufayli oylik 120,000 litr sutimizni kafolatlangan narxda va bir kun ham keçikmagan tölov bilan sotyapmiz.",
          name: "Alişer Qodirov",
          role: "Boş Fermer",
          company: "Sayxunobod Baraka Çorva MÇJ",
          rating: 5,
          initials: "AQ",
        },
        {
          quote:
            "Zavodimizga kelayotgan har bir tankerning harorati va yoğlilik darajasi yöldayoq ma'lum. Qabuldagi nizolar 90% ga kamaydi.",
          name: "Nodira Karimova",
          role: "Boş Texnolog",
          company: "Toşkent Sut Kombinati",
          rating: 5,
          initials: "NK",
        },
        {
          quote:
            "Izolyatsiyalangan sisterna harorati datçiklar orqali mobil ilovamda körinadi. Şaffof reyslar tufayli buyurtmalarim 3 barobar oşdi.",
          name: "Rustam Mahmudov",
          role: "Logistika Operatori",
          company: "ÖzTrans Sovuq Zanjir",
          rating: 5,
          initials: "RM",
        },
        {
          quote:
            "Eskrou kafolati orqali bank fermerlarga ham, yirik xaridorlarga ham foizsiz faktoring va likvidlik taqdim etiş imkoniga ega böldi.",
          name: "Sardor Valiev",
          role: "Savdo Moliyasi Rahbari",
          company: "AgroBank Hamkor",
          rating: 5,
          initials: "SV",
        },
      ],
    },
    faqSection: {
      badge: "SAVOLLAR VA ALOQA",
      titleStart: "Savollaringiz Bormi? ",
      titleAccent: "Bizga Yozing!",
      subtitle:
        "Platformaga ulaniş, laboratoriya integratsiyasi yoki eskrou tölovlari böyiça mutaxassislarimiz har doim yordamga tayyor.",
      emailPlaceholder: "Elektron poçtangizni kiriting...",
      sendBtn: "Yuboriş",
      sending: "Yuborilmoqda...",
      successMsg: "Rahmat! Mutaxassisimiz tez orada siz bilan boğlanadi.",
      errorEmailMsg: "Iltimos, töğri elektron poçta manzilini kiriting.",
      items: [
        {
          question: "ZaminFlow orqali sut qanday sotiladi yoki xarid qilinadi?",
          answer:
            "Fermer öz fermasi va sut hajmini tizimga kiritadi. Yirik xaridorlar (zavodlar) taklifni körib, buyurtma beradi. Tizim avtomatik tarzda eng yaqin izolyatsiyalangan sovutilgan tankerni biriktiradi va bank eskrou tölovini bloklaydi.",
        },
        {
          question: "Sut sifatining laboratoriya tekşiruvi qanday amalga oşiriladi?",
          answer:
            "Tanker fermadan yuklanganda va zavod darvozasiga yetib kelganda Raqamli Gate-Lab moduli orqali yoğlilik (kamida 3.6%), QYSQ (kamida 8.2%), harorat (+4°C gaça) va titrlaş nordonligi tekşirilib, dalolatnoma elektron imzolanadi.",
        },
        {
          question: "Eskrou hisobidagi tölov fermerga qaçon yetib boradi?",
          answer:
            "Zavod laboratoriyasi qabul dalolatnomasini tasdiqlagan zahoti bank eskrou hisobidagi mablağ avtomatik ravişda fermerning hisob raqamiga ötkaziladi. Odatda bu 15 daqiqadan oşmaydi.",
        },
        {
          question: "Platformada röyxatdan ötiş fermerlar uçun bepulmi?",
          answer:
            "Ha, barça kiçik va örta sut fermerlari platformadan röyxatdan ötiş va birinçi şartnomalarini rasmiylaştiriş mutlaqo bepul amalga oşiriladi.",
        },
      ],
    },
    footerSection: {
      mission:
        "Özbekiston milliy B2B sut ta'minot zanjiri, IoT sovuq zanjir monitoringi va bank tomonidan kafolatlangan eskrou tölovlari platformasi.",
      companyCol: "Kompaniya",
      benefits: "Afzalliklar",
      team: "Bizning jamoa",
      liveStats: "Jonli statistika",
      ecosystemCol: "Ekotizim & Rollar",
      forFarmers: "Fermerlar uçun",
      forDairies: "Sutni qayta işlovçi zavodlar",
      forLogistics: "Sovuq zanjir logistika parki",
      forBanks: "Hamkor banklar va eskrou",
      legalCol: "Yuridik & Boğlaniş",
      stir: "“ZaminFlow” MÇJ • STIR: 309 845 120",
      legalText:
        "Özbekiston Respublikasi \"Elektron tijorat töğrisida\"gi ZRU-792-son Qonuniga muvofiq.",
      allRightsReserved: "Barça huquqlar himoyalangan.",
      privacyPolicy: "Maxfiylik siyosati",
      termsOfUse: "Foydalaniş şartlari",
    },
    profileView: {
      backToDashboard: "← Boşqaruv Paneliga Qaytiş",
      dossierLabel: "Dosyesi",
      dealFlow: "Savdo & Operatsiyalar",
      escrowDepository: "Eskrou Depozitariysi",
      editProfile: "Profilni Tahrirlaş",
      shareTooltip: "Profil havolasini ulaşiş (nusxalaş)",
      exportTooltip: "Rasmiy Raqamli Pasportni Yuklab Oliş (JSON)",
      callTooltip: "Qönğiroq qiliş",
      emailTooltip: "Email yuboriş",
      tabs: {
        overview: "Umumiy Tavsif & Quvvat",
        specs: "Savdo & Texnik Standartlar",
        contracts: "Eskrou & Işonç Körsatkiçlari",
        team: "Boşqaruv & Mas'ullar",
      },
    },
    stats: {
      titleStart: "Faol",
      titleAccent: "savdo körsatkiçlari",
      delayedNotice: "Eslatma: Jonli telemetriya keçikmoqda. Keşdagi savdo ma'lumotlari körsatilmoqda.",
      refreshNow: "Yangilaş",
      filterRange: "Vaqt oraliğini tanlang",
      ranges: {
        today: "Bugun",
        d7: "7 kun",
        d30: "30 kun",
        m12: "12 oy",
      },
      allRegions: "Barça viloyatlar",
      avgPrice: "Xom sut örtaça narxi",
      volumeToday: "Bugungi savdo hajmi",
      activeShipments: "Yöldagi partiyalar",
      securedEscrow: "Eskrouda saqlanmoqda",
      litersUnit: "litr",
      currencyUnit: "söm",
      priceTrendTitle: "Narx tendensiyasi va sifat indeksi",
      titrationAcidity: "Titrlanadigan kislotalilik",
      fatContent: "Yoğlilik darajasi",
      snfContent: "Quruq yoğsiz qoldiq (QYSQ)",
      subsecondTicker: "Jonli tiker",
      qualityGrades: "Sifat navlari",
      todaysDeliveries: "Bugungi yetkazib berişlar",
      byRegion: "Hududlar böyiça",
      pricePerLiter: "Litr narxi, söm",
      liveShipments: "Jonli yuk taşişlar",
      viewAll: "Barçasini köriş",
      trucksUnit: "maşina",
      low: "Past",
      high: "Baland",
      retry: "Qayta uriniş",
      noRegionalData: "Uşbu hudud böyiça ma'lumot mavjud emas.",
      noShipmentsData: "Ayni paytda faol yuk taşişlar mavjud emas.",
    },
    liveStats: {
      headingStart: "Haqiqiy bitimlar, toza sut, ",
      headingAccent: "haqiqiy narxlar",
      subtitle: "ZaminFlow platformasidagi jonli ma'lumotlar, har daqiqada yangilanadi.",
      cta: "Jonli körsatkiçlarni köriş →",
      successfulDeals: "Muvaffaqiyatli bitimlar",
      platformUsers: "Platforma foydalanuvçilari",
      milkTradedDelivered: "Savdo qilingan va yetkazilgan sut",
      dailyAvgPrice: "Kunlik örtaça xom sut narxi",
      temporarilyUnavailable: "Ma'lumotlar vaqtinça mavjud emas",
      lastUpdated: "Oxirgi yangilaniş",
    },
    contact: {
      badge: "Boğlaniş",
      titleStart: "Sut ta'minoti zanjiringiz haqida ",
      titleAccent: "gaplaşamiz",
      fullName: "Töliq ism (F.I.Ş)",
      fullNamePlaceholder: "Ism va familiyangiz",
      phoneOrEmail: "Telefon yoki elektron poçta",
      phoneOrEmailPlaceholder: "+998 90 123 45 67",
      roleLabel: "Men — …",
      roles: {
        farmer: "Fermer xöjaligi",
        dairy: "Sutni qayta işlaş korxonasi",
        driver: "Logistika haydovçisi",
        other: "Boşqa hamkor",
      },
      message: "Xabar",
      messagePlaceholder: "Sizga qanday yordam bera olamiz?",
      consent: "Şaxsiy ma'lumotlarimni qayta işlaşga rozilik bildiraman: ",
      privacyPolicy: "Maxfiylik siyosati",
      submitBtn: "Xabarni yuboriş →",
      submitting: "Yuborilmoqda...",
      successTitle: "Xabar muvaffaqiyatli yuborildi",
      successDesc: "Rahmat! Murojaatingiz hududiy ta'minot bölimiga yönaltirildi. Mutaxassis tez orada siz bilan boğlanadi.",
      sendAnother: "Yana xabar yuboriş",
      requiredError: "Iltimos, yuborişdan oldin barça majburiy maydonlarni töldiring.",
      consentError: "Iltimos, Maxfiylik siyosatiga rozilik bildiring.",
    },
    footer: {
      republic: "Özbekiston Respublikasi",
      rights: "© 2026 ZaminFlow Teçnologies. Barça huquqlar himoyalangan.",
    },
    regions: {
      all: "Barça viloyatlar",
      tashkent: "Toşkent şahri va viloyati",
      samarqand: "Samarqand viloyati",
      fergana: "Farğona viloyati",
      namangan: "Namangan viloyati",
      andijan: "Andijon viloyati",
      qashqadaryo: "Qaşqadaryo viloyati",
      syrdarya: "Sirdaryo viloyati",
      bukhara: "Buxoro viloyati",
      khorezm: "Xorazm viloyati",
      navoiy: "Navoiy viloyati",
      jizzakh: "Jizzax viloyati",
      surxondaryo: "Surxondaryo viloyati",
      karakalpakstan: "Qoraqalpoğiston Respublikasi",
    },
  },
  ru: {
    nav: {
      brand: "ZaminFlow",
      benefits: "Преимущества",
      demo: "Демо-симулятор",
      team: "Команда",
      stats: "Статистика",
      contact: "Контакты",
      signIn: "Войти",
      signUp: "Регистрация",
      signOut: "Выйти",
      dashboard: "Панель управления",
    },
    hero: {
      headlineLine1: "Объединяем фермеров",
      headlineLine2: "С крупными покупателями",
      headlineLine3: "Надежно и честно!",
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
    statsBar: {
      regionsTitle: "Охват регионов",
      regionsSub: "Полная сеть по всему Узбекистану",
      milkTitle: "Гарантия сырья",
      milkSub: "Ежемесячные поставки (литры)",
      partnersTitle: "Проверенные партнеры",
      partnersSub: "Фермы, заводы и цистерны",
      escrowTitle: "Эскроу-гарантия",
      escrowSub: "Безопасные банковские платежи",
    },
    benefitsSection: {
      badge: "НАШИ ПРЕИМУЩЕСТВА",
      title1: "Новая эра на рынке молока — ",
      title2: "Вместе с ZaminFlow!",
      subtitle:
        "Забудьте о потерях сырья и задержках выплат при традиционных поставках. ZaminFlow переводит всю цепочку в прозрачный цифровой формат.",
      cards: [
        {
          icon: "🌐",
          badge: "Прямой B2B",
          title: "Широкий выбор и честные цены",
          description:
            "Торгуйте напрямую без посредников с более чем 450 проверенными фермами и перерабатывающими заводами.",
          gradient: "from-[#00ffc8]/20 via-[#00d3e0]/10 to-transparent",
        },
        {
          icon: "🚛",
          badge: "IoT-телематика",
          title: "Умная холодовая цепь",
          description:
            "Температура +3.2°C и GPS-маршрут каждого молоковоза непрерывно контролируются высокоточными датчиками.",
          gradient: "from-[#00d3e0]/20 via-[#0099ff]/10 to-transparent",
        },
        {
          icon: "🛡️",
          badge: "Банковский эскроу",
          title: "100% гарантия выплат",
          description:
            "Средства блокируются на эскроу-счете и выплачиваются фермеру сразу после подтверждения качества заводской лабораторией.",
          gradient: "from-[#0099ff]/20 via-[#00ffc8]/10 to-transparent",
        },
      ],
    },
    simulatorSection: {
      badge: "ИНТЕРАКТИВНЫЙ СИМУЛЯТОР",
      titleStart: "От заявки до расчетной выплаты: ",
      titleAccent: "Полная симуляция цепочки",
      subtitle:
        "Наглядная 5-шаговая интерактивная демонстрация: создание партии молока, блокировка средств в эскроу, транспортировка в холодовой цепи и автоматическая выплата.",
      stepBadge: "Этап",
      actionComplete: "Выполнено ✓",
      nextStepBtn: "Перейти к следующему этапу →",
      restartBtn: "Запустить симуляцию снова ↺",
      steps: [
        {
          step: 1,
          roleKey: "farmer",
          roleTitle: "Фермер (Производитель)",
          title: "Публикация партии сырого молока",
          subtitle: "Агроферма Sayxunobod размещает в системе 5 000 литров свежего охлажденного молока",
          icon: "🌾",
          badge: "Партия создана",
          badgeColor: "#00ffc8",
          details: [
            { label: "Наименование фермы", value: "ООО Sayxunobod Agro (№ UZ-99412)" },
            { label: "Объем молока", value: "5 000 литров", highlight: true },
            { label: "Качественные параметры", value: "4.15% Жирность • 8.65% СОМО" },
            { label: "Температура хранения", value: "+3.2°C (Танк GEA)" },
            { label: "Цена предложения", value: "4 450 UZS / литр" },
            { label: "Сумма контракта", value: "22 250 000 UZS", highlight: true },
          ],
          systemLog: "HASH-01: Смарт-контракт для партии #ZF-9042 успешно зарегистрирован в реестре.",
          actionText: "Перейти к заказу завода",
        },
        {
          step: 2,
          roleKey: "bank",
          roleTitle: "Банк и эскроу-депозитарий",
          title: "100% защищенная блокировка в эскроу",
          subtitle: "Самаркандский молочный комбинат размещает заказ, АгроБанк резервирует депозит",
          icon: "🏦",
          badge: "Эскроу заблокирован",
          badgeColor: "#0099ff",
          details: [
            { label: "Покупатель (Завод)", value: "ООО Самаркандский молокозавод №4" },
            { label: "Банк-депозитарий", value: "АКБ АгроБанк (Лицензия ЦБ №14)" },
            { label: "Зарезервированная сумма", value: "22 250 000 UZS", highlight: true },
            { label: "Протокол расчетов", value: "ISO 20022 (клиринг pacs.008)" },
            { label: "Гарантия фермеру", value: "100% покрытие депозитом" },
            { label: "Код гарантии платежа", value: "ESCROW-AGRO-2026-X89", highlight: true },
          ],
          systemLog: "HASH-02: Средства заблокированы на транзитном счете. Логистическая отгрузка разрешена.",
          actionText: "Начать транспортировку молоковозом",
        },
        {
          step: 3,
          roleKey: "driver",
          roleTitle: "Холодовая логистика",
          title: "Погрузка в цистерну и IoT-телеметрия",
          subtitle: "Молоковоз MAN TGX 18.440 принимает партию по электронному QR e-TTN",
          icon: "🚛",
          badge: "В пути: +3.2°C",
          badgeColor: "#00d3e0",
          details: [
            { label: "Транспорт и водитель", value: "MAN TGX 18.440 (01 | 777 ZAM) • Бобур А." },
            { label: "Электронная накладная", value: "e-TTN QR № TTN-2026-4412" },
            { label: "Датчики температуры", value: "+3.2°C (Холодовая цепь соблюдена)", highlight: true },
            { label: "GPS-навигация", value: "RTK точность 0.5м (Ташкентский коридор)" },
            { label: "Электронные пломбы", value: "Герметичные смарт-замки АКТИВНЫ" },
            { label: "Расчетное прибытие", value: "1 час 45 минут (98 км)", highlight: true },
          ],
          systemLog: "HASH-03: Данные телеметрии передаются в систему в реальном времени. Температура в норме.",
          actionText: "Доставить в лабораторию завода",
        },
        {
          step: 4,
          roleKey: "dairy",
          roleTitle: "Экспресс-лаборатория завода",
          title: "15-минутный экспресс-анализ качества",
          subtitle: "Проверка на приемке: титрование, центрифуга Гербера и тест на антибиотики",
          icon: "🔬",
          badge: "Высший сорт A+ подтвержден",
          badgeColor: "#00ffc8",
          details: [
            { label: "Фактическая жирность", value: "4.18% (Норматив: > 3.8%) ✓", highlight: true },
            { label: "Сухой остаток (СОМО)", value: "8.68% (В пределах нормы) ✓" },
            { label: "Плотность (Лактометр)", value: "1.028 г/см³ ✓" },
            { label: "Тест на антибиотики", value: "НОЛЬ (Чистое молоко) ✓", highlight: true },
            { label: "Температура приемки", value: "+3.3°C (Цепь не нарушена)" },
            { label: "Акт приемки-передачи", value: "Подписан цифровой подписью ЭЦП", highlight: true },
          ],
          systemLog: "HASH-04: Лабораторный протокол валидирован. Направлен сигнал в эскроу-депозитарий.",
          actionText: "Перечислить оплату фермеру",
        },
        {
          step: 5,
          roleKey: "bank",
          roleTitle: "Мгновенный расчет",
          title: "Автоматическая выплата и факторинг",
          subtitle: "Средства зачисляются на счет фермера за 1 минуту без задержек и кассовых разрывов",
          icon: "⚡",
          badge: "Выплата завершена",
          badgeColor: "#00ffc8",
          details: [
            { label: "Выплаченная сумма", value: "22 250 000 UZS", highlight: true },
            { label: "Способ выплаты", value: "Мгновенный межбанковский клиринг" },
            { label: "Комиссия фермеру", value: "0% (Оплачено покупателем)" },
            { label: "Баланс фермера", value: "+22 250 000 UZS (Зачислено)" },
            { label: "Факторинговый лимит", value: "Доступен по подтвержденному контракту" },
            { label: "Налоговый документ", value: "Электронный счет-фактура № EF-99412", highlight: true },
          ],
          systemLog: "HASH-05: Сделка полностью закрыта. Фермер получил SMS-уведомление о выплате.",
          actionText: "Сделка успешно завершена",
        },
      ],
    },
    mapSection: {
      badge: "НАЦИОНАЛЬНАЯ КАРТА МОЛОЧНОЙ АГРОИНДУСТРИИ УЗБЕКИСТАНА",
      titleStart: "Найдите лучшие партии сырого ",
      titleAccent: "молока в вашем ",
      titleEnd: "регионе",
      subtitle:
        "Телеметрия цен, объемов сертифицированного сырого молока и холодовой логистики в режиме реального времени по 14 регионам.",
      activeRegionLabel: "АКТИВНЫЙ РЕГИОН",
      monthlyVolumeLabel: "Объем в месяц:",
      avgPriceLabel: "Средняя цена:",
      fatSnfLabel: "Жирность (СОМО):",
      gradeText: "(Высший сорт A+)",
      coldStorageLabel: "Холодовая цепь:",
      certifiedFarmsSuffix: "проверенных ферм",
      viewLotBtn: "Смотреть партии →",
    },
    team: {
      badge: "ПРЕДАННЫЕ ЭКСПЕРТЫ",
      titleStart: "Наша ",
      titleAccent: "Команда",
      title: "Наша команда",
      subtitle: "Специалисты, создающие цифровую молочную инфраструктуру и агро-финтех экосистему Узбекистана.",
      roles: {
        founder: "Основатель и генеральный директор",
        coFounder: "Сооснователь и операционный директор",
        leadDev: "Ведущий инженер-разработчик",
        adviser: "Стратегический советник",
      },
      badges: {
        founder: "Руководитель",
        coFounder: "Операции",
        leadDev: "Ведущий инженер",
        adviser: "Стратегический советник",
      },
    },
    testimonialsSection: {
      badge: "ОТЗЫВЫ ПАРТНЕРОВ",
      titleStart: "Что говорят наши ",
      titleAccent: "бизнес-партнеры?",
      subtitle: "Реальный опыт фермеров, молочных комбинатов и операторов холодовой логистики.",
      items: [
        {
          quote:
            "Благодаря платформе ZaminFlow мы продаем 120 000 литров молока ежемесячно по фиксированной прозрачной цене и без единого дня задержки оплаты.",
          name: "Алишер Кадыров",
          role: "Главный фермер",
          company: "ООО Sayxunobod Baraka Chorva",
          rating: 5,
          initials: "АК",
        },
        {
          quote:
            "Температура и жирность каждого молоковоза видны онлайн еще до прибытия на завод. Споры при приемке сырья снизились на 90%.",
          name: "Нодира Каримова",
          role: "Главный технолог",
          company: "Ташкентский молочный комбинат",
          rating: 5,
          initials: "НК",
        },
        {
          quote:
            "Температура изотермической цистерны постоянно отображается на экране смартфона. Благодаря прозрачности рейсов количество моих заказов выросло в 3 раза.",
          name: "Рустам Махмудов",
          role: "Оператор логистики",
          company: "ÖzTrans Холодовая Цепь",
          rating: 5,
          initials: "РМ",
        },
        {
          quote:
            "Банковский эскроу дал нам возможность безопасно предоставлять факторинговое финансирование фермерам и стабильную ликвидность переработчикам.",
          name: "Сардор Валиев",
          role: "Руководитель торгового финансирования",
          company: "Партнер АКБ АгроБанк",
          rating: 5,
          initials: "СВ",
        },
      ],
    },
    faqSection: {
      badge: "ВОПРОСЫ И СВЯЗЬ",
      titleStart: "Остались вопросы? ",
      titleAccent: "Напишите нам!",
      subtitle:
        "Наши специалисты всегда готовы помочь вам по вопросам подключения к платформе, интеграции лабораторий или эскроу-выплат.",
      emailPlaceholder: "Введите ваш email адрес...",
      sendBtn: "Отправить",
      sending: "Отправка...",
      successMsg: "Спасибо! Наш специалист свяжется с вами в ближайшее время.",
      errorEmailMsg: "Пожалуйста, введите корректный адрес электронной почты.",
      items: [
        {
          question: "Как продать или купить сырое молоко через ZaminFlow?",
          answer:
            "Фермер указывает характеристики и объем партии в личном кабинете. Перерабатывающий завод оформляет заказ. Система автоматически назначает ближайший изотермический молоковоз с контролем температуры и блокирует оплату на эскроу-счете.",
        },
        {
          question: "Как осуществляется лабораторный контроль качества молока?",
          answer:
            "При погрузке на ферме и на въезде на завод модуль Digital Gate-Lab фиксирует жирность (от 3.6%), СОМО (от 8.2%), кислотность и температуру (+3.2°C). Электронный протокол подписывается цифровой подписью.",
        },
        {
          question: "Когда фермер получает выплату с эскроу-счета?",
          answer:
            "Сразу после того как лаборатория завода утверждает электронный акт приемки, эскроу-депозитарий автоматически отправляет средства на расчетный счет фермера. Обычно это занимает не более 15 минут.",
        },
        {
          question: "Бесплатна ли регистрация для фермерских хозяйств?",
          answer:
            "Да, регистрация, размещение партий и оформление первых сделок для малых и средних молочных хозяйств абсолютно бесплатны.",
        },
      ],
    },
    footerSection: {
      mission:
        "Национальная B2B платформа цепочек поставок сырого молока в Узбекистане: IoT-мониторинг холодовой цепи и защищенные банковские эскроу-платежи.",
      companyCol: "Компания",
      benefits: "Преимущества",
      team: "Команда",
      liveStats: "Живая статистика",
      ecosystemCol: "Экосистема и роли",
      forFarmers: "Для фермеров",
      forDairies: "Молокозаводы",
      forLogistics: "Холодовая логистика",
      forBanks: "Банки-партнеры и эскроу",
      legalCol: "Юридическая информация",
      stir: "ООО “ZaminFlow” • ИНН: 309 845 120",
      legalText:
        "В полном соответствии с Законом Республики Узбекистан «Об электронной коммерции» № ЗРУ-792.",
      allRightsReserved: "Все права защищены.",
      privacyPolicy: "Политика конфиденциальности",
      termsOfUse: "Условия использования",
    },
    profileView: {
      backToDashboard: "← Вернуться в панель управления",
      dossierLabel: "Досье",
      dealFlow: "Торги и операции",
      escrowDepository: "Эскроу-депозитарий",
      editProfile: "Редактировать профиль",
      shareTooltip: "Поделиться ссылкой на профиль (скопировать)",
      exportTooltip: "Скачать официальный цифровой паспорт (JSON)",
      callTooltip: "Позвонить",
      emailTooltip: "Отправить email",
      tabs: {
        overview: "Обзор и мощности",
        specs: "Стандарты и спецификации",
        contracts: "Эскроу и показатели надежности",
        team: "Руководство и команда",
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
      benefits: "Benefits",
      demo: "Live Demo",
      team: "Our Team",
      stats: "Live Stats",
      contact: "Contact Us",
      signIn: "Sign in",
      signUp: "Sign up",
      signOut: "Sign out",
      dashboard: "Dashboard",
    },
    hero: {
      headlineLine1: "Connecting Small Farmers",
      headlineLine2: "With Commercial Buyers",
      headlineLine3: "Seamlessly!",
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
    statsBar: {
      regionsTitle: "Regional Coverage",
      regionsSub: "Nationwide network across Uzbekistan",
      milkTitle: "Guaranteed Volume",
      milkSub: "Monthly milk delivered (litres)",
      partnersTitle: "Verified Partners",
      partnersSub: "Farms, dairy plants & tankers",
      escrowTitle: "Escrow Guarantee",
      escrowSub: "Bank-grade protected settlements",
    },
    benefitsSection: {
      badge: "OUR ADVANTAGES",
      title1: "A New Era in Raw Milk Trading — ",
      title2: "Starts With ZaminFlow!",
      subtitle:
        "Eliminate supply-chain losses and delayed payouts. ZaminFlow provides transparency and digital accountability for every litre.",
      cards: [
        {
          icon: "🌐",
          badge: "Direct B2B",
          title: "Wide Choice & Transparent Pricing",
          description:
            "Trade directly without middlemen across 450+ verified dairy farms and commercial processing plants.",
          gradient: "from-[#00ffc8]/20 via-[#00d3e0]/10 to-transparent",
        },
        {
          icon: "🚛",
          badge: "IoT Telemetry",
          title: "Smart Cold Chain",
          description:
            "Real-time +3.2°C temperature tracking and GPS routing powered by onboard IoT telemetry sensors.",
          gradient: "from-[#00d3e0]/20 via-[#0099ff]/10 to-transparent",
        },
        {
          icon: "🛡️",
          badge: "Bank Escrow",
          title: "Guaranteed Payouts",
          description:
            "Buyer funds are locked in bank escrow and auto-released as soon as the factory laboratory verifies raw milk specs.",
          gradient: "from-[#0099ff]/20 via-[#00ffc8]/10 to-transparent",
        },
      ],
    },
    simulatorSection: {
      badge: "INTERACTIVE DEMO",
      titleStart: "From Listing to Settlement: ",
      titleAccent: "End-to-End Workflow Simulation",
      subtitle:
        "Follow this 5-stage interactive journey showing how raw milk lots are published, escrow-secured, cold-shipped, and automatically paid.",
      stepBadge: "Stage",
      actionComplete: "Completed ✓",
      nextStepBtn: "Proceed to Next Stage →",
      restartBtn: "Restart Simulation ↺",
      steps: [
        {
          step: 1,
          roleKey: "farmer",
          roleTitle: "Farmer (Producer)",
          title: "Listing Fresh Raw Milk Batch",
          subtitle: "Sayxunobod Agro-Dairy Farm lists 5,000 litres of freshly chilled morning milk",
          icon: "🌾",
          badge: "Batch Created",
          badgeColor: "#00ffc8",
          details: [
            { label: "Farm Enterprise", value: "Sayxunobod Agro LLC (№ UZ-99412)" },
            { label: "Batch Volume", value: "5,000 Litres", highlight: true },
            { label: "Quality Specs", value: "4.15% Fat • 8.65% SNF" },
            { label: "Chilling Temperature", value: "+3.2°C (GEA Tank)" },
            { label: "Asking Price", value: "4,450 UZS / Litre" },
            { label: "Contract Value", value: "22,250,000 UZS", highlight: true },
          ],
          systemLog: "HASH-01: Smart contract successfully created for batch #ZF-9042.",
          actionText: "Proceed to Dairy Order",
        },
        {
          step: 2,
          roleKey: "bank",
          roleTitle: "Bank & Escrow Depository",
          title: "100% Guaranteed Escrow Lock",
          subtitle: "Samarkand Dairy Plant places purchase order; AgroBank locks funds in transit escrow",
          icon: "🏦",
          badge: "Escrow Locked",
          badgeColor: "#0099ff",
          details: [
            { label: "Buyer Dairy", value: "Samarkand Milk Processing Plant #4 LLC" },
            { label: "Depository Bank", value: "JSCB AgroBank (Central Bank License #14)" },
            { label: "Locked Escrow Amount", value: "22,250,000 UZS", highlight: true },
            { label: "Settlement Protocol", value: "ISO 20022 (pacs.008 clearing)" },
            { label: "Farmer Guarantee", value: "100% Collateralized in Escrow" },
            { label: "Escrow Guarantee Code", value: "ESCROW-AGRO-2026-X89", highlight: true },
          ],
          systemLog: "HASH-02: Funds locked in transit vault. Logistics pickup authorized.",
          actionText: "Authorize Tanker Dispatch",
        },
        {
          step: 3,
          roleKey: "driver",
          roleTitle: "Cold-Chain Logistics Fleet",
          title: "Tanker Loading & IoT Telemetry",
          subtitle: "MAN TGX 18.440 insulated tanker takes custody via digital e-TTN QR",
          icon: "🚛",
          badge: "In Transit: +3.2°C",
          badgeColor: "#00d3e0",
          details: [
            { label: "Vehicle & Driver", value: "MAN TGX 18.440 (01 | 777 ZAM) • Bobur A." },
            { label: "Electronic Waybill", value: "e-TTN QR № TTN-2026-4412" },
            { label: "Thermal Sensors (PT100)", value: "+3.2°C (Strict Cold-Chain Active)", highlight: true },
            { label: "Satellite GPS", value: "RTK 0.5m precision (Tashkent Corridor)" },
            { label: "Valve Locks", value: "Electronic tamper-proof seal ACTIVE" },
            { label: "Estimated Arrival", value: "1 hr 45 min (98 km remaining)", highlight: true },
          ],
          systemLog: "HASH-03: Real-time telemetry feed streaming to chain. Temperatures strictly nominal.",
          actionText: "Deliver to Dairy Gate Lab",
        },
        {
          step: 4,
          roleKey: "dairy",
          roleTitle: "Plant Gate Laboratory",
          title: "15-Minute Express Quality Analysis",
          subtitle: "Automated titration, Gerber centrifuge fat check, and rapid antibiotic screening",
          icon: "🔬",
          badge: "Grade A+ Verified",
          badgeColor: "#00ffc8",
          details: [
            { label: "Verified Fat (Gerber)", value: "4.18% (Target: > 3.8%) ✓", highlight: true },
            { label: "Solids-Non-Fat (SNF)", value: "8.68% (Target: > 8.2%) ✓" },
            { label: "Density (Lactometer)", value: "1.028 g/cm³ ✓" },
            { label: "Antibiotic Screening", value: "ZERO (Clean milk) ✓", highlight: true },
            { label: "Delivery Temperature", value: "+3.3°C (Cold-chain intact)" },
            { label: "Acceptance Act", value: "Digitally signed via national E-IMZO", highlight: true },
          ],
          systemLog: "HASH-04: Lab metrics validated against ISO 20022 contract. Escrow release triggered.",
          actionText: "Release Escrow Payout to Farmer",
        },
        {
          step: 5,
          roleKey: "bank",
          roleTitle: "Instant Bank Clearing",
          title: "Instant Escrow Payout & Factoring",
          subtitle: "Funds credited to the farmer's account in under 60 seconds with zero payment delay",
          icon: "⚡",
          badge: "Settlement Completed",
          badgeColor: "#00ffc8",
          details: [
            { label: "Settled Amount", value: "22,250,000 UZS", highlight: true },
            { label: "Clearing Method", value: "Automated Bank RTGS Clearing" },
            { label: "Farmer Fee", value: "0% (Absorbed by buyer)" },
            { label: "Farmer Balance", value: "+22,250,000 UZS (Credited)" },
            { label: "Factoring Facility", value: "Available on verified contract" },
            { label: "Tax & Fiscal Invoice", value: "E-Faktura № EF-99412 generated", highlight: true },
          ],
          systemLog: "HASH-05: Contract cycle closed. Farmer SMS notification delivered.",
          actionText: "Workflow Successfully Completed",
        },
      ],
    },
    mapSection: {
      badge: "UZBEKISTAN NATIONAL DAIRY AGRO-MAP",
      titleStart: "Discover Optimal Raw ",
      titleAccent: "Milk Lots in Your ",
      titleEnd: "Region",
      subtitle:
        "Real-time telemetry across 14 administrative regions: certified raw milk spot prices, available volumes, and refrigerated tanker routes.",
      activeRegionLabel: "ACTIVE REGION",
      monthlyVolumeLabel: "Monthly Volume:",
      avgPriceLabel: "Avg. Price:",
      fatSnfLabel: "Fat (SNF):",
      gradeText: "(Grade A+)",
      coldStorageLabel: "Cold Storage:",
      certifiedFarmsSuffix: "verified dairy farms",
      viewLotBtn: "Explore Lots →",
    },
    team: {
      badge: "DEDICATED EXPERTS",
      titleStart: "Our ",
      titleAccent: "Team",
      title: "Our Team",
      subtitle: "The visionary builders powering Uzbekistan's digital dairy infrastructure and fintech ecosystem.",
      roles: {
        founder: "Founder & Chief Executive Officer",
        coFounder: "Co-Founder & Chief Operating Officer",
        leadDev: "Lead Software Engineer",
        adviser: "Strategic Adviser",
      },
      badges: {
        founder: "Executive",
        coFounder: "Operations",
        leadDev: "Lead Engineer",
        adviser: "Strategic Adviser",
      },
    },
    testimonialsSection: {
      badge: "PRODUCER TESTIMONIALS",
      titleStart: "What Our Business ",
      titleAccent: "Partners Say",
      subtitle: "Real verified stories from smallholder farmers, industrial dairies, and refrigerated transport fleets.",
      items: [
        {
          quote:
            "Thanks to ZaminFlow, we sell 120,000 litres of milk every month at guaranteed prices with payments that have never been late by a single day.",
          name: "Alisher Qodirov",
          role: "Lead Farmer",
          company: "Sayxunobod Baraka Dairy LLC",
          rating: 5,
          initials: "AQ",
        },
        {
          quote:
            "We can see the temperature and fat content of every incoming tanker while it's still on the highway. Reception disputes dropped by 90%.",
          name: "Nodira Karimova",
          role: "Chief Technologist",
          company: "Tashkent Dairy Combine",
          rating: 5,
          initials: "NK",
        },
        {
          quote:
            "Live tanker temperatures are displayed on my smartphone. Complete trip transparency has tripled my transport bookings across regions.",
          name: "Rustam Mahmudov",
          role: "Logistics Operator",
          company: "ÖzTrans Cold Çain",
          rating: 5,
          initials: "RM",
        },
        {
          quote:
            "Bank-backed escrow enables us to offer interest-free factoring to farmers and robust liquidity guarantees to commercial dairy processors.",
          name: "Sardor Valiev",
          role: "Head of Trade Finance",
          company: "AgroBank Partner",
          rating: 5,
          initials: "SV",
        },
      ],
    },
    faqSection: {
      badge: "FAQ & CONTACT",
      titleStart: "Have Questions? ",
      titleAccent: "Get in Touch!",
      subtitle:
        "Our agritech and escrow specialists are here to assist with platform onboarding, laboratory integration, and automated settlements.",
      emailPlaceholder: "Enter your email address...",
      sendBtn: "Send",
      sending: "Sending...",
      successMsg: "Thank you! Our regional specialist will reach out shortly.",
      errorEmailMsg: "Please enter a valid email address.",
      items: [
        {
          question: "How do farmers and dairies trade raw milk via ZaminFlow?",
          answer:
            "Farmers list batch volume and quality parameters on the platform. Dairies review and place orders. The system automatically books the nearest cold-chain tanker and secures payment in bank escrow.",
        },
        {
          question: "How is milk quality verified during transit?",
          answer:
            "At pickup and plant arrival, Digital Gate-Lab modules measure fat (min 3.6%), SNF (min 8.2%), acidity, and temperature (+3.2°C), issuing a cryptographic electronic acceptance act.",
        },
        {
          question: "When does the farmer receive escrow payment?",
          answer:
            "The moment the receiving laboratory verifies quality specs and signs the digital delivery act, escrow funds are automatically credited to the farmer's account—usually within 15 minutes.",
        },
        {
          question: "Is registration free for smallholder dairy farmers?",
          answer:
            "Yes, onboarding, listing milk batches, and drafting initial contracts are completely free for all small and medium-sized dairy producers.",
        },
      ],
    },
    footerSection: {
      mission:
        "Uzbekistan's national B2B raw milk supply chain platform: IoT cold-chain telemetry and bank-guaranteed escrow settlements.",
      companyCol: "Company",
      benefits: "Benefits",
      team: "Our Team",
      liveStats: "Live Statistics",
      ecosystemCol: "Ecosystem & Roles",
      forFarmers: "For Farmers",
      forDairies: "For Dairy Plants",
      forLogistics: "Cold-Chain Logistics",
      forBanks: "Partner Banks & Escrow",
      legalCol: "Legal & Inquiries",
      stir: "“ZaminFlow” LLC • TIN: 309 845 120",
      legalText:
        "Operating in full compliance with the Law of the Republic of Uzbekistan \"On Electronic Commerce\" No. ZRU-792.",
      allRightsReserved: "All rights reserved.",
      privacyPolicy: "Privacy Policy",
      termsOfUse: "Terms of Use",
    },
    profileView: {
      backToDashboard: "← Back to Dashboard",
      dossierLabel: "Dossier",
      dealFlow: "Trading & Operations",
      escrowDepository: "Escrow Depository",
      editProfile: "Edit Profile",
      shareTooltip: "Share profile link (copy)",
      exportTooltip: "Download Official Digital Dossier (JSON)",
      callTooltip: "Call",
      emailTooltip: "Send email",
      tabs: {
        overview: "Overview & Capacity",
        specs: "Trading & Tech Specs",
        contracts: "Escrow & Trust Metrics",
        team: "Management & Team",
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
      samarqand: "Samarkand Region",
      fergana: "Fergana Region",
      namangan: "Namangan Region",
      andijan: "Andijan Region",
      qashqadaryo: "Kashkadarya Region",
      syrdarya: "Syrdarya Region",
      bukhara: "Bukhara Region",
      khorezm: "Khorezm Region",
      navoiy: "Navoi Region",
      jizzakh: "Jizzakh Region",
      surxondaryo: "Surkhandarya Region",
      karakalpakstan: "Republic of Karakalpakstan",
    },
  },
};
