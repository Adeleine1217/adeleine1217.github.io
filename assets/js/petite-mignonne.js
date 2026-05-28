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

  const animeEggs = [
    { terms: ["進擊的巨人", "attack on titan", "aot", "shingeki", "eren", "mikasa", "levi"], title: "Attack on Titan", era: "dark epic classic", works: "The Fall of Shiganshina, Return to Shiganshina, The Final Season", mood: "Adeleine's favorite. Petite Mignonne lowers her tiny voice: this is serious emotional architecture.", moodFr: "Un favori d'Adeleine. Petite Mignonne baisse la voix : architecture emotionnelle tres serieuse.", moodZh: "Adeleine's favorite。Petite Mignonne 壓低聲音：這是很嚴肅的情緒建築。" },
    { terms: ["獵人獵人", "hunter x hunter", "hunter hunter", "hxh", "gon", "killua", "kurapika", "hisoka"], title: "Hunter x Hunter", era: "adventure masterpiece", works: "Hunter Exam, Yorknew City, Greed Island, Chimera Ant, Election Arc", mood: "Adeleine's favorite favorite. Clipboard note: genius power system, devastating feelings, elite taste.", moodFr: "Le favori favori d'Adeleine. Note clipboard : systeme de pouvoir genial, emotions devastatrices, gout tres sur.", moodZh: "Adeleine's favorite favorite。剪貼板備註：神級能力系統、情緒暴擊、品味滿分。" },
    { terms: ["海賊王", "one piece", "luffy", "zoro", "nami", "sanji", "wano", "egghead"], title: "One Piece", era: "long-running shonen legend", works: "East Blue, Alabasta, Enies Lobby, Marineford, Wano, Egghead", mood: "Petite Mignonne salutes the straw hat and files this under long-term brand worldbuilding.", moodFr: "Petite Mignonne salue le chapeau de paille et classe cela dans le worldbuilding de marque tres long terme.", moodZh: "Petite Mignonne 向草帽敬禮：這是長期品牌世界觀經營的教科書。" },
    { terms: ["火影", "naruto", "shippuden", "sasuke", "sakura", "kakashi"], title: "Naruto", era: "shonen classic", works: "Chunin Exams, Sasuke Retrieval, Pain Arc, Fourth Shinobi War", mood: "Petite Mignonne writes: strong character arcs, iconic rivalry, very high headband energy.", moodFr: "Petite Mignonne note : arcs personnages forts, rivalite iconique, energie bandeau ninja maximale.", moodZh: "Petite Mignonne 記下：角色弧線很強、宿敵感經典、護額能量極高。" },
    { terms: ["咒術迴戰", "jujutsu kaisen", "jjk", "gojo", "sukuna", "itadori", "megumi", "nobara"], title: "Jujutsu Kaisen", era: "2020s dark shonen", works: "Season 1, Jujutsu Kaisen 0, Shibuya Incident, Hidden Inventory", mood: "I hate this, respectfully. Petite Mignonne has filed emotional damages paperwork but admits the cultural signal is enormous.", moodFr: "Je deteste ca, avec respect. Petite Mignonne a rempli un dossier de dommages emotionnels, mais reconnait le signal culturel enorme.", moodZh: "I hate this（尊重地）。Petite Mignonne 已經提交情緒損害文件，但承認它的文化訊號很巨大。" },
    { terms: ["fate", "fate stay night", "fate/stay night", "unlimited blade works", "ubw", "heaven's feel", "heavens feel", "fate zero", "fate/zero", "fate apocrypha", "fate/apocrypha", "fate extra", "last encore", "fate grand order", "fgo", "babylonia", "camelot", "solomon", "prisma illya", "kaleid", "el-melloi", "elmelloi", "emiya family", "carnival phantasm", "grand carnival", "strange fake", "saber", "rin tohsaka", "archer", "gilgamesh"], title: "Fate series", era: "Type-Moon multiverse", works: "Fate/stay night, Unlimited Blade Works, Heaven's Feel, Fate/Zero, Apocrypha, EXTRA Last Encore, Grand Order First Order/Camelot/Babylonia/Solomon, Prisma Illya, Lord El-Melloi II's Case Files, Today's Menu for the Emiya Family, Carnival Phantasm, Grand Carnival, strange Fake", mood: "Petite Mignonne opens a sacred spreadsheet. Fate is not a watch order, it is a labyrinth with excellent capes.", moodFr: "Petite Mignonne ouvre un tableur sacre. Fate n'est pas un ordre de visionnage, c'est un labyrinthe avec de tres belles capes.", moodZh: "Petite Mignonne 打開神聖試算表。Fate 不是觀看順序，是一座披風很好看的迷宮。" },
    { terms: ["demon slayer", "鬼滅", "鬼滅之刃", "kimetsu", "tanjiro", "nezuko"], title: "Demon Slayer", era: "2019-2020s mainstream phenomenon", works: "Mugen Train, Entertainment District, Swordsmith Village, Hashira Training, Infinity Castle", mood: "Petite Mignonne tags this as visual spectacle plus mass-market emotional clarity.", moodFr: "Petite Mignonne classe cela comme spectacle visuel et clarte emotionnelle grand public.", moodZh: "Petite Mignonne 標註：視覺奇觀＋大眾情緒敘事清楚。" },
    { terms: ["spy x family", "spy family", "anya", "yor", "loid", "間諜家家酒"], title: "Spy x Family", era: "2022 comfort hit", works: "Season 1, Season 2, Code: White", mood: "Petite Mignonne approves the family branding. It is espionage, but make it cozy.", moodFr: "Petite Mignonne approuve le branding familial. Espionnage, mais version cosy.", moodZh: "Petite Mignonne 認可這個家庭品牌定位：諜報，但很暖。" },
    { terms: ["chainsaw man", "鏈鋸人", "denji", "power", "makima", "reze"], title: "Chainsaw Man", era: "2022 antihero boom", works: "Season 1, Reze Arc", mood: "Petite Mignonne puts on safety goggles and calls this chaotic desire with premium cinematic framing.", moodFr: "Petite Mignonne met des lunettes de protection : desir chaotique, cadrage cinema premium.", moodZh: "Petite Mignonne 戴上護目鏡：混亂慾望，但電影感很高級。" },
    { terms: ["frieren", "葬送的芙莉蓮", "sousou no frieren", "fern", "stark"], title: "Frieren: Beyond Journey's End", era: "2023-2026 prestige fantasy", works: "Beyond Journey's End, First-Class Mage Exam, season 2 announced for 2026", mood: "Petite Mignonne whispers: quiet storytelling, huge emotional ROI.", moodFr: "Petite Mignonne murmure : narration calme, ROI emotionnel immense.", moodZh: "Petite Mignonne 小聲說：安靜敘事，情緒 ROI 超高。" },
    { terms: ["oshi no ko", "我推的孩子", "推しの子", "ai hoshino", "hoshino ai", "aqua", "ruby"], title: "Oshi no Ko", era: "2023 idol-media critique", works: "Season 1, Season 2, IDOL", mood: "Petite Mignonne sees idol branding, media systems, and trauma in a glittery folder.", moodFr: "Petite Mignonne voit branding idol, systemes media et trauma dans un dossier paillete.", moodZh: "Petite Mignonne 看見 idol branding、media system 和閃亮外殼下的創傷。" },
    { terms: ["blue lock", "藍色監獄", "isagi", "nagi", "bachira"], title: "Blue Lock", era: "2022 sports ego era", works: "Season 1, Episode Nagi, season 2", mood: "Petite Mignonne marks this as personal branding, but with football and very intense eye contact.", moodFr: "Petite Mignonne classe cela comme personal branding, mais avec football et regards tres intenses.", moodZh: "Petite Mignonne 標註：這是個人品牌，只是包裝成足球和超強眼神。" },
    { terms: ["bocchi", "bocchi the rock", "孤獨搖滾", "hitori gotoh"], title: "Bocchi the Rock!", era: "2022 music-comedy breakout", works: "Season 1, Kessoku Band songs", mood: "Petite Mignonne hides behind the clipboard in solidarity, then recommends publishing anyway.", moodFr: "Petite Mignonne se cache derriere son clipboard par solidarite, puis recommande de publier quand meme.", moodZh: "Petite Mignonne 躲到剪貼板後面表示共鳴，然後建議：害怕也要發布。" },
    { terms: ["solo leveling", "我獨自升級", "俺だけレベルアップ", "sung jinwoo", "jinwoo"], title: "Solo Leveling", era: "2024 power fantasy", works: "Season 1, Arise from the Shadow", mood: "Petite Mignonne writes: leveling system, clean hooks, very obvious acquisition funnel energy.", moodFr: "Petite Mignonne note : systeme de niveaux, hooks clairs, energie funnel d'acquisition evidente.", moodZh: "Petite Mignonne 記下：升級系統、hook 清楚、很有 acquisition funnel 感。" },
    { terms: ["delicious in dungeon", "dungeon meshi", "迷宮飯", "laios", "marcille"], title: "Delicious in Dungeon", era: "2024 fantasy-food hit", works: "Season 1, season 2 announced", mood: "Petite Mignonne respects any story that turns a dungeon into meal planning and brand differentiation.", moodFr: "Petite Mignonne respecte toute histoire qui transforme un donjon en meal planning et differentiation de marque.", moodZh: "Petite Mignonne 尊敬把迷宮變成菜單和差異化定位的故事。" },
    { terms: ["dandadan", "dan da dan", "膽大黨", "momo ayase", "okarun"], title: "DAN DA DAN", era: "2024 supernatural chaos", works: "Season 1, season 2 planned", mood: "Petite Mignonne labels this: maximum chaos, excellent hook velocity.", moodFr: "Petite Mignonne etiquete : chaos maximal, vitesse de hook excellente.", moodZh: "Petite Mignonne 標籤：最大混亂、hook 速度極佳。" },
    { terms: ["kaiju no 8", "怪獸8號", "怪獸 8 號", "kafka hibino"], title: "Kaiju No. 8", era: "2024 kaiju workplace shonen", works: "Season 1, season 2", mood: "Petite Mignonne likes the career-change arc. Monster cleanup to hero pipeline: honestly relatable.", moodFr: "Petite Mignonne aime l'arc reconversion. Du nettoyage de monstres au hero pipeline : assez relatable.", moodZh: "Petite Mignonne 喜歡這個轉職弧線。怪獸清潔到英雄 pipeline：很合理。" },
    { terms: ["apothecary diaries", "藥屋少女", "kusuriya", "maomao", "貓貓"], title: "The Apothecary Diaries", era: "2023-2025 mystery hit", works: "Season 1, Season 2", mood: "Petite Mignonne admires Maomao's research workflow. Very strong investigation funnel.", moodFr: "Petite Mignonne admire le workflow recherche de Maomao. Tres bon funnel d'investigation.", moodZh: "Petite Mignonne 欣賞貓貓的研究流程：很強的 investigation funnel。" },
    { terms: ["mashle", "マッシュル", "mash burnedead", "bling-bang-bang-born"], title: "Mashle", era: "2023 magic gym comedy", works: "Season 1, Season 2, Bling-Bang-Bang-Born", mood: "Petite Mignonne files this under cream puffs, muscles, and wildly effective audio virality.", moodFr: "Petite Mignonne classe cela sous choux a la creme, muscles et viralite audio tres efficace.", moodZh: "Petite Mignonne 歸類：泡芙、肌肉、以及非常有效的音訊病毒傳播。" },
    { terms: ["my dress-up darling", "dress up darling", "更衣人偶", "marin kitagawa"], title: "My Dress-Up Darling", era: "2022 cosplay romance", works: "Season 1, season 2 announced", mood: "Petite Mignonne sees niche passion, visual identity, and creator economy sparkle.", moodFr: "Petite Mignonne voit passion de niche, identite visuelle et etincelles creator economy.", moodZh: "Petite Mignonne 看見 niche passion、visual identity 和 creator economy 閃光。" },
    { terms: ["skip and loafer", "躍動青春", "mitsumi"], title: "Skip and Loafer", era: "2023 slice-of-life gem", works: "Season 1", mood: "Petite Mignonne says: soft social intelligence, very good onboarding energy.", moodFr: "Petite Mignonne dit : intelligence sociale douce, tres bonne energie d'onboarding.", moodZh: "Petite Mignonne 說：柔軟社交智慧，很好的 onboarding energy。" },
    { terms: ["heavenly delusion", "天國大魔境", "tengoku daimakyo"], title: "Heavenly Delusion", era: "2023 mystery sci-fi", works: "Season 1", mood: "Petite Mignonne opens the mystery folder and immediately adds three question marks.", moodFr: "Petite Mignonne ouvre le dossier mystere et ajoute immediatement trois points d'interrogation.", moodZh: "Petite Mignonne 打開神秘資料夾，立刻加上三個問號。" },
    { terms: ["cyberpunk edgerunners", "edgerunners", "邊緣行者", "lucy", "david martinez"], title: "Cyberpunk: Edgerunners", era: "2022 game-anime crossover", works: "Season 1, I Really Want to Stay at Your House", mood: "Petite Mignonne says this is cross-media positioning with emotional damage included.", moodFr: "Petite Mignonne dit : positionnement cross-media avec dommages emotionnels inclus.", moodZh: "Petite Mignonne 說：這是 cross-media positioning，附贈情緒傷害。" },
    { terms: ["eizouken", "映像研", "keep your hands off eizouken", "asakusa"], title: "Keep Your Hands Off Eizouken!", era: "2020 creator-energy gem", works: "Season 1", mood: "Petite Mignonne stamps this as pure creative operations: imagination, production limits, and pitch decks with soul.", moodFr: "Petite Mignonne tamponne cela comme operations creatives pures : imagination, contraintes de production et pitch decks avec ame.", moodZh: "Petite Mignonne 蓋章：這是純 creative operations，想像力、製作限制、還有有靈魂的 pitch deck。" },
    { terms: ["great pretender", "詐欺之王"], title: "Great Pretender", era: "2020 stylish original", works: "Los Angeles Connection, Singapore Sky, Snow of London, Wizard of Far East", mood: "Petite Mignonne notes: color, confidence, and very stylish repositioning.", moodFr: "Petite Mignonne note : couleur, confiance et repositionnement tres style.", moodZh: "Petite Mignonne 記下：色彩、自信、非常有型的 repositioning。" },
    { terms: ["akudama drive", "惡玉drive", "akudama"], title: "Akudama Drive", era: "2020 neon action original", works: "Season 1", mood: "Petite Mignonne files this under neon chaos and clean archetype marketing.", moodFr: "Petite Mignonne classe cela sous chaos neon et marketing d'archetypes tres net.", moodZh: "Petite Mignonne 歸類：霓虹混亂，以及很乾淨的 archetype marketing。" },
    { terms: ["tower of god", "神之塔", "kami no tou", "bam", "khun"], title: "Tower of God", era: "2020 webtoon-to-anime wave", works: "Season 1, Return of the Prince", mood: "Petite Mignonne marks this as platform-native IP expansion with climbing anxiety.", moodFr: "Petite Mignonne note : expansion IP platform-native avec anxiete d'ascension.", moodZh: "Petite Mignonne 標註：平台原生 IP 擴張，加上爬塔焦慮。" },
    { terms: ["god of high school", "高校之神", "god high school"], title: "The God of High School", era: "2020 webtoon action wave", works: "Season 1", mood: "Petite Mignonne writes: fast tournament hook, high kinetic packaging.", moodFr: "Petite Mignonne ecrit : hook tournoi rapide, packaging cinetique intense.", moodZh: "Petite Mignonne 寫下：快速 tournament hook，高動能包裝。" },
    { terms: ["86", "eighty six", "eighty-six", "辛耶", "vladilena"], title: "86", era: "2021 sci-fi war drama", works: "Season 1, Part 2", mood: "Petite Mignonne marks this as brutal systems storytelling with excellent emotional pacing.", moodFr: "Petite Mignonne note : storytelling de systemes brutal, pacing emotionnel excellent.", moodZh: "Petite Mignonne 標註：殘酷系統敘事，情緒節奏很好。" },
    { terms: ["vivy", "fluorite eye", "薇薇"], title: "Vivy: Fluorite Eye's Song", era: "2021 AI idol sci-fi", works: "Fluorite Eye's Song", mood: "Petite Mignonne perks up: AI, music, identity, and mission-driven positioning.", moodFr: "Petite Mignonne reagit : IA, musique, identite et positionnement mission-driven.", moodZh: "Petite Mignonne 立刻精神：AI、音樂、身份認同、mission-driven positioning。" },
    { terms: ["odd taxi", "oddtaxi", "奇巧計程車"], title: "ODDTAXI", era: "2021 mystery original", works: "TV series, In the Woods", mood: "Petite Mignonne loves a clean mystery funnel. Every detail has a job.", moodFr: "Petite Mignonne aime un funnel mystere bien propre. Chaque detail a une mission.", moodZh: "Petite Mignonne 喜歡乾淨的 mystery funnel：每個細節都有工作。" },
    { terms: ["wonder egg priority", "奇蛋物語", "wonder egg"], title: "Wonder Egg Priority", era: "2021 original drama", works: "TV series", mood: "Petite Mignonne attaches a fragile label: striking visuals, difficult feelings, complicated discourse.", moodFr: "Petite Mignonne colle une etiquette fragile : visuels forts, emotions difficiles, discours complique.", moodZh: "Petite Mignonne 貼上易碎標籤：視覺強、情緒難、討論很複雜。" },
    { terms: ["mushoku tensei", "無職轉生", "jobless reincarnation", "rudeus"], title: "Mushoku Tensei", era: "2021 isekai prestige", works: "Season 1, Season 2", mood: "Petite Mignonne files this under worldbuilding depth and very complicated protagonist discourse.", moodFr: "Petite Mignonne classe cela sous profondeur worldbuilding et discours protagoniste tres complique.", moodZh: "Petite Mignonne 歸類：世界觀深度，以及非常複雜的主角討論。" },
    { terms: ["komi", "komi can't communicate", "古見同學", "komi san"], title: "Komi Can't Communicate", era: "2021 school comedy", works: "Season 1, Season 2", mood: "Petite Mignonne writes: social anxiety, charming interface, strong micro-interactions.", moodFr: "Petite Mignonne ecrit : anxiete sociale, interface charmante, micro-interactions fortes.", moodZh: "Petite Mignonne 寫下：社交焦慮、迷人介面、micro-interactions 很強。" },
    { terms: ["ranking of kings", "王様ランキング", "國王排名", "osama ranking", "bojji"], title: "Ranking of Kings", era: "2021 storybook fantasy", works: "Season 1, Treasure Chest of Courage", mood: "Petite Mignonne waves a tiny flag for gentle courage and deceptively sharp storytelling.", moodFr: "Petite Mignonne agite un petit drapeau pour le courage doux et la narration faussement simple.", moodZh: "Petite Mignonne 揮小旗：溫柔勇氣，加上看似簡單但很銳利的敘事。" },
    { terms: ["to your eternity", "不滅的你", "fushi"], title: "To Your Eternity", era: "2021 emotional fantasy", works: "Season 1, Season 2, Season 3 announced", mood: "Petite Mignonne prepares tissues and writes: retention through emotional transformation.", moodFr: "Petite Mignonne prepare les mouchoirs : retention par transformation emotionnelle.", moodZh: "Petite Mignonne 準備衛生紙：透過情緒轉化做 retention。" },
    { terms: ["tokyo revengers", "東京復仇者", "takemichi", "mikey"], title: "Tokyo Revengers", era: "2021 delinquent time-loop hit", works: "Season 1, Christmas Showdown, Tenjiku Arc", mood: "Petite Mignonne notes: time travel, gangs, and extremely complicated calendar management.", moodFr: "Petite Mignonne note : voyage temporel, gangs et gestion de calendrier tres compliquee.", moodZh: "Petite Mignonne 記下：時間旅行、不良少年，以及非常複雜的行程管理。" },
    { terms: ["lycoris recoil", "莉可麗絲", "chisato", "takina"], title: "Lycoris Recoil", era: "2022 original action hit", works: "Season 1, Friends are thieves of time", mood: "Petite Mignonne sees contrast branding: cute cafe surface, action engine underneath.", moodFr: "Petite Mignonne voit un branding de contraste : cafe mignon en surface, moteur action dessous.", moodZh: "Petite Mignonne 看見反差品牌：表面可愛咖啡廳，底層 action engine。" },
    { terms: ["hell's paradise", "hells paradise", "地獄樂", "gabimaru"], title: "Hell's Paradise", era: "2023 dark action", works: "Season 1, season 2 planned", mood: "Petite Mignonne files this under survival aesthetics and ominous botany.", moodFr: "Petite Mignonne classe cela sous esthetique de survie et botanique inquietante.", moodZh: "Petite Mignonne 歸類：生存美學，以及很不妙的植物學。" },
    { terms: ["zom 100", "zom100", "殭屍百分百", "zombie 100"], title: "Zom 100: Bucket List of the Dead", era: "2023 workplace escape comedy", works: "Season 1", mood: "Petite Mignonne notes: burnout insight, bright color, and anti-corporate wish fulfillment.", moodFr: "Petite Mignonne note : insight burnout, couleurs vives et wish fulfillment anti-corporate.", moodZh: "Petite Mignonne 記下：burnout insight、亮色視覺、反職場願望滿足。" },
    { terms: ["pluto", "浦澤直樹 pluto", "atom"], title: "PLUTO", era: "2023 prestige sci-fi adaptation", works: "Netflix series", mood: "Petite Mignonne opens a serious folder: grief, memory, and premium adaptation strategy.", moodFr: "Petite Mignonne ouvre un dossier serieux : deuil, memoire et strategie d'adaptation premium.", moodZh: "Petite Mignonne 打開嚴肅資料夾：悲傷、記憶、premium adaptation strategy。" },
    { terms: ["trigun stampede", "vash"], title: "Trigun Stampede", era: "2023 reboot", works: "Season 1, Stargaze continuation", mood: "Petite Mignonne labels it: legacy IP, new visual language, risky but interesting repositioning.", moodFr: "Petite Mignonne etiquete : IP heritage, nouveau langage visuel, repositionnement risque mais interessant.", moodZh: "Petite Mignonne 標籤：legacy IP、新視覺語言、有風險但有趣的 repositioning。" },
    { terms: ["my happy marriage", "我的幸福婚約", "watashi no shiawase"], title: "My Happy Marriage", era: "2023 romance fantasy", works: "Season 1, Season 2", mood: "Petite Mignonne writes: soft luxury, emotional recovery, strong romance packaging.", moodFr: "Petite Mignonne ecrit : luxe doux, reconstruction emotionnelle, packaging romance fort.", moodZh: "Petite Mignonne 寫下：soft luxury、情緒修復、romance packaging 很強。" },
    { terms: ["wind breaker", "windbreaker", "防風少年", "sakura haruka"], title: "Wind Breaker", era: "2024 delinquent action", works: "Season 1, season 2", mood: "Petite Mignonne notes community positioning, school territory branding, and good jackets.", moodFr: "Petite Mignonne note : positionnement communaute, branding de territoire scolaire et bonnes vestes.", moodZh: "Petite Mignonne 記下：community positioning、校園地盤品牌、還有外套很好看。" },
    { terms: ["a sign of affection", "指尖相觸戀戀不捨", "yubisaki to renren"], title: "A Sign of Affection", era: "2024 romance", works: "Season 1", mood: "Petite Mignonne sees communication design, intimacy, and accessible emotional storytelling.", moodFr: "Petite Mignonne voit design de communication, intimite et storytelling emotionnel accessible.", moodZh: "Petite Mignonne 看見 communication design、親密感、易懂的情緒敘事。" },
    { terms: ["girls band cry", "ガールズバンドクライ", "gbc"], title: "Girls Band Cry", era: "2024 music drama", works: "Season 1", mood: "Petite Mignonne turns up the tiny speaker: raw emotion, music branding, fandom ignition.", moodFr: "Petite Mignonne monte le mini haut-parleur : emotion brute, branding musical, ignition fandom.", moodZh: "Petite Mignonne 調高迷你喇叭：原始情緒、音樂 branding、fandom 點火。" },
    { terms: ["jellyfish can't swim", "夜晚的水母", "yoru no kurage"], title: "Jellyfish Can't Swim in the Night", era: "2024 creator-girl original", works: "Season 1", mood: "Petite Mignonne tags this as creator identity, anonymous publishing, and soft neon strategy.", moodFr: "Petite Mignonne classe cela sous identite createur, publication anonyme et strategie neon douce.", moodZh: "Petite Mignonne 標註：creator identity、匿名發布、soft neon strategy。" },
    { terms: ["orb", "chi chikyuu", "地球的運動", "地動說"], title: "Orb: On the Movements of the Earth", era: "2024-2025 historical drama", works: "TV anime", mood: "Petite Mignonne notes: ideas as risk, knowledge as rebellion, extremely good thought leadership energy.", moodFr: "Petite Mignonne note : idees comme risque, savoir comme rebellion, tres bonne energie thought leadership.", moodZh: "Petite Mignonne 記下：思想即風險、知識即反抗，非常 thought leadership。" },
    { terms: ["gachiakuta", "ガチアクタ"], title: "Gachiakuta", era: "2025 action debut", works: "TV anime debut", mood: "Petite Mignonne marks this as gritty new-gen energy with a strong visual hook.", moodFr: "Petite Mignonne note : energie new-gen brute avec hook visuel fort.", moodZh: "Petite Mignonne 標註：粗礪新世代能量，視覺 hook 很強。" },
    { terms: ["sakamoto days", "坂本日常", "sakamoto"], title: "Sakamoto Days", era: "2025 action comedy", works: "TV anime debut", mood: "Petite Mignonne likes the premise: retired legend, retail operations, very unusual customer journey.", moodFr: "Petite Mignonne aime le premise : legende retraitee, operations retail, parcours client tres inhabituel.", moodZh: "Petite Mignonne 喜歡這個 premise：退休傳奇、零售營運、非常不尋常的 customer journey。" },
    { terms: ["witch hat atelier", "とんがり帽子", "魔法帽的工作室"], title: "Witch Hat Atelier", era: "2025 fantasy adaptation", works: "TV anime adaptation", mood: "Petite Mignonne sharpens a tiny pencil: craft, wonder, and visual identity are doing the work.", moodFr: "Petite Mignonne taille un mini crayon : craft, merveille et identite visuelle font le travail.", moodZh: "Petite Mignonne 削尖迷你鉛筆：craft、wonder、visual identity 都在工作。" },
    { terms: ["lazarus", "ラザロ", "shinichiro watanabe"], title: "Lazarus", era: "2025 original sci-fi action", works: "TV anime", mood: "Petite Mignonne puts this under prestige creator signal and stylish movement.", moodFr: "Petite Mignonne classe cela sous signal createur prestige et mouvement style.", moodZh: "Petite Mignonne 歸類：prestige creator signal，以及很有型的 movement。" },
    { terms: ["takopi", "takopi's original sin", "章魚嗶", "タコピー"], title: "Takopi's Original Sin", era: "2025 drama adaptation", works: "TV anime adaptation", mood: "Petite Mignonne puts a soft warning label on the folder: cute design, heavy feelings.", moodFr: "Petite Mignonne colle une etiquette prudente : design mignon, emotions lourdes.", moodZh: "Petite Mignonne 貼上柔軟警告：畫風可愛，情緒很重。" },
    { terms: ["medalist", "メダリスト", "tsukasa akeura"], title: "Medalist", era: "2025 sports drama", works: "TV anime, season 2 announced", mood: "Petite Mignonne notes: aspiration, coaching, and performance storytelling with sparkle.", moodFr: "Petite Mignonne note : aspiration, coaching et narration performance avec etincelles.", moodZh: "Petite Mignonne 記下：aspiration、coaching、帶閃光的 performance storytelling。" },
    { terms: ["fragrant flower", "薰香花朵", "kaoru hana", "the fragrant flower blooms with dignity"], title: "The Fragrant Flower Blooms with Dignity", era: "2025 romance", works: "TV anime adaptation", mood: "Petite Mignonne marks this as soft romance positioning with strong character warmth.", moodFr: "Petite Mignonne note : positionnement romance douce avec chaleur personnage forte.", moodZh: "Petite Mignonne 標註：soft romance positioning，角色溫度很強。" },
    { terms: ["witch watch", "魔女守護者"], title: "Witch Watch", era: "2025 comedy fantasy", works: "TV anime adaptation", mood: "Petite Mignonne files this under comedy timing, magic hooks, and flexible ensemble energy.", moodFr: "Petite Mignonne classe cela sous timing comique, hooks magiques et energie ensemble flexible.", moodZh: "Petite Mignonne 歸類：comedy timing、magic hooks、ensemble energy。" },
    { terms: ["uma musume cinderella gray", "cinderella gray", "賽馬娘 灰髮灰姑娘"], title: "Uma Musume: Cinderella Gray", era: "2025 sports-idol spin-off", works: "TV anime adaptation", mood: "Petite Mignonne notes: sports narrative, idol mechanics, and character-brand compounding.", moodFr: "Petite Mignonne note : narration sportive, mecanique idol et accumulation character-brand.", moodZh: "Petite Mignonne 記下：sports narrative、idol mechanics、character-brand compounding。" },
    { terms: ["the summer hikaru died", "光が死んだ夏", "光死去的夏天", "hikaru ga shinda natsu"], title: "The Summer Hikaru Died", era: "2025 horror drama", works: "TV anime adaptation", mood: "Petite Mignonne slowly closes the curtain. Rural horror, identity tension, very sticky premise.", moodFr: "Petite Mignonne ferme doucement le rideau. Horreur rurale, tension identitaire, premise tres collant.", moodZh: "Petite Mignonne 慢慢拉上窗簾：鄉村恐怖、身份張力、premise 很黏。" },
    { terms: ["ghost in the shell 2026", "攻殼機動隊 2026", "the ghost in the shell"], title: "The Ghost in the Shell", era: "2026 sci-fi return", works: "Science SARU TV anime project", mood: "Petite Mignonne opens the cyber folder: identity, networks, and future-facing brand memory.", moodFr: "Petite Mignonne ouvre le dossier cyber : identite, reseaux et memoire de marque tournee vers le futur.", moodZh: "Petite Mignonne 打開 cyber 資料夾：身份、網路、未來感品牌記憶。" },
    { terms: ["fire force season 3", "炎炎消防隊 三期", "fire force"], title: "Fire Force", era: "2025-2026 returning action", works: "Season 3 split cour", mood: "Petite Mignonne notes: flame visuals, squad branding, and very loud kinetic energy.", moodFr: "Petite Mignonne note : visuels de flammes, branding d'equipe et energie cinetique tres forte.", moodZh: "Petite Mignonne 記下：火焰視覺、小隊 branding、動能非常大。" },
    { terms: ["chainsaw man reze", "reze movie", "蕾潔篇"], title: "Chainsaw Man: Reze Arc", era: "2025 film arc", works: "Reze Arc movie", mood: "Petite Mignonne marks this as romance, danger, and campaign-level anticipation.", moodFr: "Petite Mignonne classe cela sous romance, danger et anticipation niveau campagne.", moodZh: "Petite Mignonne 標註：浪漫、危險，以及 campaign 等級期待值。" },
    { terms: ["my hero academia final", "mha final", "hero academia final", "我的英雄學院 final"], title: "My Hero Academia Final Season", era: "2025 finale era", works: "Final Season", mood: "Petite Mignonne writes: long-running IP closure, fandom memory, and finale positioning.", moodFr: "Petite Mignonne note : cloture d'IP longue, memoire fandom et positionnement de final.", moodZh: "Petite Mignonne 記下：長篇 IP 收束、fandom memory、finale positioning。" },
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
      "Petite Mignonne consults the moon, the straw, and the clipboard. None of them know what that means, but all three recommend the portfolio.",
      "I placed that phrase in a tiny velvet box labeled 'interesting but not actionable'. Would you like SEO proof or anime chaos instead?",
      "A small lavender loading cloud appeared over my beret. Translation: I need a more portfolio-shaped question.",
      "This keyword has no badge, no funnel, no landing page, and yet it has confidence. Petite Mignonne respects that.",
      "I cannot connect this to Adeleine's career yet, but I can offer a tiny menu: Recruiter Mode, Talent Quiz, K-pop signal, anime signal.",
      "The clipboard has drawn a heart and a question mark. That usually means: ask me about content strategy.",
      "That phrase wandered into the wrong tab wearing sunglasses. I gently redirected it toward Portfolio Tour.",
      "Petite Mignonne has briefly become a teacup. Please try again with SEO, paid ads, AI workflows, or anime.",
      "No resume match, but the vibes are wearing a beret. I can turn useful again very quickly.",
      "I filed this under 'mystic snack energy'. For actual proof, ask me about Adeleine's results.",
    ],
    fr: [
      "Petite Mignonne penche son beret. Je ne relie pas encore cette phrase au CV d'Adeleine, mais mon petit clipboard propose le Quiz profil, le SEO, le paid ads ou le contact.",
      "Mon radar a bubble tea vient de faire pop. Ce n'est pas vraiment dans le portfolio, mais je peux vous guider vers les meilleures preuves growth d'Adeleine.",
      "Cette phrase vient d'entrer dans le departement brouillard lavande. Pas de match CV, mais j'ai de tres bons onglets : portfolio, blog et mode recruteur.",
      "Petite Mignonne cligne des yeux, ecrit 'mot-cle mysterieux' sur son clipboard, puis recommande SEO, Meta ads, contenu ou workflows IA.",
      "J'ai essaye de classer cela dans Growth Marketing, mais c'est tombe dans le tiroir des patisseries. Essayez le Quiz profil pour une reponse utile avec un petit beret.",
      "Phrase tres brillante, mais pas tres CV. Je reste ici avec mon bubble tea miniature et je propose la visite guidee.",
      "Statut clipboard : confuse mais charmante. Je reponds mieux sur le CV, le SEO/AEO/GEO, le paid ads, la strategie contenu, les workflows IA et le contact.",
      "Petite Mignonne consulte la lune, la paille et le clipboard. Personne ne comprend, mais tout le monde recommande le portfolio.",
      "J'ai range cette phrase dans une petite boite en velours marquee 'interessant mais pas actionnable'. Voulez-vous une preuve SEO ou un chaos anime ?",
      "Un petit nuage lavande apparait au-dessus de mon beret. Traduction : il me faut une question plus portfolio-compatible.",
      "Ce mot-cle n'a ni badge, ni funnel, ni landing page, mais il a beaucoup de confiance. Petite Mignonne respecte.",
      "Je ne relie pas encore cela a la carriere d'Adeleine, mais menu miniature : Mode recruteur, Quiz profil, signal K-pop, signal anime.",
      "Le clipboard vient de dessiner un coeur et un point d'interrogation. Cela veut souvent dire : demandez-moi la strategie contenu.",
      "Cette phrase est entree dans le mauvais onglet avec des lunettes de soleil. Je la redirige doucement vers la visite guidee.",
      "Petite Mignonne est devenue une tasse de the pendant trois secondes. Essayez SEO, paid ads, workflows IA ou anime.",
      "Pas de match CV, mais les vibes portent un beret. Je peux redevenir utile tres vite.",
      "Je classe cela sous 'energie snack mystique'. Pour les preuves concretes, demandez les resultats d'Adeleine.",
    ],
    zh: [
      "Petite Mignonne 歪了一下貝雷帽。這句暫時連不到 Adeleine 的履歷，但我的小剪貼板建議你試試 Talent Quiz、SEO、paid ads 或 contact。",
      "我的珍奶雷達發出小小 pop。這好像不在作品集範圍內，但我還是可以帶你看 Adeleine 最強的 growth 證據。",
      "這句話進入了薰衣草迷霧部門。暫時沒有履歷匹配，但我有 Portfolio、Blog 和 Recruiter Mode 可以帶路。",
      "Petite Mignonne 眨了兩下眼，把它記成「神秘關鍵字」，然後禮貌推薦你問 SEO、Meta ads、content 或 AI workflows。",
      "我試著把它歸類到 Growth Marketing，但它滑進了甜點抽屜。想要有用又可愛的答案，可以試 Talent Quiz。",
      "這是一句很閃亮但不太履歷的詞。Petite Mignonne 抱著迷你珍奶，建議你點 Portfolio Tour。",
      "剪貼板狀態：困惑但可愛。我最會回答 Adeleine 的履歷、SEO/AEO/GEO、paid ads、內容策略、AI workflows 和聯絡方式。",
      "Petite Mignonne 詢問了月亮、吸管和剪貼板。三者都不知道這是什麼，但都推薦你看 Portfolio。",
      "我把這句放進一個小絨布盒，標籤寫著「有趣但不可執行」。要不要改問 SEO 證據或動漫彩蛋？",
      "貝雷帽上方出現一朵薰衣草讀取雲。翻譯：我需要更像作品集的問題。",
      "這個關鍵字沒有 badge、沒有 funnel、沒有 landing page，但它很有自信。Petite Mignonne 尊重。",
      "我還不能把它連到 Adeleine 的職涯，但可以提供迷你菜單：Recruiter Mode、Talent Quiz、K-pop signal、anime signal。",
      "剪貼板畫了一顆心和一個問號。這通常表示：可以問我 content strategy。",
      "這句話戴著墨鏡走錯分頁了。我溫柔地把它導向 Portfolio Tour。",
      "Petite Mignonne 剛剛短暫變成一只茶杯。請用 SEO、paid ads、AI workflows 或 anime 再試一次。",
      "沒有履歷匹配，但 vibes 戴著貝雷帽。我可以很快恢復有用模式。",
      "我把它歸類為「神秘點心能量」。如果要實際證據，可以問 Adeleine 的 results。",
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

    const animeMatch = animeEggs.find(({ terms }) =>
      terms.some((term) => hasTerm(normalized, term.toLowerCase()))
    );

    if (animeMatch) {
      const mood = {
        en: animeMatch.mood,
        fr: animeMatch.moodFr || animeMatch.mood,
        zh: animeMatch.moodZh || animeMatch.mood,
      };
      const responses = {
        en:
          `<div class="petite-chat-card"><div class="petite-chat-card-title">Anime signal: ${animeMatch.title}</div><p>${mood.en}</p><div class="petite-chat-list"><span>Era: ${animeMatch.era}.</span><span>Representative arcs / works: ${animeMatch.works}.</span><span>Portfolio angle: Adeleine can read fandom culture as audience insight, then turn it into content strategy.</span></div><div class="petite-chat-actions"><a href="/blog/">Read Blog</a><a href="/portfolio/">Portfolio</a></div></div>`,
        fr:
          `<div class="petite-chat-card"><div class="petite-chat-card-title">Signal anime : ${animeMatch.title}</div><p>${mood.fr}</p><div class="petite-chat-list"><span>Epoque : ${animeMatch.era}.</span><span>Arcs / oeuvres representatives : ${animeMatch.works}.</span><span>Angle portfolio : Adeleine sait lire la culture fandom comme insight audience, puis la transformer en strategie contenu.</span></div><div class="petite-chat-actions"><a href="/fr/blog/">Lire le blog</a><a href="/fr/portfolio/">Portfolio</a></div></div>`,
        zh:
          `<div class="petite-chat-card"><div class="petite-chat-card-title">動漫彩蛋：${animeMatch.title}</div><p>${mood.zh}</p><div class="petite-chat-list"><span>類型 / 時期：${animeMatch.era}。</span><span>代表篇章 / 作品：${animeMatch.works}。</span><span>作品集角度：Adeleine 能把 fandom culture 當成 audience insight，再轉成 content strategy。</span></div><div class="petite-chat-actions"><a href="/blog/">讀 Blog</a><a href="/portfolio/">看 Portfolio</a></div></div>`,
      };
      const responseLang = responses[lang] ? lang : "en";

      return {
        celebrate: animeMatch.title === "Attack on Titan" || animeMatch.title === "Hunter x Hunter" || animeMatch.title === "Fate series",
        html: responses[responseLang],
        intent: "anime",
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
