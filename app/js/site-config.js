(function () {
  const SETTINGS_KEY = "ma-site-settings-v2";
  const LEGACY_SETTINGS_KEYS = ["ma-site-settings-v1"];
  const LEADS_KEY = "ma-site-leads-v1";
  const METRICS_KEY = "ma-site-metrics-v1";
  const VISITOR_KEY = "ma-site-visitor-id-v1";
  const SESSION_KEY = "ma-site-session-id-v1";

  const defaultSettings = {
    navigation: {
      menu: [
        { id: "menu-about", label: "О компании", href: "#why-us", visible: true, sectionId: "why-us" },
        { id: "menu-portfolio", label: "Портфолио", href: "#portfolio", visible: true, sectionId: "portfolio" },
        { id: "menu-materials", label: "Материалы", href: "#materials", visible: true, sectionId: "materials" },
        { id: "menu-process", label: "Этапы", href: "#how-we-work", visible: true, sectionId: "how-we-work" },
        { id: "menu-reviews", label: "Отзывы", href: "#reviews", visible: true, sectionId: "reviews" },
        { id: "menu-contacts", label: "Контакты", href: "#contacts", visible: true, sectionId: "contacts" }
      ]
    },
    structure: {
      sectionOrder: ["hero", "why-us", "portfolio", "materials", "how-we-work", "reviews", "faq", "contacts"],
      sections: [
        { id: "hero", title: "Hero", description: "Первый экран с оффером и формой", visible: true, anchor: "#hero" },
        { id: "why-us", title: "Преимущества", description: "Блок о подходе и направлениях", visible: true, anchor: "#why-us" },
        { id: "portfolio", title: "Портфолио", description: "Превью реализованных проектов", visible: true, anchor: "#portfolio" },
        { id: "materials", title: "Материалы", description: "Материалы и фактуры", visible: true, anchor: "#materials" },
        { id: "how-we-work", title: "Этапы", description: "Сценарий работы с клиентом", visible: true, anchor: "#how-we-work" },
        { id: "reviews", title: "Отзывы", description: "Отзывы, карусель и QR-блоки", visible: true, anchor: "#reviews" },
        { id: "faq", title: "Вопросы", description: "Частые вопросы", visible: true, anchor: "#faq" },
        { id: "contacts", title: "Контакты", description: "Контакты, карта и соцсети", visible: true, anchor: "#contacts" }
      ]
    },
    seo: {
      title: "Мебельное ателье | мебель на заказ",
      description:
        "Кухни, шкафы, гардеробные, прихожие и ТВ-зоны на заказ. Индивидуальные проекты, консультация, замер и расчёт стоимости.",
      keywords:
        "мебельная студия, мебельное ателье, мебель на заказ, кухни на заказ, шкафы, гардеробные, прихожие, ТВ-зоны, мебель по индивидуальным размерам",
      ogTitle: "Мебельное ателье | проекты и мебель на заказ",
      ogDescription:
        "Мебель под индивидуальный проект: кухни, шкафы, гардеробные и интерьерные решения с расчётом стоимости и консультацией.",
      ogImage: "assets/images/hero/hero-kitchen.jpg"
    },
    brand: {
      name: "Мебельное ателье",
      mark: "МА",
      tagline: "Мебель под архитектуру дома",
      logoImage: "",
      heroImage: "assets/images/hero/hero-kitchen.jpg",
      heroImageAlt: "Интерьер кухни с мебелью на заказ в тёплой древесной палитре",
      heroImageCaption: "Кухни, шкафы и системы хранения под индивидуальный проект",
      favicon: "assets/brand/favicon.svg"
    },
    company: {
      siteName: "Мебельное ателье",
      legalName: "ООО «Мебельное ателье»",
      inn: "7801234567",
      ogrn: "1207800000000",
      legalAddress: "г. Москва, ул. Мебельная, д. 12, стр. 3"
    },
    catalog: {
      eyebrow: "Каталог",
      title: "Направления мебельной студии",
      subtitle: "Категории и индивидуальные проекты",
      description: "Основные направления, с которыми клиенты приходят за консультацией, проектом и расчётом стоимости.",
      categories: [
        "Кухни",
        "Шкафы",
        "Гардеробные",
        "Прихожие",
        "Тумбы",
        "ТВ-зоны",
        "Мебель для спальни",
        "Офисная мебель",
        "Индивидуальные проекты"
      ]
    },
    hero: {
      kicker: "Мебельное ателье в Санкт-Петербурге",
      title: "Мебель на заказ, которая делает дом цельным",
      text:
        "Создаём кухни, шкафы, гардеробные и жилые зоны так, чтобы мебель подчёркивала интерьер, а не спорила с ним.",
      formKicker: "Рассчитать стоимость",
      formTitle: "Оставьте заявку",
      formText: "Оставьте контакты, и мы вернёмся с понятной консультацией по проекту, срокам и следующему шагу.",
      formNamePlaceholder: "Ваше имя",
      formPhonePlaceholder: "+7 (___) ___-__-__",
      formButtonText: "Отправить заявку"
    },
    consultation: {
      eyebrow: "Заявка и консультация",
      title: "Оставьте заявку",
      subtitle: "Расскажите о проекте, а мы подскажем по срокам, материалам и следующему шагу.",
      ctaText: "Онлайн-консультация и расчёт стоимости",
      buttonText: "Отправить заявку",
      consultationNote: "Свяжемся, уточним задачу и предложим удобный формат консультации.",
      estimateNote: "Поможем с предварительным расчётом стоимости и подбором конфигурации.",
      measurementNote: "При необходимости согласуем выезд на замер и обсуждение материалов."
    },
    whyUs: {
      title: "Точное проектирование мебели под интерьер и сценарий жизни",
      text:
        "Для нас важны не только размеры, но и свет, проходы, сценарии хранения, ритм фасадов и ощущение дома после установки."
    },
    advantages: {
      eyebrow: "Преимущества",
      title: "Материалы и преимущества",
      text: "Проектируем, производим и монтируем мебель так, чтобы итог выглядел цельно и служил спокойно долгие годы.",
      items: [
        "Индивидуальные размеры",
        "Проектирование",
        "Подбор материалов",
        "Фурнитура",
        "Производство",
        "Доставка",
        "Монтаж",
        "Гарантия"
      ]
    },
    portfolio: {
      eyebrow: "Портфолио",
      title: "Наши проекты",
      text: "Подборка реализованных решений, где мебель собрана под архитектуру дома, ритм интерьера и сценарии жизни.",
      buttonText: "Обсудить проект",
      buttonHref: "#contacts",
      cardCaption: "Материалы и детали",
      items: [
        {
          id: "portfolio-1",
          title: "Кухня в тёплом минимализме",
          metaPrimary: "Квартира, 85 м²",
          metaSecondary: "Тёплый минимализм",
          description:
            "Скрыли коммуникации, добавили пеналы до потолка и объединили столешницу с фартуком в единый ритм.",
          materialNote: "Шпон ореха, мрамор, фурнитура BLUM",
          image: "assets/images/portfolio/portfolio-1.jpg",
          imageAlt: "Кухня на заказ в тёплом минимализме",
          imageCaption: "Кухня с пеналами до потолка и цельной столешницей",
          visible: true
        },
        {
          id: "portfolio-2",
          title: "Гардеробная для всей семьи",
          metaPrimary: "Частный дом",
          metaSecondary: "Современная классика",
          description:
            "Организовали хранение для всей семьи без ощущения тесноты и визуальной тяжести.",
          materialNote: "МДФ в эмали, стекло, LED-подсветка",
          image: "assets/images/portfolio/portfolio-2.jpg",
          imageAlt: "Гардеробная на заказ для частного дома",
          imageCaption: "Система хранения для всей семьи",
          visible: true
        },
        {
          id: "portfolio-3",
          title: "Гостиная с камином и ТВ-зоной",
          metaPrimary: "Квартира, 120 м²",
          metaSecondary: "Минимализм",
          description:
            "Собрали технику, камин и хранение в единую стеновую панель с мягкой подсветкой.",
          materialNote: "Шпон дуба, искусственный камень, металл",
          image: "assets/images/portfolio/portfolio-3.jpg",
          imageAlt: "ТВ-зона и мебельная панель для гостиной",
          imageCaption: "Гостиная с камином, хранением и мягкой подсветкой",
          visible: true
        }
      ]
    },
    materials: {
      eyebrow: "Материалы",
      title: "Материалы, которые выглядят дорого не только в день установки",
      text: "Покажем сочетания фасадов, столешниц, ручек и фактур так, чтобы интерьер был собранным и долговечным.",
      image: "assets/images/hero/materials-hero.jpg",
      imageAlt: "Образцы мебельных материалов, фасадов и фактур",
      imageCaption: "Фасады, столешницы, фурнитура и фактуры под задачу интерьера",
      items: [
        { id: "material-1", title: "МДФ в эмали", text: "Гладкие фасады любого цвета с износостойким покрытием.", visible: true },
        { id: "material-2", title: "Шпон натурального дерева", text: "Тактильная красота древесины на современных конструкциях.", visible: true },
        { id: "material-3", title: "Компакт-ламинат", text: "Сверхпрочные поверхности для кухонь и влажных зон.", visible: true },
        { id: "material-4", title: "Искусственный камень", text: "Бесшовные столешницы с тёплой тактильностью.", visible: true }
      ]
    },
    process: {
      eyebrow: "Процесс",
      title: "Как мы работаем",
      items: [
        { id: "process-1", number: "01", title: "Заявка и короткий бриф", text: "Обсуждаем задачу, пожелания, сроки и бюджет.", visible: true },
        { id: "process-2", number: "02", title: "Бесплатный замер", text: "Фиксируем все размеры и технические нюансы помещения.", visible: true },
        { id: "process-3", number: "03", title: "Концепция и смета", text: "Показываем решение, материалы и итоговую стоимость.", visible: true },
        { id: "process-4", number: "04", title: "Производство и монтаж", text: "Изготавливаем, доставляем и аккуратно устанавливаем мебель на объекте.", visible: true }
      ]
    },
    faq: {
      eyebrow: "Вопросы",
      title: "Частые вопросы",
      items: [
        { id: "faq-1", question: "Сколько стоит мебель на заказ?", answer: "Стоимость зависит от объёма проекта, материалов и сложности конструкций.", open: true, visible: true },
        { id: "faq-2", question: "Какие сроки изготовления?", answer: "Обычно от 3 до 6 недель, в зависимости от проекта.", open: false, visible: true },
        { id: "faq-3", question: "Замер действительно бесплатный?", answer: "Да, замер бесплатный и ни к чему не обязывает.", open: false, visible: true }
      ]
    },
    contacts: {
      eyebrow: "Контакты",
      title: "Свяжитесь с нами",
      city: "Москва",
      addressTitle: "Шоурум и студия",
      hoursTitle: "Часы работы",
      hoursDisplay: "Пн–Сб: 10:00–19:00",
      phoneTitle: "Телефон",
      emailTitle: "Email",
      socialsTitle: "Мессенджеры и соцсети",
      address: "г. Москва, ул. Мебельная, д. 12, стр. 3",
      addressLabel: "Шоурум, консультации и рабочие встречи",
      hoursWeekdays: "Пн–Пт: 9:00–19:00",
      hoursWeekend: "Сб: 10:00–16:00",
      phoneHref: "+74951234567",
      phoneDisplay: "+7 (495) 123-45-67",
      email: "info@mebel-atelier.ru",
      leadsEmail: "owner@mebel-atelier.ru",
      mapNote: "Свяжитесь с нами для консультации, расчёта стоимости и согласования встречи в шоуруме.",
      mapTitle: "Шоурум мебельной студии",
      mapRouteLabel: "Откройте карту и постройте маршрут",
      mapPublicUrl: "",
      mapWidgetUrl: "",
      socialLinks: [
        {
          id: "social-telegram",
          label: "Telegram",
          url: "https://t.me/"
        },
        {
          id: "social-whatsapp",
          label: "WhatsApp",
          url: "https://wa.me/"
        },
        {
          id: "social-max",
          label: "MAX",
          url: "https://max.ru/"
        }
      ]
    },
    footer: {
      brandDescription: "Мебель на заказ по индивидуальным размерам: кухни, шкафы, гардеробные и интерьерные решения для квартир, домов и офисов.",
      contactTitle: "Консультация и расчёт",
      contactText: "Свяжитесь с нами по телефону, в мессенджере или по e-mail, чтобы обсудить проект, замер и подбор материалов.",
      copyrightText: "© {{year}} MA. Мебельное ателье. Все права защищены.",
      privacyLabel: "Политика конфиденциальности",
      privacyUrl: "#",
      agreementLabel: "Пользовательское соглашение",
      agreementUrl: "#"
    },
    security: {
      turnstileSiteKey: "",
      leadEndpoint: "/api/lead",
      minSubmissionTimeMs: 3000,
      clientCooldownMs: 45000
    },
    reviews: {
      eyebrow: "Отзывы и рекомендации",
      title: "Отзывы клиентов о работе мебельного ателье",
      text:
        "Смотрите, что пишут о качестве проекта, аккуратности монтажа и результате после установки.",
      yandexOrgUrl: "https://yandex.ru/maps/",
      yandexApiKey: "",
      yandexBusinessId: "",
      items: [
        {
          id: "review-1",
          author: "Анна и Дмитрий",
          label: "Кухня и гостиная",
          quote: "Кухня стала центром дома и выглядит именно так, как мы хотели.",
          rating: 5,
          date: "2026-04-17",
          sourceLabel: "Источник",
          sourceUrl: "https://yandex.ru/maps/"
        },
        {
          id: "review-2",
          author: "Елена",
          label: "Гардеробная",
          quote: "Всё продумано до мелочей: от хранения до подсветки.",
          rating: 5,
          date: "2026-04-17",
          sourceLabel: "Источник",
          sourceUrl: "https://yandex.ru/maps/"
        },
        {
          id: "review-3",
          author: "Сергей и Ольга",
          label: "Вся мебель в квартире",
          quote: "Монтаж прошёл спокойно, без хаоса и грязи.",
          rating: 5,
          date: "2026-04-18",
          sourceLabel: "Источник",
          sourceUrl: "https://yandex.ru/maps/"
        },
        {
          id: "review-4",
          author: "Марина",
          label: "Шкафы и прихожая",
          quote: "Получили аккуратную мебель под размеры дома, без компромиссов по удобству и свету.",
          rating: 5,
          date: "2026-04-19",
          sourceLabel: "Источник",
          sourceUrl: "https://yandex.ru/maps/"
        },
        {
          id: "review-5",
          author: "Игорь",
          label: "Кабинет и библиотека",
          quote: "Получили спокойную, дорогую по ощущению мебель, которая точно встала в архитектуру дома и не перегрузила интерьер.",
          rating: 5,
          date: "2026-04-20",
          sourceLabel: "Источник",
          sourceUrl: "https://yandex.ru/maps/"
        },
        {
          id: "review-6",
          author: "Наталья и Алексей",
          label: "Кухня и системы хранения",
          quote: "На проекте очень чётко проработали эргономику, материалы и свет. В итоге всё выглядит цельно и очень аккуратно.",
          rating: 5,
          date: "2026-04-21",
          sourceLabel: "Источник",
          sourceUrl: "https://yandex.ru/maps/"
        }
      ],
      qrCards: [
        {
          id: "qr-yandex",
          badge: "Яндекс",
          title: "Оставить отзыв в Яндекс",
          text: "Поделитесь впечатлением о проекте и монтаже, чтобы будущим клиентам было проще выбрать нас.",
          buttonLabel: "Перейти",
          linkUrl: "https://yandex.ru/maps/",
          ratingValue: 4.9,
          reviewCount: 48,
          qrMode: "generated",
          qrImage: ""
        },
        {
          id: "qr-2gis",
          badge: "2ГИС",
          title: "Оставить отзыв в 2ГИС",
          text: "Поделитесь впечатлением о проекте и монтаже, чтобы будущим клиентам было проще выбрать нас.",
          buttonLabel: "Подробнее",
          linkUrl: "https://2gis.ru/",
          ratingValue: 4.8,
          reviewCount: 37,
          qrMode: "generated",
          qrImage: ""
        }
      ]
    },
    blocks: [],
    admin: {
      login: "admin",
      password: "admin"
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function hasLegacyCleaningText(settings) {
    const values = [
      settings && settings.seo && settings.seo.title,
      settings && settings.seo && settings.seo.description,
      settings && settings.contacts && settings.contacts.address,
      settings && settings.contacts && settings.contacts.email
    ];
    return values.some((value) => /акваблеск|клининг|уборк|хабаровск/i.test(String(value || "")));
  }

  function applyFurnitureDefaults(settings) {
    settings.seo = clone(defaultSettings.seo);
    settings.contacts = {
      ...settings.contacts,
      ...clone(defaultSettings.contacts),
      socialLinks:
        Array.isArray(settings.contacts && settings.contacts.socialLinks) && settings.contacts.socialLinks.length
          ? settings.contacts.socialLinks
          : clone(defaultSettings.contacts.socialLinks)
    };
    settings.reviews = {
      ...settings.reviews,
      yandexOrgUrl: defaultSettings.reviews.yandexOrgUrl,
      yandexApiKey: "",
      yandexBusinessId: ""
    };
    return settings;
  }

  function merge(base, patch) {
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      return patch === undefined ? clone(base) : patch;
    }

    const output = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(patch).forEach((key) => {
      const baseValue = base ? base[key] : undefined;
      const patchValue = patch[key];

      if (Array.isArray(patchValue)) {
        output[key] = patchValue;
        return;
      }

      if (patchValue && typeof patchValue === "object") {
        output[key] = merge(baseValue && typeof baseValue === "object" ? baseValue : {}, patchValue);
        return;
      }

      output[key] = patchValue;
    });
    return output;
  }

  function loadSettings() {
    try {
      let raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        raw = LEGACY_SETTINGS_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || "";
      }
      if (!raw) {
        return clone(defaultSettings);
      }
      const settings = merge(defaultSettings, JSON.parse(raw));
      if (hasLegacyCleaningText(settings)) {
        const migratedSettings = clone(defaultSettings);
        if (settings.admin && typeof settings.admin === "object") {
          migratedSettings.admin.login = settings.admin.login || defaultSettings.admin.login;
          migratedSettings.admin.password =
            settings.admin.password && settings.admin.password !== "premium123"
              ? settings.admin.password
              : defaultSettings.admin.password;
        }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(migratedSettings));
        return migratedSettings;
      }
      if (!settings.admin || typeof settings.admin !== "object") {
        settings.admin = clone(defaultSettings.admin);
      }
      if (!settings.brand || typeof settings.brand !== "object") {
        settings.brand = clone(defaultSettings.brand);
      }
      settings.brand.name = settings.brand.name || defaultSettings.brand.name;
      settings.brand.mark = settings.brand.mark || defaultSettings.brand.mark;
      settings.brand.tagline = settings.brand.tagline || defaultSettings.brand.tagline;
      settings.brand.logoImage = settings.brand.logoImage || "";
      settings.brand.heroImage = settings.brand.heroImage || defaultSettings.brand.heroImage;
      settings.brand.heroImageAlt = settings.brand.heroImageAlt || defaultSettings.brand.heroImageAlt;
      settings.brand.heroImageCaption = settings.brand.heroImageCaption || defaultSettings.brand.heroImageCaption;
      settings.brand.favicon = settings.brand.favicon || defaultSettings.brand.favicon;
      if (!settings.catalog || typeof settings.catalog !== "object") {
        settings.catalog = clone(defaultSettings.catalog);
      }
      if (!settings.company || typeof settings.company !== "object") {
        settings.company = clone(defaultSettings.company);
      }
      settings.company.siteName = settings.company.siteName || defaultSettings.company.siteName;
      settings.company.legalName = settings.company.legalName || defaultSettings.company.legalName;
      settings.company.inn = settings.company.inn || defaultSettings.company.inn;
      settings.company.ogrn = settings.company.ogrn || defaultSettings.company.ogrn;
      settings.company.legalAddress = settings.company.legalAddress || defaultSettings.company.legalAddress;
      if (!Array.isArray(settings.catalog.categories) || !settings.catalog.categories.length) {
        settings.catalog.categories = clone(defaultSettings.catalog.categories);
      }
      settings.catalog.eyebrow = settings.catalog.eyebrow || defaultSettings.catalog.eyebrow;
      settings.catalog.title = settings.catalog.title || defaultSettings.catalog.title;
      settings.catalog.subtitle = settings.catalog.subtitle || defaultSettings.catalog.subtitle;
      settings.catalog.description = settings.catalog.description || defaultSettings.catalog.description;
      settings.catalog.categories = settings.catalog.categories
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      if (!settings.consultation || typeof settings.consultation !== "object") {
        settings.consultation = clone(defaultSettings.consultation);
      }
      settings.consultation.eyebrow = settings.consultation.eyebrow || defaultSettings.consultation.eyebrow;
      settings.consultation.title = settings.consultation.title || defaultSettings.consultation.title;
      settings.consultation.subtitle = settings.consultation.subtitle || defaultSettings.consultation.subtitle;
      settings.consultation.ctaText = settings.consultation.ctaText || defaultSettings.consultation.ctaText;
      settings.consultation.buttonText = settings.consultation.buttonText || defaultSettings.consultation.buttonText;
      settings.consultation.consultationNote =
        settings.consultation.consultationNote || defaultSettings.consultation.consultationNote;
      settings.consultation.estimateNote =
        settings.consultation.estimateNote || defaultSettings.consultation.estimateNote;
      settings.consultation.measurementNote =
        settings.consultation.measurementNote || defaultSettings.consultation.measurementNote;
      if (!settings.advantages || typeof settings.advantages !== "object") {
        settings.advantages = clone(defaultSettings.advantages);
      }
      if (!Array.isArray(settings.advantages.items) || !settings.advantages.items.length) {
        settings.advantages.items = clone(defaultSettings.advantages.items);
      }
      settings.advantages.eyebrow = settings.advantages.eyebrow || defaultSettings.advantages.eyebrow;
      settings.advantages.title = settings.advantages.title || defaultSettings.advantages.title;
      settings.advantages.text = settings.advantages.text || defaultSettings.advantages.text;
      settings.advantages.items = settings.advantages.items
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      if (!settings.admin.login) {
        settings.admin.login = "admin";
      }
      if (!settings.admin.password || settings.admin.password === "premium123") {
        settings.admin.password = "admin";
      }
      if (!Array.isArray(settings.contacts.socialLinks) || !settings.contacts.socialLinks.length) {
        settings.contacts.socialLinks = clone(defaultSettings.contacts.socialLinks);
      }
      if (!settings.navigation || !Array.isArray(settings.navigation.menu) || !settings.navigation.menu.length) {
        settings.navigation = clone(defaultSettings.navigation);
      }
      if (!settings.structure || typeof settings.structure !== "object") {
        settings.structure = clone(defaultSettings.structure);
      }
      if (!Array.isArray(settings.structure.sectionOrder) || !settings.structure.sectionOrder.length) {
        settings.structure.sectionOrder = clone(defaultSettings.structure.sectionOrder);
      }
      if (!Array.isArray(settings.structure.sections) || !settings.structure.sections.length) {
        settings.structure.sections = clone(defaultSettings.structure.sections);
      }
      if (
        settings.whyUs &&
        settings.whyUs.title === "Не подгоняем дом под мебель, а проектируем мебель под дом"
      ) {
        settings.whyUs.title = defaultSettings.whyUs.title;
      }
      if (!settings.portfolio || typeof settings.portfolio !== "object") {
        settings.portfolio = clone(defaultSettings.portfolio);
      }
      if (!Array.isArray(settings.portfolio.items) || !settings.portfolio.items.length) {
        settings.portfolio.items = clone(defaultSettings.portfolio.items);
      }
      settings.portfolio.eyebrow = settings.portfolio.eyebrow || defaultSettings.portfolio.eyebrow;
      settings.portfolio.title = settings.portfolio.title || defaultSettings.portfolio.title;
      settings.portfolio.text = settings.portfolio.text || defaultSettings.portfolio.text;
      settings.portfolio.buttonText = settings.portfolio.buttonText || defaultSettings.portfolio.buttonText;
      settings.portfolio.buttonHref = settings.portfolio.buttonHref || defaultSettings.portfolio.buttonHref;
      settings.portfolio.cardCaption = settings.portfolio.cardCaption || defaultSettings.portfolio.cardCaption;
      settings.portfolio.items = settings.portfolio.items.map((item, index) => ({
        id: item.id || "portfolio-" + index,
        title: item.title || "Новый проект",
        metaPrimary: item.metaPrimary || "",
        metaSecondary: item.metaSecondary || "",
        description: item.description || "",
        materialNote: item.materialNote || "",
        image: item.image || "",
        imageAlt: item.imageAlt || item.title || "Мебельный проект",
        imageCaption: item.imageCaption || "",
        visible: item.visible !== false
      }));
      if (!settings.materials || typeof settings.materials !== "object") {
        settings.materials = clone(defaultSettings.materials);
      }
      if (!Array.isArray(settings.materials.items) || !settings.materials.items.length) {
        settings.materials.items = clone(defaultSettings.materials.items);
      }
      settings.materials.eyebrow = settings.materials.eyebrow || defaultSettings.materials.eyebrow;
      settings.materials.title = settings.materials.title || defaultSettings.materials.title;
      settings.materials.text = settings.materials.text || defaultSettings.materials.text;
      settings.materials.image = settings.materials.image || defaultSettings.materials.image;
      settings.materials.imageAlt = settings.materials.imageAlt || defaultSettings.materials.imageAlt;
      settings.materials.imageCaption = settings.materials.imageCaption || defaultSettings.materials.imageCaption;
      settings.materials.items = settings.materials.items.map((item, index) => ({
        id: item.id || "material-" + index,
        title: item.title || "Новый материал",
        text: item.text || "",
        visible: item.visible !== false
      }));
      if (!settings.process || typeof settings.process !== "object") {
        settings.process = clone(defaultSettings.process);
      }
      if (!Array.isArray(settings.process.items) || !settings.process.items.length) {
        settings.process.items = clone(defaultSettings.process.items);
      }
      settings.process.eyebrow = settings.process.eyebrow || defaultSettings.process.eyebrow;
      settings.process.title = settings.process.title || defaultSettings.process.title;
      settings.process.items = settings.process.items.map((item, index) => ({
        id: item.id || "process-" + index,
        number: item.number || String(index + 1).padStart(2, "0"),
        title: item.title || "Новый этап",
        text: item.text || "",
        visible: item.visible !== false
      }));
      if (!settings.faq || typeof settings.faq !== "object") {
        settings.faq = clone(defaultSettings.faq);
      }
      if (!Array.isArray(settings.faq.items) || !settings.faq.items.length) {
        settings.faq.items = clone(defaultSettings.faq.items);
      }
      settings.faq.eyebrow = settings.faq.eyebrow || defaultSettings.faq.eyebrow;
      settings.faq.title = settings.faq.title || defaultSettings.faq.title;
      settings.faq.items = settings.faq.items.map((item, index) => ({
        id: item.id || "faq-" + index,
        question: item.question || "Новый вопрос",
        answer: item.answer || "",
        open: item.open === true,
        visible: item.visible !== false
      }));
      if (!settings.reviews || typeof settings.reviews !== "object") {
        settings.reviews = clone(defaultSettings.reviews);
      }
      if (!Array.isArray(settings.reviews.items) || !settings.reviews.items.length) {
        settings.reviews.items = clone(defaultSettings.reviews.items);
      }
      settings.reviews.eyebrow = settings.reviews.eyebrow || defaultSettings.reviews.eyebrow;
      settings.reviews.title = settings.reviews.title || defaultSettings.reviews.title;
      settings.reviews.text = settings.reviews.text || defaultSettings.reviews.text;
      settings.reviews.yandexOrgUrl = settings.reviews.yandexOrgUrl || defaultSettings.reviews.yandexOrgUrl;
      settings.reviews.items = settings.reviews.items.map((item, index) => {
        const fallback = defaultSettings.reviews.items[index] || {};
        return {
          id: item.id || "review-" + index,
          author: item.author || fallback.author || "Клиент",
          label: item.label || fallback.label || "Проект мебели",
          quote: item.quote || fallback.quote || "",
          rating: Number(item.rating) || 5,
          date: item.date || fallback.date || "",
          sourceLabel: item.sourceLabel || fallback.sourceLabel || "Источник",
          sourceUrl: item.sourceUrl || fallback.sourceUrl || settings.reviews.yandexOrgUrl || ""
        };
      });
      if (!Array.isArray(settings.reviews.qrCards) || !settings.reviews.qrCards.length) {
        settings.reviews.qrCards = clone(defaultSettings.reviews.qrCards);
      }
      settings.reviews.qrCards = settings.reviews.qrCards.map((item, index) => {
        const fallback = defaultSettings.reviews.qrCards[index] || {};
        return {
          id: item.id || "qr-" + index,
          badge: item.badge || fallback.badge || "Источник",
          title: item.title || fallback.title || "Оставить отзыв",
          text: item.text || fallback.text || "",
          buttonLabel: item.buttonLabel || fallback.buttonLabel || "Источник",
          linkUrl: item.linkUrl || fallback.linkUrl || settings.reviews.yandexOrgUrl || "",
          ratingValue: Number.isFinite(Number(item.ratingValue)) ? Number(item.ratingValue) : Number(fallback.ratingValue) || 5,
          reviewCount: Number.isFinite(Number(item.reviewCount)) ? Math.max(0, Math.round(Number(item.reviewCount))) : Number(fallback.reviewCount) || 0,
          qrMode: item.qrMode || fallback.qrMode || "generated",
          qrImage: item.qrImage || ""
        };
      });
      if (!settings.contacts || typeof settings.contacts !== "object") {
        settings.contacts = clone(defaultSettings.contacts);
      }
      settings.contacts.eyebrow = settings.contacts.eyebrow || defaultSettings.contacts.eyebrow;
      settings.contacts.title = settings.contacts.title || defaultSettings.contacts.title;
      settings.contacts.city = settings.contacts.city || defaultSettings.contacts.city;
      settings.contacts.addressTitle = settings.contacts.addressTitle || defaultSettings.contacts.addressTitle;
      settings.contacts.hoursTitle = settings.contacts.hoursTitle || defaultSettings.contacts.hoursTitle;
      settings.contacts.hoursDisplay = settings.contacts.hoursDisplay || defaultSettings.contacts.hoursDisplay;
      settings.contacts.phoneTitle = settings.contacts.phoneTitle || defaultSettings.contacts.phoneTitle;
      settings.contacts.emailTitle = settings.contacts.emailTitle || defaultSettings.contacts.emailTitle;
      settings.contacts.socialsTitle = settings.contacts.socialsTitle || defaultSettings.contacts.socialsTitle;
      settings.contacts.mapTitle = settings.contacts.mapTitle || defaultSettings.contacts.mapTitle;
      settings.contacts.mapRouteLabel = settings.contacts.mapRouteLabel || defaultSettings.contacts.mapRouteLabel;
      if (!settings.footer || typeof settings.footer !== "object") {
        settings.footer = clone(defaultSettings.footer);
      }
      settings.footer.brandDescription = settings.footer.brandDescription || defaultSettings.footer.brandDescription;
      settings.footer.contactTitle = settings.footer.contactTitle || defaultSettings.footer.contactTitle;
      settings.footer.contactText = settings.footer.contactText || defaultSettings.footer.contactText;
      settings.footer.copyrightText = settings.footer.copyrightText || defaultSettings.footer.copyrightText;
      settings.footer.privacyLabel = settings.footer.privacyLabel || defaultSettings.footer.privacyLabel;
      settings.footer.privacyUrl = settings.footer.privacyUrl || defaultSettings.footer.privacyUrl;
      settings.footer.agreementLabel = settings.footer.agreementLabel || defaultSettings.footer.agreementLabel;
      settings.footer.agreementUrl = settings.footer.agreementUrl || defaultSettings.footer.agreementUrl;
      settings.blocks = (settings.blocks || []).filter((block) => {
        return !(
          block &&
          block.title === "Сервис под дом, а не наоборот" &&
          String(block.text || "").includes("Добавляйте новые смысловые блоки")
        );
      });
      settings.blocks = settings.blocks.map((block, index) => ({
        id: block.id || "block-" + index,
        title: block.title || "Новый блок",
        subtitle: block.subtitle || "",
        text: block.text || "",
        buttonLabel: block.buttonLabel || "",
        buttonUrl: block.buttonUrl || "",
        image: block.image || "",
        imageAlt: block.imageAlt || block.title || "Блок мебельного сайта",
        imageCaption: block.imageCaption || "",
        icon: block.icon || "",
        type: block.type || "text",
        background: block.background || "",
        colorScheme: block.colorScheme || "light",
        spacing: block.spacing || "normal",
        visible: block.visible !== false,
        position: block.position || "contacts",
        displayOrder: Number.isFinite(Number(block.displayOrder)) ? Number(block.displayOrder) : index,
        layout: block.layout || "split",
        published: block.published !== false
      }));

      const sectionDefaults = clone(defaultSettings.structure.sections);
      const knownSections = new Map(sectionDefaults.map((item) => [item.id, item]));
      settings.structure.sections = sectionDefaults.map((item) => {
        const current = (settings.structure.sections || []).find((entry) => entry.id === item.id) || {};
        const rawAnchor = current.anchor || item.anchor || "#" + item.id;
        const anchor = String(rawAnchor).startsWith("#") ? String(rawAnchor) : "#" + String(rawAnchor).replace(/^#+/, "");
        return {
          ...item,
          ...current,
          anchor,
          visible: current.visible !== false
        };
      });

      settings.structure.sectionOrder = settings.structure.sectionOrder
        .filter((id) => knownSections.has(id))
        .concat(sectionDefaults.map((item) => item.id).filter((id) => !settings.structure.sectionOrder.includes(id)));

      settings.navigation.menu = settings.navigation.menu
        .filter((item) => item && item.id !== "menu-advantages" && String(item.label || "").trim() !== "Преимущества")
        .map((item, index) => {
          const linkedSection = settings.structure.sections.find((section) => section.id === item.sectionId);
          return {
            id: item.id || "menu-" + index,
            label: item.label || "Пункт меню",
            href: linkedSection ? linkedSection.anchor : item.href || "#hero",
            visible: item.visible !== false,
            sectionId: item.sectionId || ""
          };
        });
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return settings;
    } catch (error) {
      return clone(defaultSettings);
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return settings;
  }

  function loadLeads() {
    try {
      const raw = localStorage.getItem(LEADS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveLeads(leads) {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return leads;
  }

  function pushLead(lead) {
    const leads = loadLeads();
    leads.unshift(lead);
    saveLeads(leads.slice(0, 50));
  }

  function getDefaultMetrics() {
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      sessions: 0,
      leadsSubmitted: 0,
      lastVisitAt: "",
      lastLeadAt: "",
      pageViews: {},
      sources: {},
      devices: {}
    };
  }

  function loadMetrics() {
    try {
      const raw = localStorage.getItem(METRICS_KEY);
      return raw ? { ...getDefaultMetrics(), ...JSON.parse(raw) } : getDefaultMetrics();
    } catch (error) {
      return getDefaultMetrics();
    }
  }

  function saveMetrics(metrics) {
    const safeMetrics = { ...getDefaultMetrics(), ...(metrics || {}) };
    localStorage.setItem(METRICS_KEY, JSON.stringify(safeMetrics));
    return safeMetrics;
  }

  function incrementMetricBucket(metrics, bucketName, key) {
    if (!metrics[bucketName] || typeof metrics[bucketName] !== "object" || Array.isArray(metrics[bucketName])) {
      metrics[bucketName] = {};
    }
    const safeKey = String(key || "Не определено").trim() || "Не определено";
    metrics[bucketName][safeKey] = (Number(metrics[bucketName][safeKey]) || 0) + 1;
  }

  function getCurrentPageLabel() {
    const path = window.location.pathname.replace(/\/index\.html$/, "/") || "/";
    const hash = window.location.hash || "";
    if (hash) return path + hash;
    return path;
  }

  function getTrafficSource() {
    if (!document.referrer) return "Прямой заход";
    try {
      const referrer = new URL(document.referrer);
      if (referrer.host === window.location.host) return "Внутренние переходы";
      return referrer.host;
    } catch (error) {
      return "Внешний источник";
    }
  }

  function getDeviceType() {
    const userAgent = navigator.userAgent || "";
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "Планшеты";
    if (/mobile|iphone|ipod|android/i.test(userAgent)) return "Телефоны";
    return "Компьютеры";
  }

  function recordVisit() {
    const metrics = loadMetrics();
    metrics.totalVisits += 1;
    metrics.lastVisitAt = new Date().toISOString();
    incrementMetricBucket(metrics, "pageViews", getCurrentPageLabel());
    incrementMetricBucket(metrics, "sources", getTrafficSource());
    incrementMetricBucket(metrics, "devices", getDeviceType());

    try {
      const visitorId = localStorage.getItem(VISITOR_KEY);
      if (!visitorId) {
        localStorage.setItem(VISITOR_KEY, "visitor-" + Math.random().toString(16).slice(2, 10));
        metrics.uniqueVisitors += 1;
      }
    } catch (error) {}

    try {
      const sessionId = sessionStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionStorage.setItem(SESSION_KEY, "session-" + Date.now());
        metrics.sessions += 1;
      }
    } catch (error) {}

    return saveMetrics(metrics);
  }

  function recordLead() {
    const metrics = loadMetrics();
    metrics.leadsSubmitted += 1;
    metrics.lastLeadAt = new Date().toISOString();
    return saveMetrics(metrics);
  }

  window.SiteConfig = {
    SETTINGS_KEY,
    LEADS_KEY,
    METRICS_KEY,
    defaultSettings: clone(defaultSettings),
    clone,
    merge,
    loadSettings,
    saveSettings,
    loadLeads,
    saveLeads,
    pushLead,
    loadMetrics,
    saveMetrics,
    recordVisit,
    recordLead
  };
})();
