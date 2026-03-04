export type Language = "en" | "sw";

type Translations = Record<string, { en: string; sw: string }>;

export const translations: Translations = {
  // Navbar
  "nav.home": { en: "Home", sw: "Nyumbani" },
  "nav.tools": { en: "Tools", sw: "Zana" },
  "nav.videos": { en: "Videos", sw: "Video" },
  "nav.news": { en: "News", sw: "Habari" },
  "nav.courses": { en: "Courses", sw: "Kozi" },
  "nav.about": { en: "About", sw: "Kuhusu" },
  "nav.contact": { en: "Contact", sw: "Wasiliana" },
  "nav.login": { en: "LOGIN", sw: "INGIA" },
  "nav.logout": { en: "Logout", sw: "Ondoka" },
  "nav.account": { en: "Account", sw: "Akaunti" },
  "nav.admin": { en: "Admin", sw: "Msimamizi" },
  "nav.dashboard": { en: "My Dashboard", sw: "Dashibodi Yangu" },
  "nav.adminPanel": { en: "Admin Panel", sw: "Paneli ya Msimamizi" },

  // Hero Section
  "hero.welcome": { en: "Welcome to the cyber realm", sw: "Karibu katika ulimwengu wa mtandao" },
  "hero.typewriter": { en: "> Unlock the secrets of cybersecurity_", sw: "> Fungua siri za usalama wa mtandao_" },
  "hero.subtitle": {
    en: "Your ultimate platform for cybersecurity tools, expert tutorials, and cutting-edge courses. Join thousands of security enthusiasts and professionals.",
    sw: "Jukwaa lako kuu la zana za usalama wa mtandao, mafunzo ya wataalamu, na kozi za kisasa. Jiunge na maelfu ya wapenda usalama na wataalamu.",
  },
  "hero.exploreTools": { en: "Explore Tools", sw: "Chunguza Zana" },
  "hero.startLearning": { en: "Start Learning", sw: "Anza Kujifunza" },

  // Stats
  "stats.activeUsers": { en: "Active Users", sw: "Watumiaji Hai" },
  "stats.toolsAvailable": { en: "Tools Available", sw: "Zana Zinazopatikana" },
  "stats.videoTutorials": { en: "Video Tutorials", sw: "Mafunzo ya Video" },
  "stats.expertCourses": { en: "Expert Courses", sw: "Kozi za Wataalamu" },

  // Features
  "features.tag": { en: "What we offer", sw: "Tunachotoa" },
  "features.title": { en: "Your Cyber Arsenal", sw: "Silaha Zako za Mtandao" },
  "features.securityTools": { en: "Security Tools", sw: "Zana za Usalama" },
  "features.securityToolsDesc": {
    en: "Access powerful cybersecurity tools for penetration testing and vulnerability assessment.",
    sw: "Pata zana zenye nguvu za usalama wa mtandao kwa majaribio ya kupenya na tathmini ya udhaifu.",
  },
  "features.expertTutorials": { en: "Expert Tutorials", sw: "Mafunzo ya Wataalamu" },
  "features.expertTutorialsDesc": {
    en: "Learn from comprehensive video tutorials covering hacking, programming, and security.",
    sw: "Jifunze kutoka mafunzo kamili ya video yanayoshughulikia uhalifu wa mtandao, programu, na usalama.",
  },
  "features.courses": { en: "Courses", sw: "Kozi" },
  "features.coursesDesc": {
    en: "Master cybersecurity, programming, and graphic design with structured courses.",
    sw: "Bobea katika usalama wa mtandao, programu, na muundo wa picha kwa kozi zilizopangwa.",
  },
  "features.latestNews": { en: "Latest News", sw: "Habari za Hivi Karibuni" },
  "features.latestNewsDesc": {
    en: "Stay updated with the latest cybersecurity news, threats, and industry updates.",
    sw: "Endelea kupata habari za hivi karibuni za usalama wa mtandao, vitisho, na sasisho za tasnia.",
  },

  // CTA
  "cta.title": { en: "Ready to Begin Your Journey?", sw: "Uko Tayari Kuanza Safari Yako?" },
  "cta.subtitle": {
    en: "Join our community of cybersecurity professionals and enthusiasts. Start learning, exploring tools, and stay ahead of threats.",
    sw: "Jiunge na jumuiya yetu ya wataalamu na wapenda usalama wa mtandao. Anza kujifunza, kuchunguza zana, na kubaki mbele ya vitisho.",
  },
  "cta.getStarted": { en: "Get Started Free", sw: "Anza Bure" },
  "cta.learnMore": { en: "Learn More", sw: "Jifunze Zaidi" },

  // Footer
  "footer.tagline": {
    en: "Your gateway to the cyber world. Learn, explore, and master cybersecurity.",
    sw: "Lango lako la ulimwengu wa mtandao. Jifunze, chunguza, na bobea katika usalama wa mtandao.",
  },
  "footer.quickLinks": { en: "Quick Links", sw: "Viungo vya Haraka" },
  "footer.resources": { en: "Resources", sw: "Rasilimali" },
  "footer.connect": { en: "Connect", sw: "Ungana" },
  "footer.rights": { en: "All rights reserved.", sw: "Haki zote zimehifadhiwa." },
  "footer.securingFrontier": { en: "Securing the digital frontier", sw: "Kulinda mpaka wa kidijitali" },
  "footer.privacyPolicy": { en: "Privacy Policy", sw: "Sera ya Faragha" },
  "footer.termsOfService": { en: "Terms of Service", sw: "Masharti ya Huduma" },

  // About Page
  "about.tag": { en: "Who Am I", sw: "Mimi ni Nani" },
  "about.title": { en: "About CyberNinja", sw: "Kuhusu CyberNinja" },
  "about.subtitle": {
    en: "Dedicated to empowering individuals with cybersecurity knowledge and skills.",
    sw: "Kujitolea kuwapa watu maarifa na ujuzi wa usalama wa mtandao.",
  },
  "about.role": { en: "Security Researcher & Ethical Hacker", sw: "Mtafiti wa Usalama & Mdukuzi wa Kimaadili" },
  "about.bio": {
    en: "I am the Cyber Ninja, a multi-disciplinary tech professional specializing in Cyber Security, Programming, and Graphic Design. I build secure, resilient systems while crafting visually striking, user-focused digital experiences—ensuring your digital presence is both protected and powerful.",
    sw: "Mimi ni Cyber Ninja, mtaalamu wa teknolojia wa fani nyingi ninayebobea katika Usalama wa Mtandao, Programu, na Muundo wa Picha. Ninajenga mifumo salama na imara huku nikibuni uzoefu wa kidijitali unaovutia na unaozingatia mtumiaji—kuhakikisha uwepo wako wa kidijitali unalindwa na wenye nguvu.",
  },
  "about.credentials": { en: "Credentials", sw: "Vyeti" },
  "about.certifications": { en: "Professional Certifications", sw: "Vyeti vya Kitaaluma" },
  "about.mission": { en: "Our Mission", sw: "Dhamira Yetu" },
  "about.missionText": {
    en: "Our mission is to deliver elite offensive security solutions with precision and stealth. We specialize in infiltrating complex infrastructures to uncover hidden risks, ensuring our clients stay ten steps ahead of cyber criminals. We don't just find bugs — we neutralize threats through the lens of a professional hacker.",
    sw: "Dhamira yetu ni kutoa suluhisho bora za usalama wa mashambulizi kwa usahihi na siri. Tunabobea katika kupenya miundombinu changamano ili kugundua hatari zilizofichwa, kuhakikisha wateja wetu wanabaki hatua kumi mbele ya wahalifu wa mtandao. Hatupati hitilafu tu — tunazuia vitisho kupitia mtazamo wa mdukuzi mtaalamu.",
  },

  // Tools Page
  "tools.tag": { en: "Security Arsenal", sw: "Silaha za Usalama" },
  "tools.title": { en: "Cybersecurity Tools", sw: "Zana za Usalama wa Mtandao" },
  "tools.subtitle": {
    en: "Access powerful security tools for penetration testing, vulnerability assessment, and network analysis.",
    sw: "Pata zana zenye nguvu za usalama kwa majaribio ya kupenya, tathmini ya udhaifu, na uchambuzi wa mtandao.",
  },
  "tools.searchPlaceholder": { en: "Search tools...", sw: "Tafuta zana..." },
  "tools.all": { en: "All", sw: "Zote" },
  "tools.free": { en: "Free", sw: "Bure" },
  "tools.paid": { en: "Paid", sw: "Ya Kulipia" },
  "tools.noResults": { en: "No tools found matching your criteria.", sw: "Hakuna zana zilizopatikana kulingana na vigezo vyako." },

  // Videos Page
  "videos.tag": { en: "Video Library", sw: "Maktaba ya Video" },
  "videos.title": { en: "Tutorial Videos", sw: "Video za Mafunzo" },
  "videos.subtitle": {
    en: "Learn from our comprehensive video tutorials covering hacking, programming, and security tools.",
    sw: "Jifunze kutoka mafunzo yetu kamili ya video yanayoshughulikia uhalifu wa mtandao, programu, na zana za usalama.",
  },
  "videos.searchPlaceholder": { en: "Search videos...", sw: "Tafuta video..." },
  "videos.noResults": { en: "No videos found matching your criteria.", sw: "Hakuna video zilizopatikana kulingana na vigezo vyako." },
  "videos.readMore": { en: "Read More", sw: "Soma Zaidi" },
  "videos.readLess": { en: "Read Less", sw: "Soma Kidogo" },

  // News Page
  "news.tag": { en: "Cyber Intel", sw: "Taarifa za Mtandao" },
  "news.title": { en: "Latest Cyber News", sw: "Habari za Hivi Karibuni za Mtandao" },
  "news.subtitle": {
    en: "Stay informed with the latest cybersecurity news, threats, vulnerabilities, and industry updates.",
    sw: "Endelea kupata taarifa za hivi karibuni za usalama wa mtandao, vitisho, udhaifu, na sasisho za tasnia.",
  },
  "news.featured": { en: "FEATURED", sw: "ILIYOANGAZIWA" },
  "news.readMore": { en: "Read More", sw: "Soma Zaidi" },
  "news.noArticles": { en: "No news articles available yet.", sw: "Hakuna makala za habari bado." },

  // Courses Page
  "courses.tag": { en: "Learning Hub", sw: "Kituo cha Kujifunza" },
  "courses.title": { en: "Master New Skills", sw: "Bobea Ujuzi Mpya" },
  "courses.subtitle": {
    en: "Choose your path and start learning from industry experts.",
    sw: "Chagua njia yako na uanze kujifunza kutoka kwa wataalamu wa tasnia.",
  },
  "courses.continueLearning": { en: "Continue Learning", sw: "Endelea Kujifunza" },
  "courses.allCourses": { en: "All Courses", sw: "Kozi Zote" },
  "courses.noCourses": { en: "No courses available yet.", sw: "Hakuna kozi bado." },
  "courses.showAll": { en: "Show All", sw: "Onyesha Zote" },
  "courses.explore": { en: "Explore", sw: "Chunguza" },
  "courses.complete": { en: "Complete", sw: "Kamili" },

  // Contact Page
  "contact.tag": { en: "Get in Touch", sw: "Wasiliana Nasi" },
  "contact.title": { en: "Contact Us", sw: "Wasiliana Nasi" },
  "contact.subtitle": {
    en: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    sw: "Una maswali? Tungependa kusikia kutoka kwako. Tutuma ujumbe na tutajibu haraka iwezekanavyo.",
  },
  "contact.sendMessage": { en: "Send a Message", sw: "Tuma Ujumbe" },
  "contact.contactInfo": { en: "Contact Info", sw: "Taarifa za Mawasiliano" },
  "contact.followUs": { en: "Follow Us", sw: "Tufuate" },
  "contact.name": { en: "Name", sw: "Jina" },
  "contact.namePlaceholder": { en: "Your name", sw: "Jina lako" },
  "contact.email": { en: "Email", sw: "Barua pepe" },
  "contact.subject": { en: "Subject", sw: "Mada" },
  "contact.subjectPlaceholder": { en: "How can we help?", sw: "Tunawezaje kusaidia?" },
  "contact.message": { en: "Message", sw: "Ujumbe" },
  "contact.messagePlaceholder": { en: "Your message...", sw: "Ujumbe wako..." },
  "contact.send": { en: "Send Message", sw: "Tuma Ujumbe" },
  "contact.quickWhatsApp": { en: "Quick WhatsApp Chat", sw: "Mazungumzo ya Haraka ya WhatsApp" },
  "contact.quickWhatsAppDesc": { en: "Click to start a conversation instantly", sw: "Bofya kuanza mazungumzo papo hapo" },
};
