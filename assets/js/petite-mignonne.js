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
  const actionButtons = [...root.querySelectorAll("[data-petite-action]")];
  const pageLang = root.dataset.pageLang || "en";
  const currentPath = window.location.pathname;
  const storageKey = "petite-mignonne-chat";
  const autoOpenKey = "petite-mignonne-auto-opened";
  const dismissedKey = "petite-mignonne-dismissed";
  const autoOpenDelayMs = 900;
  const closeAnimationMs = 220;
  const thinkingDelayMs = 520;
  let closeTimerId = null;
  let thinkingTimerId = null;
  let typingMessage = null;
  let celebrationTimerId = null;

  const copy = {
    en: {
      greeting:
        "Bonjour, I am Petite Mignonne, Adeleine's tiny portfolio concierge. Ask me about her growth marketing work, SEO/AEO/GEO results, Meta ads, writing, or how to contact her.",
      fallback:
        "I can help with Adeleine's portfolio, resume, SEO/AEO/GEO work, Meta ads, blog, languages, or contact details. Try asking: What makes Adeleine strong for growth marketing?",
      placeholder: "Ask about Adeleine...",
      thinking: "Petite Mignonne is thinking",
    },
    fr: {
      greeting:
        "Bonjour, je suis Petite Mignonne, la petite concierge du portfolio d'Adeleine. Posez-moi une question sur son growth marketing, son SEO/AEO/GEO, ses publicites Meta, ses articles ou ses coordonnees.",
      fallback:
        "Je peux aider avec le portfolio, le CV, le SEO/AEO/GEO, les publicites Meta, le blog, les langues ou les coordonnees d'Adeleine. Essayez : Qu'est-ce qui rend Adeleine forte en growth marketing ?",
      placeholder: "Posez une question sur Adeleine...",
      thinking: "Petite Mignonne reflechit",
    },
    zh: {
      greeting:
        "Bonjour，我是 Petite Mignonne，Adeleine 的小小作品集導覽員。你可以問我她的 growth marketing、SEO/AEO/GEO、Meta ads、文章，或怎麼聯絡她。",
      fallback:
        "我可以回答 Adeleine 的作品集、履歷、SEO/AEO/GEO、Meta 廣告、部落格、語言能力和聯絡方式。你可以問：Adeleine 適合什麼樣的 growth marketing 工作？",
      placeholder: "問我關於 Adeleine 的事...",
      thinking: "Petite Mignonne 正在想",
    },
  };

  const pageGreetings = {
    en: {
      home:
        "Bonjour, I am Petite Mignonne. You are on Adeleine's home page, so I can give you a quick overview, switch into Recruiter Mode, or take you on a portfolio tour.",
      resume:
        'Bonjour, you found Adeleine\'s resume. I can summarize her growth marketing experience, point you to the strongest proof points, or open <a href="/cv/">the full resume</a>.',
      portfolio:
        'Bonjour, welcome to Adeleine\'s portfolio. I can guide you through her growth marketing work, search results, paid acquisition proof, and creative archive.',
      ads:
        "Bonjour, you are in the Meta ads creative archive. I can explain Adeleine's UGC-led testing system, CPI control, and creative workflow.",
      blog:
        'Bonjour, welcome to Adeleine\'s blog. I can help you explore her writing on SEO, AI-assisted growth, content systems, and culture.',
      article:
        "Bonjour, you are reading one of Adeleine's essays. I can connect this article back to her broader positioning in content strategy and growth marketing.",
    },
    fr: {
      home:
        "Bonjour, je suis Petite Mignonne. Vous etes sur la page d'accueil d'Adeleine : je peux faire un apercu rapide, passer en mode recruteur, ou lancer une visite guidee.",
      resume:
        'Bonjour, vous consultez le CV d\'Adeleine. Je peux resumer son experience growth marketing, ses preuves les plus fortes, ou ouvrir <a href="/fr/cv/">le CV complet</a>.',
      portfolio:
        "Bonjour, bienvenue dans le portfolio d'Adeleine. Je peux guider la visite entre growth marketing, search, paid acquisition et archives creatives.",
      ads:
        "Bonjour, vous etes dans les archives Meta ads. Je peux expliquer son systeme de tests UGC, son controle du CPI et son workflow creative.",
      blog:
        "Bonjour, bienvenue sur le blog d'Adeleine. Je peux aider a explorer ses articles sur le SEO, l'IA, les systemes de contenu et la culture.",
      article:
        "Bonjour, vous lisez un essai d'Adeleine. Je peux relier cet article a son positionnement en strategie de contenu et growth marketing.",
    },
  };

  const recruiterCards = {
    en:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Recruiter Mode</div><p><strong>30-second read:</strong> Adeleine is a trilingual growth marketing manager who blends SEO/AEO/GEO, paid acquisition, frontend execution, AI workflows, and multilingual content strategy.</p><div class="petite-chat-list"><span>Best fit: Growth Marketing, SEO/AEO, Content Growth, Performance Marketing.</span><span>Proof: 55.48% organic traffic share, 870+ AI-search mentions, avg. GSC position 6.4.</span><span>Markets: US, UK, France, Germany, Singapore, Malaysia, Taiwan.</span></div><div class="petite-chat-actions"><a href="/cv/">Resume</a><a href="/portfolio/">Portfolio</a><a href="mailto:hsiaotungw@gmail.com">Email</a></div></div>',
    fr:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Mode recruteur</div><p><strong>Resume en 30 secondes :</strong> Adeleine est growth marketing manager trilingue, a l\'intersection du SEO/AEO/GEO, de l\'acquisition paid, du frontend, des workflows IA et du contenu multilingue.</p><div class="petite-chat-list"><span>Postes cibles : Growth Marketing, SEO/AEO, Content Growth, Performance Marketing.</span><span>Preuves : 55,48 % de trafic organique, 870+ mentions AI search, position GSC moyenne de 6,4.</span><span>Marches : US, UK, France, Allemagne, Singapour, Malaisie, Taiwan.</span></div><div class="petite-chat-actions"><a href="/fr/cv/">CV</a><a href="/fr/portfolio/">Portfolio</a><a href="mailto:hsiaotungw@gmail.com">Email</a></div></div>',
    zh:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Recruiter Mode</div><p><strong>30 秒版本：</strong>Adeleine 是三語 growth marketing manager，結合 SEO/AEO/GEO、paid acquisition、前端執行、AI workflows 和多語內容策略。</p><div class="petite-chat-list"><span>適合職位：Growth Marketing、SEO/AEO、Content Growth、Performance Marketing。</span><span>成果亮點：55.48% organic traffic share、870+ AI-search mentions、GSC 平均排名 6.4。</span><span>市場經驗：US、UK、France、Germany、Singapore、Malaysia、Taiwan。</span></div><div class="petite-chat-actions"><a href="/cv/">Resume</a><a href="/portfolio/">Portfolio</a><a href="mailto:hsiaotungw@gmail.com">Email</a></div></div>',
  };

  const tourCards = {
    en:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Portfolio Tour</div><p>Here is the best path through Adeleine\'s site:</p><div class="petite-chat-list"><span>1. Home: positioning, impact metrics, and recommendations.</span><span>2. Resume: experience, AI workflows, languages, and core skills.</span><span>3. Portfolio: growth systems, SEO/AEO/GEO, and paid acquisition proof.</span><span>4. Ad Creatives: Meta creative archive and testing framework.</span><span>5. Blog: essays on marketing, culture, SEO, and AI-assisted growth.</span></div><div class="petite-chat-actions"><a href="/cv/">Start with Resume</a><a href="/portfolio/">Open Portfolio</a><a href="/blog/">Read Blog</a></div></div>',
    fr:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Visite guidee</div><p>Voici le meilleur parcours dans le site d\'Adeleine :</p><div class="petite-chat-list"><span>1. Accueil : positionnement, resultats et recommandations.</span><span>2. CV : experience, workflows IA, langues et competences cles.</span><span>3. Portfolio : systemes growth, SEO/AEO/GEO et preuves paid acquisition.</span><span>4. Ads Creatives : archives Meta et framework de test.</span><span>5. Blog : articles marketing, culture, SEO et croissance assistee par IA.</span></div><div class="petite-chat-actions"><a href="/fr/cv/">Commencer par le CV</a><a href="/fr/portfolio/">Ouvrir le portfolio</a><a href="/fr/blog/">Lire le blog</a></div></div>',
    zh:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Portfolio Tour</div><p>建議你這樣逛 Adeleine 的網站：</p><div class="petite-chat-list"><span>1. Home：定位、成果數字、推薦語。</span><span>2. Resume：經歷、AI workflows、語言能力、核心技能。</span><span>3. Portfolio：growth systems、SEO/AEO/GEO、paid acquisition proof。</span><span>4. Ad Creatives：Meta creative archive 和 testing framework。</span><span>5. Blog：marketing、culture、SEO、AI-assisted growth 文章。</span></div><div class="petite-chat-actions"><a href="/cv/">先看 Resume</a><a href="/portfolio/">打開 Portfolio</a><a href="/blog/">閱讀 Blog</a></div></div>',
  };

  const quizCards = {
    en:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Talent Quiz</div><p>What kind of person are you looking for right now?</p><div class="petite-chat-quiz"><button type="button" data-petite-quiz="seo">SEO growth person</button><button type="button" data-petite-quiz="paid">Paid ads person</button><button type="button" data-petite-quiz="content">Content strategist</button><button type="button" data-petite-quiz="ai">AI workflow builder</button></div></div>',
    fr:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Quiz profil</div><p>Quel type de talent recherchez-vous maintenant ?</p><div class="petite-chat-quiz"><button type="button" data-petite-quiz="seo">Profil SEO growth</button><button type="button" data-petite-quiz="paid">Profil paid ads</button><button type="button" data-petite-quiz="content">Strategie de contenu</button><button type="button" data-petite-quiz="ai">Builder workflows IA</button></div></div>',
    zh:
      '<div class="petite-chat-card"><div class="petite-chat-card-title">Talent Quiz</div><p>你現在最想找哪種人才？</p><div class="petite-chat-quiz"><button type="button" data-petite-quiz="seo">SEO growth person</button><button type="button" data-petite-quiz="paid">Paid ads person</button><button type="button" data-petite-quiz="content">Content strategist</button><button type="button" data-petite-quiz="ai">AI workflow builder</button></div></div>',
  };

  const quizResults = {
    en: {
      seo:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match: SEO Growth</div><p>Adeleine is strongest where SEO meets market expansion: multilingual information architecture, AEO/GEO visibility, and content that can win both Google and AI answer engines.</p><div class="petite-chat-list"><span>Best proof: 55.48% organic search share.</span><span>Best proof: average GSC position of 6.4.</span><span>Best proof: 870+ AI-search mentions.</span></div><div class="petite-chat-actions"><a href="/portfolio/">See SEO Proof</a><a href="/cv/">Open Resume</a></div></div>',
      paid:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match: Paid Ads</div><p>Adeleine can help when you need structured creative testing, UGC-led Meta ads, audience reading, and CPI control in competitive markets.</p><div class="petite-chat-list"><span>Best proof: UGC-led Meta creative workflow.</span><span>Best proof: around $0.66 to $0.98 CPI in iOS-first US/UK markets.</span><span>Best proof: creative archive with testing logic.</span></div><div class="petite-chat-actions"><a href="/portfolio/my-past-ad-creatives/">Ad Creatives</a><a href="/portfolio/">Portfolio</a></div></div>',
      content:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match: Content Strategy</div><p>Adeleine is a fit if you need editorial systems, bilingual content, trend analysis, and content that supports acquisition instead of just publishing for volume.</p><div class="petite-chat-list"><span>Best proof: Gen Z trend blog and AI-informed editorial planning.</span><span>Best proof: multilingual content operations across English and French.</span><span>Best proof: blog essays that connect culture and growth strategy.</span></div><div class="petite-chat-actions"><a href="/blog/">Read Blog</a><a href="/portfolio/">Content Work</a></div></div>',
      ai:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match: AI Workflow Builder</div><p>Adeleine is useful when a team needs practical AI workflows for growth work: content pipelines, prompt systems, automated research, and frontend-ready outputs.</p><div class="petite-chat-list"><span>Best proof: n8n / Make workflow thinking.</span><span>Best proof: Claude, Gemini, OpenAI and AI-agent workflows.</span><span>Best proof: SEO/AEO systems designed for AI search behavior.</span></div><div class="petite-chat-actions"><a href="/cv/">AI Stack</a><a href="/portfolio/">Growth Systems</a></div></div>',
    },
    fr: {
      seo:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match : SEO Growth</div><p>Adeleine est particulierement forte quand le SEO rencontre l\'expansion marche : architecture d\'information multilingue, visibilite AEO/GEO et contenus capables de performer sur Google comme dans les moteurs de reponse IA.</p><div class="petite-chat-list"><span>Preuve : 55,48 % de trafic organique.</span><span>Preuve : position GSC moyenne de 6,4.</span><span>Preuve : 870+ mentions AI search.</span></div><div class="petite-chat-actions"><a href="/fr/portfolio/">Voir les preuves SEO</a><a href="/fr/cv/">Ouvrir le CV</a></div></div>',
      paid:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match : Paid Ads</div><p>Adeleine est pertinente si vous cherchez des tests creatives structures, des publicites Meta basees sur l\'UGC, une lecture fine des audiences et le controle du CPI sur des marches competitifs.</p><div class="petite-chat-list"><span>Preuve : workflow creative Meta base sur l\'UGC.</span><span>Preuve : environ 0,66 a 0,98 USD de CPI sur les marches iOS US/UK.</span><span>Preuve : archive creative avec logique de test.</span></div><div class="petite-chat-actions"><a href="/fr/portfolio/my-past-ad-creatives/">Ads Creatives</a><a href="/fr/portfolio/">Portfolio</a></div></div>',
      content:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match : Strategie de contenu</div><p>Adeleine est un bon fit si vous avez besoin de systemes editoriaux, de contenu bilingue, d\'analyse de tendances et de contenus qui soutiennent l\'acquisition.</p><div class="petite-chat-list"><span>Preuve : blog Gen Z et planning editorial informe par l\'IA.</span><span>Preuve : operations de contenu multilingues en anglais et francais.</span><span>Preuve : articles reliant culture et strategie growth.</span></div><div class="petite-chat-actions"><a href="/fr/blog/">Lire le blog</a><a href="/fr/portfolio/">Travaux contenu</a></div></div>',
      ai:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match : Workflows IA</div><p>Adeleine est utile quand une equipe veut des workflows IA concrets pour le growth : pipelines contenu, prompts, recherche automatisee et outputs prets pour le frontend.</p><div class="petite-chat-list"><span>Preuve : logique n8n / Make.</span><span>Preuve : Claude, Gemini, OpenAI et workflows agents IA.</span><span>Preuve : systemes SEO/AEO concus pour la recherche IA.</span></div><div class="petite-chat-actions"><a href="/fr/cv/">Stack IA</a><a href="/fr/portfolio/">Systemes growth</a></div></div>',
    },
    zh: {
      seo:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match：SEO Growth</div><p>如果你需要的是 SEO、AEO/GEO、多語資訊架構和 AI search visibility，Adeleine 很適合。</p><div class="petite-chat-list"><span>證據：55.48% organic search share。</span><span>證據：GSC 平均排名 6.4。</span><span>證據：870+ AI-search mentions。</span></div><div class="petite-chat-actions"><a href="/portfolio/">看 SEO 成果</a><a href="/cv/">看履歷</a></div></div>',
      paid:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match：Paid Ads</div><p>如果你需要 Meta ads、UGC creative testing、受眾分析和 CPI control，Adeleine 很適合。</p><div class="petite-chat-list"><span>證據：UGC-led Meta creative workflow。</span><span>證據：US/UK iOS 市場約 $0.66 到 $0.98 CPI。</span><span>證據：有完整 ad creative archive 和測試邏輯。</span></div><div class="petite-chat-actions"><a href="/portfolio/my-past-ad-creatives/">看廣告作品</a><a href="/portfolio/">看作品集</a></div></div>',
      content:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match：Content Strategy</div><p>如果你要找懂 editorial system、雙語內容、趨勢分析和 growth content 的人，Adeleine 很適合。</p><div class="petite-chat-list"><span>證據：Gen Z trend blog 與 AI-informed editorial planning。</span><span>證據：英文與法文內容營運經驗。</span><span>證據：文章能連接 culture 和 growth strategy。</span></div><div class="petite-chat-actions"><a href="/blog/">讀 Blog</a><a href="/portfolio/">看內容作品</a></div></div>',
      ai:
        '<div class="petite-chat-card"><div class="petite-chat-card-title">Match：AI Workflow Builder</div><p>如果團隊想把 AI 真的用進 growth 工作流，例如內容 pipeline、prompt system、自動化研究和前端輸出，Adeleine 很適合。</p><div class="petite-chat-list"><span>證據：n8n / Make workflow thinking。</span><span>證據：Claude、Gemini、OpenAI、AI agent workflows。</span><span>證據：為 AI search behavior 設計 SEO/AEO systems。</span></div><div class="petite-chat-actions"><a href="/cv/">看 AI stack</a><a href="/portfolio/">看 growth systems</a></div></div>',
    },
  };

  const kpopEggs = [
    { terms: ["kpop", "k-pop", "韓星", "韓團", "韓流", "二代", "三代", "四代", "五代", "六代"], artist: "K-pop universe", generation: "2nd gen to new-gen", works: "BIGBANG, Girls' Generation, BTS, BLACKPINK, aespa, IVE, NewJeans, BABYMONSTER, RIIZE, ILLIT" },
    { terms: ["bigbang", "big bang", "g-dragon", "gdragon", "gd", "taeyang"], artist: "BIGBANG / G-Dragon", generation: "2nd gen", works: "Fantastic Baby, Bang Bang Bang, Crooked, Untitled, 2014" },
    { terms: ["girls generation", "snsd", "少女時代", "taeyeon"], artist: "Girls' Generation / Taeyeon", generation: "2nd gen", works: "Gee, Genie, I Got a Boy, INVU" },
    { terms: ["2ne1", "cl"], artist: "2NE1 / CL", generation: "2nd gen", works: "I Am the Best, Come Back Home, Hello Bitches" },
    { terms: ["shinee", "taemin"], artist: "SHINee / Taemin", generation: "2nd gen", works: "Replay, Sherlock, View, Move" },
    { terms: ["super junior", "suju"], artist: "Super Junior", generation: "2nd gen", works: "Sorry Sorry, Mr. Simple, Bonamana" },
    { terms: ["wonder girls"], artist: "Wonder Girls", generation: "2nd gen", works: "Tell Me, Nobody, Why So Lonely" },
    { terms: ["kara"], artist: "KARA", generation: "2nd gen", works: "Mister, Step, When I Move" },
    { terms: ["t-ara", "tara"], artist: "T-ARA", generation: "2nd gen", works: "Roly-Poly, Lovey-Dovey, Sugar Free" },
    { terms: ["tvxq", "dbsk"], artist: "TVXQ", generation: "2nd gen", works: "Mirotic, Rising Sun, Catch Me" },
    { terms: ["bts", "bangtan", "jungkook", "jimin"], artist: "BTS", generation: "3rd gen", works: "Blood Sweat & Tears, Spring Day, Dynamite, Seven" },
    { terms: ["blackpink", "jennie", "lisa", "rose", "rosé", "jisoo"], artist: "BLACKPINK", generation: "3rd gen", works: "DDU-DU DDU-DU, Kill This Love, Pink Venom, Mantra, Rockstar, APT." },
    { terms: ["twice", "nayeon"], artist: "TWICE", generation: "3rd gen", works: "Cheer Up, TT, Fancy, The Feels, POP!" },
    { terms: ["exo", "kai", "baekhyun"], artist: "EXO", generation: "3rd gen", works: "Growl, Call Me Baby, Love Shot, Mmmh, Bambi" },
    { terms: ["red velvet", "rv", "seulgi", "wendy", "irene"], artist: "Red Velvet", generation: "3rd gen", works: "Red Flavor, Bad Boy, Psycho, Feel My Rhythm" },
    { terms: ["seventeen", "svt", "hoshi"], artist: "SEVENTEEN", generation: "3rd gen", works: "Very Nice, Don't Wanna Cry, Super, Maestro" },
    { terms: ["nct", "nct 127", "nct dream", "wayv"], artist: "NCT", generation: "3rd gen", works: "Cherry Bomb, Kick It, Hot Sauce, Baggy Jeans" },
    { terms: ["mamamoo", "hwasa"], artist: "MAMAMOO / Hwasa", generation: "3rd gen", works: "Egotistic, Hip, Maria" },
    { terms: ["got7"], artist: "GOT7", generation: "3rd gen", works: "Just Right, Hard Carry, Lullaby" },
    { terms: ["aespa", "æspa", "karina", "winter", "ningning", "giselle"], artist: "aespa", generation: "4th gen", works: "Next Level, Savage, Spicy, Drama, Supernova, Armageddon" },
    { terms: ["ive", "wonyoung", "yujin"], artist: "IVE", generation: "4th gen", works: "ELEVEN, LOVE DIVE, After LIKE, I AM, HEYA" },
    { terms: ["newjeans", "new jeans", "njz", "hanni", "haerin", "danielle", "minji", "hyein"], artist: "NewJeans", generation: "4th gen", works: "Attention, Hype Boy, Ditto, Super Shy, How Sweet" },
    { terms: ["le sserafim", "lesserafim", "lsrfm", "sakura", "chaewon"], artist: "LE SSERAFIM", generation: "4th gen", works: "FEARLESS, ANTIFRAGILE, UNFORGIVEN, EASY, CRAZY" },
    { terms: ["stray kids", "skz", "felix", "hyunjin"], artist: "Stray Kids", generation: "4th gen", works: "God's Menu, MANIAC, S-Class, LALALALA, Chk Chk Boom" },
    { terms: ["itzy", "yeji", "ryujin"], artist: "ITZY", generation: "4th gen", works: "DALLA DALLA, WANNABE, LOCO, CAKE" },
    { terms: ["txt", "tomorrow x together", "yeonjun"], artist: "TXT", generation: "4th gen", works: "Crown, Blue Hour, 0X1=LOVESONG, Sugar Rush Ride, Deja Vu" },
    { terms: ["enhypen", "enha"], artist: "ENHYPEN", generation: "4th gen", works: "Given-Taken, Drunk-Dazed, Bite Me, Sweet Venom" },
    { terms: ["ateez"], artist: "ATEEZ", generation: "4th gen", works: "Wonderland, Answer, Bouncy, Crazy Form" },
    { terms: ["gidle", "(g)i-dle", "g-idle", "idle", "soyeon"], artist: "(G)I-DLE", generation: "4th gen", works: "LATATA, TOMBOY, Nxde, Queencard, Super Lady" },
    { terms: ["nmixx"], artist: "NMIXX", generation: "4th gen", works: "O.O, Love Me Like This, DASH, See That?" },
    { terms: ["stayc"], artist: "STAYC", generation: "4th gen", works: "ASAP, Stereotype, RUN2U, Teddy Bear" },
    { terms: ["babymonster", "baby monster", "babymontser", "baemon", "ahyeon"], artist: "BABYMONSTER", generation: "5th gen / new-gen", works: "Batter Up, Sheesh, Forever, Drip" },
    { terms: ["riize", "wonbin"], artist: "RIIZE", generation: "5th gen / new-gen", works: "Get A Guitar, Love 119, Boom Boom Bass" },
    { terms: ["zerobaseone", "zb1"], artist: "ZEROBASEONE", generation: "5th gen / new-gen", works: "In Bloom, Crush, Feel the POP" },
    { terms: ["illit", "magnetic"], artist: "ILLIT", generation: "5th gen / new-gen", works: "Magnetic, Lucky Girl Syndrome, Cherish" },
    { terms: ["tws"], artist: "TWS", generation: "5th gen / new-gen", works: "plot twist, hey! hey!" },
    { terms: ["kiss of life", "kiof", "natty"], artist: "KISS OF LIFE", generation: "5th gen / new-gen", works: "Shhh, Midas Touch, Sticky" },
    { terms: ["boynextdoor", "bnd"], artist: "BOYNEXTDOOR", generation: "5th gen / new-gen", works: "One and Only, Earth Wind & Fire, Nice Guy" },
    { terms: ["meovv"], artist: "MEOVV", generation: "5th gen / new-gen", works: "MEOW, Toxic" },
    { terms: ["nct wish"], artist: "NCT WISH", generation: "5th gen / new-gen", works: "WISH, Songbird, Steady" },
    { terms: ["hearts2hearts", "h2h"], artist: "Hearts2Hearts", generation: "new-gen", works: "The Chase, STYLE" },
    { terms: ["izna"], artist: "izna", generation: "new-gen", works: "IZNA, TIMEBOMB" },
  ];

  const easterEggs = [
    {
      terms: ["bonjour", "salut"],
      responses: {
        en: "Bonjour bonjour. Petite Mignonne adjusts her beret, checks the portfolio clipboard, and is ready for a tiny but excellent tour.",
        fr: "Bonjour bonjour. Petite Mignonne ajuste son beret, verifie son petit clipboard, et se prepare pour une visite du portfolio.",
        zh: "Bonjour bonjour。Petite Mignonne 扶好貝雷帽，抱緊小剪貼板，準備帶你逛作品集。",
      },
    },
    {
      terms: ["bubble tea", "boba", "milk tea", "珍奶", "波霸", "奶茶", "perles", "bubble"],
      responses: {
        en: "Bubble tea detected. I am technically a portfolio concierge, but emotionally I am 80% tapioca pearls and 20% growth strategy.",
        fr: "Bubble tea detecte. Techniquement je suis concierge de portfolio, mais emotionnellement je suis 80 % perles de tapioca et 20 % strategie growth.",
        zh: "偵測到珍奶關鍵字。嚴格來說我是作品集小助理，但精神組成是 80% 珍珠、20% growth strategy。",
      },
    },
    {
      terms: ["hire adeleine", "hire", "recruit adeleine", "embaucher adeleine", "recruter adeleine", "錄取", "聘請", "合作"],
      celebrate: true,
      responses: {
        en:
          '<div class="petite-chat-card"><div class="petite-chat-card-title">Excellent choice</div><p>Petite Mignonne approves this hiring instinct. Adeleine brings growth marketing, SEO/AEO/GEO, paid acquisition, AI workflows, and multilingual execution.</p><div class="petite-chat-actions"><a href="/cv/">Resume</a><a href="/portfolio/">Portfolio</a><a href="mailto:hsiaotungw@gmail.com">Email Adeleine</a></div></div>',
        fr:
          '<div class="petite-chat-card"><div class="petite-chat-card-title">Excellent choix</div><p>Petite Mignonne approuve cet instinct de recrutement. Adeleine apporte growth marketing, SEO/AEO/GEO, paid acquisition, workflows IA et execution multilingue.</p><div class="petite-chat-actions"><a href="/fr/cv/">CV</a><a href="/fr/portfolio/">Portfolio</a><a href="mailto:hsiaotungw@gmail.com">Contacter Adeleine</a></div></div>',
        zh:
          '<div class="petite-chat-card"><div class="petite-chat-card-title">很會選</div><p>Petite Mignonne 認可這個招聘直覺。Adeleine 有 growth marketing、SEO/AEO/GEO、paid acquisition、AI workflows 和多語執行能力。</p><div class="petite-chat-actions"><a href="/cv/">Resume</a><a href="/portfolio/">Portfolio</a><a href="mailto:hsiaotungw@gmail.com">寄信給 Adeleine</a></div></div>',
      },
    },
    {
      terms: ["petite mignonne", "petite migonne", "mignonne", "小可愛", "petite"],
      celebrate: true,
      responses: {
        en: "You called my name. I am now legally obligated to be extra charming and recommend the strongest portfolio proof first.",
        fr: "Vous avez prononce mon nom. Je suis maintenant obligee d'etre encore plus charmante et de recommander les meilleures preuves du portfolio.",
        zh: "你叫了我的名字。Petite Mignonne 現在必須更可愛地幫你推薦最強作品集證據。",
      },
    },
    {
      terms: ["ai", "ia", "openai", "chatgpt", "llm", "人工智慧", "模型"],
      responses: {
        en: "Tiny AI note: I do not use an API key yet. I am a handmade local assistant, which is why I am fast, safe for GitHub Pages, and suspiciously fond of bubble tea.",
        fr: "Note IA miniature : je n'utilise pas encore de cle API. Je suis une assistante locale faite main, rapide, compatible GitHub Pages, et tres attachee au bubble tea.",
        zh: "小小 AI 備註：我目前沒有用 API key，是手工設計的本地小助理，所以適合 GitHub Pages，也很安全，並且很愛珍奶。",
      },
    },
    {
      terms: ["paris", "france", "french", "beret", "beret", "法國", "巴黎", "貝雷帽"],
      responses: {
        en: "French signal received. Beret tilted, clipboard polished, portfolio tour ready. Adeleine's France chapter includes Grenoble Ecole de Management and Back Market.",
        fr: "Signal francais recu. Beret ajuste, clipboard pret, visite du portfolio activee. Le chapitre France d'Adeleine passe par Grenoble Ecole de Management et Back Market.",
        zh: "收到法式訊號。貝雷帽扶正，小剪貼板準備好。Adeleine 的法國篇章包含 Grenoble Ecole de Management 和 Back Market。",
      },
    },
    {
      terms: ["secret", "easter egg", "surprise", "彩蛋", "秘密", "驚喜"],
      responses: {
        en: "Secret found. Petite Mignonne's hidden KPI is making recruiters smile before they click the resume.",
        fr: "Secret trouve. Le KPI cache de Petite Mignonne est de faire sourire les recruteurs avant le clic vers le CV.",
        zh: "找到彩蛋。Petite Mignonne 的隱藏 KPI 是讓招聘方在點履歷前先微笑一下。",
      },
    },
    {
      terms: ["blackhole", "black hole", "ive", "黑洞"],
      responses: {
        en: "Blackhole mode? I can survive a pop-culture event horizon and still route you back to Adeleine's content strategy work.",
        fr: "Mode blackhole ? Je peux survivre a un horizon culturel tres dense et vous ramener vers le travail content strategy d'Adeleine.",
        zh: "Blackhole mode？我可以穿越流行文化事件視界，然後把你帶回 Adeleine 的 content strategy 證據。",
      },
    },
    {
      terms: ["seo queen", "growth queen", "女王"],
      celebrate: true,
      responses: {
        en: "Crown noted. The royal documents are: organic search share, AI-search mentions, Meta creative tests, and a very tidy resume.",
        fr: "Couronne notee. Les documents royaux : part de trafic organique, mentions AI search, tests creatives Meta et CV bien structure.",
        zh: "王冠已記錄。王室文件包括：organic search share、AI-search mentions、Meta creative tests，以及很整齊的履歷。",
      },
    },
    {
      terms: ["hello kitty", "cute", "kawaii", "可愛"],
      responses: {
        en: "Cute is a strategy when it lowers friction. Petite Mignonne says: make the interface soft, then let the proof points do the serious work.",
        fr: "Le cute peut etre une strategie quand il reduit la friction. Petite Mignonne dit : interface douce, preuves solides.",
        zh: "可愛也是策略，只要它降低互動摩擦。Petite Mignonne 說：介面柔軟一點，成果證據負責認真。",
      },
    },
  ];

  const sillyFallbacks = {
    en: [
      "Petite Mignonne tilts her beret. I cannot attach that phrase to Adeleine's resume yet, but my tiny clipboard suggests trying Talent Quiz, SEO, paid ads, or contact.",
      "My bubble tea radar made a soft little pop. That sounds outside the portfolio, but I can still guide you to Adeleine's strongest growth proof.",
      "This sentence has entered the lavender fog department. I do not have a resume match, but I do have excellent tabs for portfolio, blog, and recruiter mode.",
      "Petite Mignonne blinks twice, writes 'mysterious keyword' on the clipboard, and politely recommends asking about SEO, Meta ads, content, or AI workflows.",
      "I tried to file that under Growth Marketing, but it slipped into the pastry drawer. Try Talent Quiz if you want a useful answer with a cute hat.",
      "That is a very sparkly non-resume phrase. I am going to stand here with my tiny boba and suggest Portfolio Tour.",
      "Clipboard status: confused but charming. I can answer best about Adeleine's resume, SEO/AEO/GEO, paid ads, content strategy, AI workflows, and contact details.",
    ],
    fr: [
      "Petite Mignonne penche son beret. Je ne relie pas encore cette phrase au CV d'Adeleine, mais mon petit clipboard propose le Quiz profil, le SEO, le paid ads ou le contact.",
      "Mon radar a bubble tea vient de faire pop. Ce n'est pas vraiment dans le portfolio, mais je peux vous guider vers les meilleures preuves growth d'Adeleine.",
      "Cette phrase vient d'entrer dans le departement brouillard lavande. Pas de match CV, mais j'ai de tres bons onglets : portfolio, blog et mode recruteur.",
      "Petite Mignonne cligne des yeux, ecrit 'mot-cle mysterieux' sur son clipboard, puis recommande SEO, Meta ads, contenu ou workflows IA.",
      "J'ai essaye de classer cela dans Growth Marketing, mais c'est tombe dans le tiroir des patisseries. Essayez le Quiz profil pour une reponse utile avec un petit beret.",
      "Phrase tres brillante, mais pas tres CV. Je reste ici avec mon bubble tea miniature et je propose la visite guidee.",
      "Statut clipboard : confuse mais charmante. Je reponds mieux sur le CV, le SEO/AEO/GEO, le paid ads, la strategie contenu, les workflows IA et le contact.",
    ],
    zh: [
      "Petite Mignonne 歪了一下貝雷帽。這句暫時連不到 Adeleine 的履歷，但我的小剪貼板建議你試試 Talent Quiz、SEO、paid ads 或 contact。",
      "我的珍奶雷達發出小小 pop。這好像不在作品集範圍內，但我還是可以帶你看 Adeleine 最強的 growth 證據。",
      "這句話進入了薰衣草迷霧部門。暫時沒有履歷匹配，但我有 Portfolio、Blog 和 Recruiter Mode 可以帶路。",
      "Petite Mignonne 眨了兩下眼，把它記成「神秘關鍵字」，然後禮貌推薦你問 SEO、Meta ads、content 或 AI workflows。",
      "我試著把它歸類到 Growth Marketing，但它滑進了甜點抽屜。想要有用又可愛的答案，可以試 Talent Quiz。",
      "這是一句很閃亮但不太履歷的詞。Petite Mignonne 抱著迷你珍奶，建議你點 Portfolio Tour。",
      "剪貼板狀態：困惑但可愛。我最會回答 Adeleine 的履歷、SEO/AEO/GEO、paid ads、內容策略、AI workflows 和聯絡方式。",
    ],
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
      intent: "recruiter",
      terms: ["recruiter", "hiring", "hire", "recruteur", "recrutement", "招聘", "招募", "面試"],
    },
    {
      intent: "tour",
      terms: ["tour", "guide", "visit", "visite", "parcours", "導覽", "逛", "帶我看"],
    },
    {
      intent: "quiz",
      terms: ["quiz", "personality", "talent", "profil", "test", "測驗", "小測驗", "人才"],
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

  const getPageKind = () => {
    if (currentPath.includes("/portfolio/my-past-ad-creatives/")) {
      return "ads";
    }

    if (currentPath.includes("/cv/")) {
      return "resume";
    }

    if (currentPath.includes("/portfolio/")) {
      return "portfolio";
    }

    if (currentPath.includes("/blog/content/")) {
      return "article";
    }

    if (currentPath.includes("/blog/")) {
      return "blog";
    }

    return "home";
  };

  const getGreeting = (lang) => {
    const greetingLang = pageGreetings[lang] ? lang : "en";
    return pageGreetings[greetingLang][getPageKind()] || copy[greetingLang].greeting;
  };

  const getActionResponse = (action, lang) => {
    const responseLang = recruiterCards[lang] ? lang : "en";

    if (action === "recruiter") {
      return recruiterCards[responseLang];
    }

    if (action === "tour") {
      return tourCards[responseLang];
    }

    if (action === "quiz") {
      return quizCards[responseLang];
    }

    return copy[responseLang].fallback;
  };

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const hasTerm = (normalized, term) => {
    if (/^[a-z0-9]{1,3}$/.test(term)) {
      return new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`).test(normalized);
    }

    return normalized.includes(term);
  };

  const getEasterEgg = (message, lang) => {
    const normalized = message.toLowerCase();
    const kpopMatch = kpopEggs.find(({ terms }) =>
      terms.some((term) => hasTerm(normalized, term.toLowerCase()))
    );

    if (kpopMatch) {
      const responses = {
        en:
          `<div class="petite-chat-card"><div class="petite-chat-card-title">K-pop signal: ${kpopMatch.artist}</div><p>${kpopMatch.artist} detected. Petite Mignonne files this under ${kpopMatch.generation} trend literacy.</p><div class="petite-chat-list"><span>Representative works: ${kpopMatch.works}.</span><span>Portfolio angle: Adeleine reads pop culture like audience data, then turns it into content strategy.</span></div><div class="petite-chat-actions"><a href="/blog/">Read Blog</a><a href="/portfolio/">Portfolio</a></div></div>`,
        fr:
          `<div class="petite-chat-card"><div class="petite-chat-card-title">Signal K-pop : ${kpopMatch.artist}</div><p>${kpopMatch.artist} detecte. Petite Mignonne classe cela dans la culture trend ${kpopMatch.generation}.</p><div class="petite-chat-list"><span>Oeuvres representatives : ${kpopMatch.works}.</span><span>Angle portfolio : Adeleine lit la pop culture comme de la data audience, puis la transforme en strategie contenu.</span></div><div class="petite-chat-actions"><a href="/fr/blog/">Lire le blog</a><a href="/fr/portfolio/">Portfolio</a></div></div>`,
        zh:
          `<div class="petite-chat-card"><div class="petite-chat-card-title">K-pop 彩蛋：${kpopMatch.artist}</div><p>偵測到 ${kpopMatch.artist}。Petite Mignonne 把它歸類為 ${kpopMatch.generation} trend literacy。</p><div class="petite-chat-list"><span>代表作品：${kpopMatch.works}。</span><span>作品集角度：Adeleine 會把流行文化當成 audience signal，轉成內容策略和 growth insight。</span></div><div class="petite-chat-actions"><a href="/blog/">讀 Blog</a><a href="/portfolio/">看 Portfolio</a></div></div>`,
      };
      const responseLang = responses[lang] ? lang : "en";

      return {
        celebrate: true,
        html: responses[responseLang],
        intent: "kpop",
        lang: responseLang,
      };
    }

    const match = easterEggs.find(({ terms }) =>
      terms.some((term) => hasTerm(normalized, term.toLowerCase()))
    );

    if (!match) {
      return null;
    }

    const responseLang = match.responses[lang] ? lang : "en";
    return {
      celebrate: Boolean(match.celebrate),
      html: match.responses[responseLang],
      intent: "easter",
      lang: responseLang,
    };
  };

  const getQuizResult = (choice, lang) => {
    const responseLang = quizResults[lang] ? lang : "en";
    return quizResults[responseLang][choice] || quizCards[responseLang];
  };

  const getSillyFallback = (lang) => {
    const responseLang = sillyFallbacks[lang] ? lang : "en";
    const options = sillyFallbacks[responseLang];
    const index = Math.floor(Math.random() * options.length);
    return options[index];
  };

  const createMessage = (role, html) => {
    const message = document.createElement("div");
    message.className = `petite-chat-message petite-chat-message-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "petite-chat-bubble";

    if (role === "bot" && html.includes("petite-chat-card")) {
      bubble.classList.add("petite-chat-bubble-rich");
    }

    if (role === "user") {
      bubble.textContent = html;
    } else {
      bubble.innerHTML = html;
    }

    message.appendChild(bubble);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
  };

  const showThinking = (lang) => {
    if (typingMessage) {
      typingMessage.remove();
      typingMessage = null;
    }

    root.classList.add("is-thinking");

    const message = document.createElement("div");
    message.className = "petite-chat-message petite-chat-message-bot petite-chat-typing-message";

    const bubble = document.createElement("div");
    bubble.className = "petite-chat-bubble petite-chat-typing";
    bubble.innerHTML = `${copy[lang].thinking}<span aria-hidden="true"><i></i><i></i><i></i></span>`;

    message.appendChild(bubble);
    log.appendChild(message);
    log.scrollTop = log.scrollHeight;
    typingMessage = message;
  };

  const hideThinking = () => {
    root.classList.remove("is-thinking");

    if (typingMessage) {
      typingMessage.remove();
      typingMessage = null;
    }
  };

  const celebrateHearts = () => {
    if (celebrationTimerId) {
      window.clearTimeout(celebrationTimerId);
    }

    root.classList.add("is-celebrating");

    const burst = document.createElement("div");
    burst.className = "petite-heart-burst";
    burst.setAttribute("aria-hidden", "true");

    ["1", "2", "3", "4", "5"].forEach((index) => {
      const heart = document.createElement("span");
      heart.textContent = "♥";
      heart.style.setProperty("--heart-index", index);
      burst.appendChild(heart);
    });

    root.appendChild(burst);
    celebrationTimerId = window.setTimeout(() => {
      root.classList.remove("is-celebrating");
      burst.remove();
      celebrationTimerId = null;
    }, 1400);
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

  const readFlag = (key) => {
    try {
      return window.sessionStorage.getItem(key) === "true";
    } catch (error) {
      return false;
    }
  };

  const writeFlag = (key) => {
    try {
      window.sessionStorage.setItem(key, "true");
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

  const getResponse = (message) => {
    const lang = getLanguage(message);
    const normalized = message.toLowerCase();
    const easterEgg = getEasterEgg(message, lang);

    if (easterEgg) {
      return easterEgg;
    }

    const match = intentMap.find(({ terms }) =>
      terms.some((term) => hasTerm(normalized, term.toLowerCase()))
    );

    if (!match) {
      return { html: getSillyFallback(lang), intent: "fallback", lang };
    }

    if (match.intent === "recruiter" || match.intent === "tour" || match.intent === "quiz") {
      return {
        html: getActionResponse(match.intent, lang),
        intent: match.intent,
        lang,
      };
    }

    return {
      celebrate: match.intent === "contact",
      html: answers[lang][match.intent],
      intent: match.intent,
      lang,
    };
  };

  const queueBotResponse = (response) => {
    if (thinkingTimerId) {
      window.clearTimeout(thinkingTimerId);
      hideThinking();
    }

    showThinking(response.lang);
    thinkingTimerId = window.setTimeout(() => {
      hideThinking();
      addMessage("bot", response.html);

      if (response.celebrate) {
        celebrateHearts();
      }

      thinkingTimerId = null;
    }, thinkingDelayMs);
  };

  const sendMessage = (message) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    addMessage("user", trimmed);
    queueBotResponse(getResponse(trimmed));
  };

  const sendAction = (action, label) => {
    const lang = pageLang === "fr" ? "fr" : "en";

    addMessage("user", label);
    queueBotResponse({
      html: getActionResponse(action, lang),
      intent: action,
      lang,
    });
  };

  const sendQuizResult = (choice, label) => {
    const lang = pageLang === "fr" ? "fr" : "en";

    addMessage("user", label);
    queueBotResponse({
      html: getQuizResult(choice, lang),
      intent: "quiz-result",
      lang,
    });
  };

  const openChat = (options = {}) => {
    const { focusInput = true, markAutoOpened = true } = options;

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

    if (markAutoOpened) {
      writeFlag(autoOpenKey);
    }

    if (focusInput) {
      window.setTimeout(() => input.focus(), 80);
    }
  };

  const closeChat = () => {
    writeFlag(dismissedKey);
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

    addMessage("bot", getGreeting(lang));
  };

  const scheduleAutoOpen = () => {
    if (readFlag(autoOpenKey) || readFlag(dismissedKey)) {
      return;
    }

    window.setTimeout(() => {
      if (root.classList.contains("is-open") || readFlag(dismissedKey)) {
        return;
      }

      openChat({ focusInput: false });
    }, autoOpenDelayMs);
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

  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      sendAction(button.dataset.petiteAction, button.textContent);
      input.value = "";
    });
  });

  log.addEventListener("click", (event) => {
    const quizButton = event.target.closest("[data-petite-quiz]");

    if (!quizButton) {
      return;
    }

    sendQuizResult(quizButton.dataset.petiteQuiz, quizButton.textContent);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) {
      closeChat();
    }
  });

  hydrate();
  scheduleAutoOpen();
})();
