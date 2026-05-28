(function () {
  const root = document.querySelector("[data-petite-chat]");

  if (!root) {
    return;
  }

  const toggle = root.querySelector("[data-petite-toggle]");
  const panel = root.querySelector("[data-petite-panel]");
  const closeButton = root.querySelector("[data-petite-close]");
  const log = root.querySelector("[data-petite-log]");
  const form = root.querySelector("[data-petite-form]");
  const input = root.querySelector("[data-petite-input]");
  const promptButtons = [...root.querySelectorAll("[data-petite-prompt]")];
  const pageLang = root.dataset.pageLang || "en";
  const storageKey = "petite-mignonne-chat";
  const closeAnimationMs = 220;
  let closeTimerId = null;

  const copy = {
    en: {
      greeting:
        "Bonjour, I am Petite Mignonne, Adeleine's tiny portfolio concierge. Ask me about her growth marketing work, SEO/AEO/GEO results, Meta ads, writing, or how to contact her.",
      fallback:
        "I can help with Adeleine's portfolio, resume, SEO/AEO/GEO work, Meta ads, blog, languages, or contact details. Try asking: What makes Adeleine strong for growth marketing?",
      placeholder: "Ask about Adeleine...",
    },
    fr: {
      greeting:
        "Bonjour, je suis Petite Mignonne, la petite concierge du portfolio d'Adeleine. Posez-moi une question sur son growth marketing, son SEO/AEO/GEO, ses publicites Meta, ses articles ou ses coordonnees.",
      fallback:
        "Je peux aider avec le portfolio, le CV, le SEO/AEO/GEO, les publicites Meta, le blog, les langues ou les coordonnees d'Adeleine. Essayez : Qu'est-ce qui rend Adeleine forte en growth marketing ?",
      placeholder: "Posez une question sur Adeleine...",
    },
    zh: {
      greeting:
        "Bonjour，我是 Petite Mignonne，Adeleine 的小小作品集導覽員。你可以問我她的 growth marketing、SEO/AEO/GEO、Meta ads、文章，或怎麼聯絡她。",
      fallback:
        "我可以回答 Adeleine 的作品集、履歷、SEO/AEO/GEO、Meta 廣告、部落格、語言能力和聯絡方式。你可以問：Adeleine 適合什麼樣的 growth marketing 工作？",
      placeholder: "問我關於 Adeleine 的事...",
    },
  };

  const answers = {
    en: {
      hello:
        "Hi, lovely to meet you. I can give you the short version, the recruiter version, or the deep portfolio version.",
      portfolio:
        'Adeleine positions herself around digital advertising and growth marketing: cross-border performance, market insight, and scalable growth. Start with <a href="/portfolio/">My Creations</a>, especially the Meta ads creative archive.',
      resume:
        'Adeleine is a trilingual growth marketing manager with technical depth: SEO/AEO, frontend execution, AI workflows, paid acquisition, and multilingual content. Her recent work includes Swipr/BeFriend, Omnichat, and Back Market. See the full <a href="/cv/">resume</a>.',
      search:
        "Her search work combines SEO, AEO, and GEO: multilingual strategy, answer-engine visibility, structured content, and landing page improvements. Highlights include 55.48% organic search share, an average Google Search Console position of 6.4, and 870+ AI-search mentions.",
      ads:
        'Her paid acquisition work includes UGC-led Meta creative systems, creative testing, audience analysis, and CPI control. The portfolio highlights around $0.66 to $0.98 CPI in competitive iOS-first US/UK markets. See <a href="/portfolio/my-past-ad-creatives/">My Past Ad Creatives</a>.',
      blog:
        'Her blog covers marketing, culture, SEO, content systems, and AI-assisted growth thinking. You can browse it here: <a href="/blog/">My Blog</a>.',
      contact:
        'You can contact Adeleine by email at <a href="mailto:hsiaotungw@gmail.com">hsiaotungw@gmail.com</a> or connect on <a href="https://www.linkedin.com/in/hsiao-tung-wang/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.',
      language:
        "Adeleine works across Mandarin, English, and French, with experience in international marketing contexts across Asia and Europe.",
      ai:
        "This version does not use an OpenAI API key. I am a lightweight local chatbox with curated portfolio answers, so it is safe for GitHub Pages. Later, Adeleine can connect me to a serverless AI endpoint.",
    },
    fr: {
      hello:
        "Bonjour, ravie de vous rencontrer. Je peux vous donner la version courte, la version recruteur, ou la visite detaillee du portfolio.",
      portfolio:
        'Adeleine se positionne en digital advertising et growth marketing : performance cross-border, lecture marche et croissance scalable. Commencez par <a href="/fr/portfolio/">Mes Creations</a>, notamment ses archives de creatives Meta.',
      resume:
        'Adeleine est growth marketing manager trilingue avec une forte dimension technique : SEO/AEO, frontend, workflows IA, paid acquisition et contenu multilingue. Son parcours inclut Swipr/BeFriend, Omnichat et Back Market. Voir le <a href="/fr/cv/">CV complet</a>.',
      search:
        "Son travail search combine SEO, AEO et GEO : strategie multilingue, visibilite dans les moteurs de reponse, contenu structure et optimisation des landing pages. Points forts : 55,48 % de trafic organique, position moyenne Google Search Console de 6,4 et 870+ mentions en AI search.",
      ads:
        'Son travail paid acquisition inclut des systemes Meta bases sur l\'UGC, les tests creatives, l\'analyse d\'audience et le controle du CPI. Le portfolio met en avant environ 0,66 a 0,98 USD de CPI sur des marches iOS US/UK competitifs. Voir <a href="/fr/portfolio/my-past-ad-creatives/">Ads Creatives</a>.',
      blog:
        'Son blog parle marketing, culture, SEO, systemes de contenu et croissance assistee par IA. Vous pouvez le lire ici : <a href="/fr/blog/">Mon Blog</a>.',
      contact:
        'Vous pouvez contacter Adeleine par email : <a href="mailto:hsiaotungw@gmail.com">hsiaotungw@gmail.com</a>, ou via <a href="https://www.linkedin.com/in/hsiao-tung-wang/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.',
      language:
        "Adeleine travaille en mandarin, anglais et francais, avec une experience marketing internationale entre l'Asie et l'Europe.",
      ai:
        "Cette version n'utilise pas de cle API OpenAI. Je suis un chatbox local avec des reponses portfolio soigneusement preparees, compatible avec GitHub Pages. Plus tard, Adeleine pourra me connecter a un endpoint IA serverless.",
    },
    zh: {
      hello:
        "嗨，很高興見到你。我可以給你超短版、招聘方版本，或比較完整的作品集導覽。",
      portfolio:
        'Adeleine 的定位是 digital advertising 和 growth marketing，核心包含跨市場成長、用戶洞察、內容系統和可規模化的 acquisition。可以先看 <a href="/portfolio/">My Creations</a>，尤其是 Meta ads creative archive。',
      resume:
        'Adeleine 是三語 growth marketing manager，也有前端和 AI workflow 的技術深度。她的經驗包含 Swipr/BeFriend、Omnichat、Back Market。完整履歷在這裡：<a href="/cv/">Resume</a>。',
      search:
        "她的 search work 結合 SEO、AEO、GEO：多語內容策略、AI search visibility、結構化內容與 landing page optimization。亮點包含 organic search 55.48%、Google Search Console 平均排名 6.4、以及 870+ AI-search mentions。",
      ads:
        '她的 paid acquisition 經驗包含 UGC-led Meta creatives、creative testing、audience analysis 和 CPI control。作品集中展示過在競爭激烈的 US/UK iOS 市場維持約 $0.66 到 $0.98 CPI。可以看 <a href="/portfolio/my-past-ad-creatives/">My Past Ad Creatives</a>。',
      blog:
        '她的 blog 會寫 marketing、culture、SEO、content systems 和 AI-assisted growth thinking。入口在這裡：<a href="/blog/">My Blog</a>。',
      contact:
        '可以寄信到 <a href="mailto:hsiaotungw@gmail.com">hsiaotungw@gmail.com</a>，或透過 <a href="https://www.linkedin.com/in/hsiao-tung-wang/" target="_blank" rel="noopener noreferrer">LinkedIn</a> 聯絡 Adeleine。',
      language:
        "Adeleine 使用中文、英文和法文工作，並有亞洲與歐洲市場的國際行銷經驗。",
      ai:
        "這一版不需要 OpenAI API key。我目前是 GitHub Pages 可用的本地 chatbox，回答內容來自你作品集裡預先整理好的資訊。之後如果你有 API key，可以再接 serverless AI endpoint。",
    },
  };

  const intentMap = [
    {
      intent: "hello",
      terms: ["hi", "hello", "hey", "bonjour", "salut", "你好", "嗨", "哈囉"],
    },
    {
      intent: "portfolio",
      terms: ["portfolio", "creation", "creations", "work", "project", "作品", "作品集", "專案"],
    },
    {
      intent: "resume",
      terms: ["resume", "cv", "experience", "career", "background", "履歷", "經歷", "背景"],
    },
    {
      intent: "search",
      terms: ["seo", "aeo", "geo", "search", "organic", "google", "ai search", "搜尋", "自然流量"],
    },
    {
      intent: "ads",
      terms: ["ad", "ads", "meta", "paid", "cpi", "creative", "acquisition", "廣告", "投放", "素材"],
    },
    {
      intent: "blog",
      terms: ["blog", "writing", "article", "post", "essay", "文章", "部落格"],
    },
    {
      intent: "contact",
      terms: ["contact", "hire", "email", "linkedin", "reach", "聯絡", "信箱", "合作"],
    },
    {
      intent: "language",
      terms: ["language", "french", "english", "mandarin", "trilingual", "langue", "語言", "法文", "英文", "中文"],
    },
    {
      intent: "ai",
      terms: ["openai", "api", "chatgpt", "ai", "llm", "key", "模型", "人工智慧"],
    },
  ];

  const getLanguage = (message) => {
    if (/[\u4e00-\u9fff]/.test(message)) {
      return "zh";
    }

    if (pageLang === "fr") {
      return "fr";
    }

    return "en";
  };

  const createMessage = (role, html) => {
    const message = document.createElement("div");
    message.className = `petite-chat-message petite-chat-message-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "petite-chat-bubble";

    if (role === "user") {
      bubble.textContent = html;
    } else {
      bubble.innerHTML = html;
    }

    message.appendChild(bubble);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
  };

  const readHistory = () => {
    try {
      return JSON.parse(window.sessionStorage.getItem(storageKey)) || [];
    } catch (error) {
      return [];
    }
  };

  const writeHistory = (history) => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(history.slice(-16)));
    } catch (error) {
      return;
    }
  };

  const remember = (role, html) => {
    const history = readHistory();
    history.push({ role, html });
    writeHistory(history);
  };

  const addMessage = (role, html) => {
    createMessage(role, html);
    remember(role, html);
  };

  const findAnswer = (message) => {
    const lang = getLanguage(message);
    const normalized = message.toLowerCase();
    const match = intentMap.find(({ terms }) =>
      terms.some((term) => normalized.includes(term))
    );

    if (!match) {
      return copy[lang].fallback;
    }

    return answers[lang][match.intent];
  };

  const sendMessage = (message) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    addMessage("user", trimmed);
    window.setTimeout(() => {
      addMessage("bot", findAnswer(trimmed));
    }, 220);
  };

  const openChat = () => {
    if (closeTimerId) {
      window.clearTimeout(closeTimerId);
      closeTimerId = null;
    }

    panel.hidden = false;
    root.classList.remove("is-closing");
    toggle.setAttribute("aria-expanded", "true");
    window.requestAnimationFrame(() => {
      root.classList.add("is-open");
    });
    window.setTimeout(() => input.focus(), 80);
  };

  const closeChat = () => {
    root.classList.add("is-closing");
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    closeTimerId = window.setTimeout(() => {
      panel.hidden = true;
      root.classList.remove("is-closing");
      closeTimerId = null;
      toggle.focus();
    }, closeAnimationMs);
  };

  const hydrate = () => {
    const history = readHistory();
    const lang = pageLang === "fr" ? "fr" : "en";

    if (copy[lang]) {
      input.placeholder = copy[lang].placeholder;
    }

    if (history.length > 0) {
      history.forEach((item) => createMessage(item.role, item.html));
      return;
    }

    addMessage("bot", copy[lang].greeting);
  };

  toggle.addEventListener("click", () => {
    if (root.classList.contains("is-open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeButton.addEventListener("click", closeChat);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
    input.value = "";
  });

  promptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sendMessage(button.dataset.petitePrompt || button.textContent);
      input.value = "";
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      closeChat();
    }
  });

  hydrate();
})();
