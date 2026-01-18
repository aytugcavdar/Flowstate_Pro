
export type Language = 'en' | 'tr';

export const TRANSLATIONS = {
  en: {
    title: "FLOWSTATE",
    moves: "MOVES",
    streak: "Day Streak",
    modes: {
      daily: "DAILY RUN",
      practice: "PRACTICE",
      campaign: "CAMPAIGN"
    },
    status: {
      req: "Req",
      bug: "Bug",
      initializing: "Initializing System...",
      uplink: "Establishing Uplink..."
    },
    buttons: {
      hint: "HINT",
      reset: "RESET",
      newLevel: "NEW LEVEL",
      share: "SHARE RESULT",
      next: "NEXT LEVEL",
      startDaily: "INITIATE DAILY RUN",
      startSim: "START SIMULATION",
      profile: "PROFILE",
      close: "CLOSE TERMINAL",
      back: "BACK TO MENU",
      select: "SELECT"
    },
    intro: {
      dailyTitle: "Daily Protocol",
      simTitle: "Simulation Mode",
      dailyMission: "MISSION: Connect the power source to the sink. Everyone gets the same grid today. Can you beat the global efficiency?",
      simMission: "TRAINING: Unlimited generated levels. Use this to practice advanced routing techniques.",
      li1: "Rotate pipes to guide flow.",
      li2: "Power all 'Req' nodes.",
      li3: "Avoid 'Bug' nodes.",
      li4: "Stuck? Ask the AI Operator for a hint.",
      todaysOrders: "TODAY'S ORDERS",
      streakBonus: "STREAK BONUS"
    },
    missions: {
        mission_speed: "Complete in under {target}s",
        mission_moves: "Finish in {target} moves or less",
        mission_nohint: "Use ZERO hints",
        mission_bonus: "Power all BONUS nodes",
        complete: "COMPLETE",
        reward: "REWARD"
    },
    win: {
      title: "Sequence Complete",
      systemOnline: "System Online",
      calculating: "Calculating efficiency...",
      shareText: "Result copied to clipboard!",
      aiLog: "AI LOG"
    },
    logs: [
      "INITIALIZING HANDSHAKE...",
      "VERIFYING NODE INTEGRITY...",
      "BYPASSING SECURITY PROTOCOLS...",
      "OPTIMIZING POWER FLOW...",
      "DECRYPTING PAYLOAD...",
      "SYSTEM SYNCHRONIZATION: 100%"
    ],
    success: {
        system: "SYSTEM",
        online: "ONLINE",
        access: "ACCESS GRANTED"
    },
    shareTemplate: {
        daily: "Daily",
        practice: "Practice Run",
        moves: "Moves"
    },
    terminal: {
        header: "TERMINAL_OUTPUT_V4.0",
        upload: "UPLOAD_COMPLETE",
        analysis: "EFFICIENCY_ANALYSIS",
        time: "TIME_ELAPSED",
        badge: "NEW_PROTOCOL_DISCOVERED",
        rank: "OPERATOR_RANK",
        xp: "DATA_MINED",
        missions: "MISSION_REPORT",
        streak: "STREAK_MULTIPLIER",
        stars: "PROTOCOL_RATING",
        chapter_progress: "CHAPTER_PROGRESS"
    },
    badges: {
        NOVICE: { name: "Script Kiddie", desc: "First successful hack." },
        FIRST_STEPS: { name: "First Steps", desc: "5 total successful runs." },
        SPEED_DEMON: { name: "Speed Demon", desc: "Complete a run in under 30 seconds." },
        LIGHTNING: { name: "Lightning Fast", desc: "Complete a run in under 20 seconds." },
        TIME_MASTER: { name: "Time Lord", desc: "Complete a run in under 15 seconds." },
        NETRUNNER: { name: "Netrunner", desc: "5 consecutive wins without hints." },
        ARCHITECT: { name: "System Architect", desc: "10 total successful runs." },
        CYBER_GOD: { name: "Mainframe Deity", desc: "< 20 moves in under 45s." },
        DEDICATED: { name: "Dedicated Operator", desc: "25 total successful runs." },
        OBSESSED: { name: "Obsessed", desc: "50 total successful runs." },
        LEGEND: { name: "Living Legend", desc: "100 total successful runs." },
        CONSISTENT: { name: "Consistency", desc: "7 day login streak." },
        UNSTOPPABLE: { name: "Unstoppable", desc: "30 day login streak." },
        PERFECTIONIST: { name: "Perfectionist", desc: "Complete all daily missions perfectly." },
        HACKER: { name: "Elite Hacker", desc: "Find the secret backdoor." }
    },
    profile: {
        title: "OPERATOR PROFILE",
        wins: "TOTAL BREACHES",
        fastest: "BEST TIME",
        streak: "NO-HINT STREAK",
        level: "SECURITY CLEARANCE",
        xp: "TOTAL DATA"
    },
    campaign: {
        title: "CAMPAIGN",
        locked: "ENCRYPTED - REQ STARS:",
        complete: "SYSTEM OWNED",
        chapter: "CHAPTER",
        totalStars: "TOTAL STARS"
    },
    themes: {
        title: "THEME SETTINGS",
        mode: "Display Mode",
        select: "Select Theme",
        theme_cyberpunk: "Cyberpunk",
        theme_retro: "Retro Arcade",
        theme_neon: "Neon Dreams",
        theme_matrix: "Matrix"
    },
    leaderboard: {
        title: "LEADERBOARD",
        daily: "Daily Challenge",
        yourRank: "Your Rank",
        name: "Name",
        moves: "Moves",
        time: "Time",
        submitted: "Score submitted!",
        resetInfo: "Daily boards reset every day"
    },
    settings: {
        title: "SETTINGS",
        audio: "Audio",
        visual: "Visual",
        game: "Game",
        data: "Data",
        muteAll: "Mute All",
        masterVolume: "Master Volume",
        sfxVolume: "SFX Volume",
        musicVolume: "Music Volume",
        testSound: "Test Sound",
        animations: "Animations",
        scanlines: "CRT Scanlines",
        highContrast: "High Contrast",
        language: "Language",
        playerName: "Player Name",
        showTimer: "Show Timer",
        confirmReset: "Confirm Reset",
        resetData: "Reset All Data",
        confirmResetWarn: "CLICK AGAIN TO CONFIRM",
        storageInfo: "All data is stored locally in your browser."
    },
    achievements: {
        title: "ACHIEVEMENTS",
        unlocked: "Unlocked",
        total: "Total",
        complete: "Complete",
        all: "All",
        beginner: "Beginner",
        speed: "Speed",
        skill: "Skill",
        milestone: "Milestone",
        streak: "Streak",
        secret: "Secret"
    },
    rewards: {
        title: "DAILY REWARD",
        loginStreak: "Login Streak",
        days: "DAYS",
        todayReward: "Today's Reward",
        claim: "CLAIM REWARD",
        claimed: "Reward claimed!",
        claimedToday: "You've claimed today's reward! Come back tomorrow.",
        weeklyJackpot: "days until weekly jackpot!"
    }
  },
  tr: {
    title: "AKIŞ DURUMU",
    moves: "HAMLE",
    streak: "Gün Seri",
    modes: {
      daily: "GÜNLÜK",
      practice: "ANTRENMAN",
      campaign: "HİKAYE"
    },
    status: {
      req: "Gerekli",
      bug: "Hata",
      initializing: "Sistem Başlatılıyor...",
      uplink: "Bağlantı Kuruluyor..."
    },
    buttons: {
      hint: "İPUCU",
      reset: "SIFIRLA",
      newLevel: "YENİ SEVİYE",
      share: "SONUCU PAYLAŞ",
      next: "SONRAKİ SEVİYE",
      startDaily: "GÜNLÜK MODU BAŞLAT",
      startSim: "SİMÜLASYONU BAŞLAT",
      profile: "PROFİL",
      close: "TERMİNALİ KAPAT",
      back: "MENÜYE DÖN",
      select: "SEÇ"
    },
    intro: {
      dailyTitle: "Günlük Protokol",
      simTitle: "Simülasyon Modu",
      dailyMission: "GÖREV: Güç kaynağını çıkışa bağla. Bugün herkes aynı haritayı oynuyor. Küresel verimliliği geçebilir misin?",
      simMission: "EĞİTİM: Sınırsız rastgele seviye. İleri düzey yönlendirme teknikleri çalışmak için kullanın.",
      li1: "Akışı yönlendirmek için boruları çevir.",
      li2: "Tüm 'Gerekli' düğümlere güç ver.",
      li3: "'Hata' (Bug) düğümlerinden kaçın.",
      li4: "Takıldın mı? Yapay Zeka Operatörüne sor."
    },
    missions: {
        mission_speed: "{target}sn altında tamamla",
        mission_moves: "{target} hamle veya daha azıyla bitir",
        mission_nohint: "HİÇ ipucu kullanma",
        mission_bonus: "Tüm BONUS düğümleri aktifle",
        complete: "TAMAMLANDI",
        reward: "ÖDÜL"
    },
    win: {
      title: "Dizi Tamamlandı",
      systemOnline: "Sistem Çevrimiçi",
      calculating: "Verimlilik hesaplanıyor...",
      shareText: "Sonuç panoya kopyalandı!",
      aiLog: "YZ GÜNLÜĞÜ"
    },
    logs: [
      "EL SIKIŞMA BAŞLATILIYOR...",
      "DÜĞÜM BÜTÜNLÜĞÜ DOĞRULANIYOR...",
      "GÜVENLİK PROTOKOLLERİ ATLATILIYOR...",
      "GÜÇ AKIŞI OPTİMİZE EDİLİYOR...",
      "VERİ PAKETİ ŞİFRESİ ÇÖZÜLÜYOR...",
      "SİSTEM SENKRONİZASYONU: %100"
    ],
    success: {
        system: "SİSTEM",
        online: "ÇEVRİMİÇİ",
        access: "ERİŞİM İZNİ VERİLDİ"
    },
    shareTemplate: {
        daily: "Günlük",
        practice: "Antrenman",
        moves: "Hamle"
    },
    terminal: {
        header: "TERMINAL_ÇIKTI_V4.0",
        upload: "YÜKLEME_TAMAMLANDI",
        analysis: "VERİMLİLİK_ANALİZİ",
        time: "GEÇEN_SÜRE",
        badge: "YENİ_PROTOKOL_KEŞFEDİLDİ",
        rank: "OPERATÖR_RÜTBESİ",
        xp: "VERİ_ÇIKARILDI",
        missions: "GÖREV_RAPORU",
        streak: "SERİ_ÇARPANI",
        stars: "PROTOKOL_DERECESİ",
        chapter_progress: "BÖLÜM_İLERLEMESİ"
    },
    badges: {
        NOVICE: { name: "Çaylak Hacker", desc: "İlk başarılı sızma." },
        FIRST_STEPS: { name: "İlk Adımlar", desc: "Toplam 5 başarılı operasyon." },
        SPEED_DEMON: { name: "Hız Şeytanı", desc: "30 saniyenin altında tamamla." },
        LIGHTNING: { name: "Yıldırım Hızı", desc: "20 saniyenin altında tamamla." },
        TIME_MASTER: { name: "Zaman Efendisi", desc: "15 saniyenin altında tamamla." },
        NETRUNNER: { name: "Ağ Koşucusu", desc: "İpucu kullanmadan üst üste 5 zafer." },
        ARCHITECT: { name: "Sistem Mimarı", desc: "Toplam 10 başarılı operasyon." },
        CYBER_GOD: { name: "Ana Bilgisayar Tanrısı", desc: "45sn altında ve 20 hamleden az." },
        DEDICATED: { name: "Adanmış", desc: "Toplam 25 başarılı operasyon." },
        OBSESSED: { name: "Takıntılı", desc: "Toplam 50 başarılı operasyon." },
        LEGEND: { name: "Efsane", desc: "Toplam 100 başarılı operasyon." },
        CONSISTENT: { name: "İstikrar", desc: "7 gün giriş serisi." },
        UNSTOPPABLE: { name: "Durdurulamaz", desc: "30 gün giriş serisi." },
        PERFECTIONIST: { name: "Mükemmeliyetçi", desc: "Tüm günlük görevleri kusursuz tamamla." },
        HACKER: { name: "Elit Hacker", desc: "Gizli arka kapıyı bul." }
    },
    profile: {
        title: "OPERATÖR PROFİLİ",
        wins: "TOPLAM SIZMA",
        fastest: "EN İYİ SÜRE",
        streak: "İPUCUSUZ SERİ",
        level: "GÜVENLİK YETKİSİ",
        xp: "TOPLAM VERİ"
    },
    campaign: {
        title: "HİKAYE",
        locked: "ŞİFRELİ - GEREKEN YILDIZ:",
        complete: "SİSTEM ELE GEÇİRİLDİ",
        chapter: "BÖLÜM",
        totalStars: "TOPLAM YILDIZ"
    },
    themes: {
        title: "TEMA AYARLARI",
        mode: "Görünüm Modu",
        select: "Tema Seç",
        theme_cyberpunk: "Siberpunk",
        theme_retro: "Retro Arcade",
        theme_neon: "Neon Rüyaları",
        theme_matrix: "Matrix"
    },
    leaderboard: {
        title: "SKOR TABLOSU",
        daily: "Günlük Mücadele",
        yourRank: "Senin Sıralaman",
        name: "İsim",
        moves: "Hamle",
        time: "Süre",
        submitted: "Skor kaydedildi!",
        resetInfo: "Günlük tablolar her gün sıfırlanır"
    },
    settings: {
        title: "AYARLAR",
        audio: "Ses",
        visual: "Görsel",
        game: "Oyun",
        data: "Veri",
        muteAll: "Tüm Sesleri Kapat",
        masterVolume: "Ana Ses",
        sfxVolume: "Efekt Sesi",
        musicVolume: "Müzik Sesi",
        testSound: "Sesi Test Et",
        animations: "Animasyonlar",
        scanlines: "CRT Tarama Çizgileri",
        highContrast: "Yüksek Kontrast",
        language: "Dil",
        playerName: "Oyuncu Adı",
        showTimer: "Zamanlayıcı Göster",
        confirmReset: "Sıfırlama Onayı",
        resetData: "Tüm Verileri Sil",
        confirmResetWarn: "ONAYLAMAK İÇİN TEKRAR TIKLA",
        storageInfo: "Tüm veriler tarayıcınızda yerel olarak saklanır."
    },
    achievements: {
        title: "BAŞARIMLAR",
        unlocked: "Kazanılan",
        total: "Toplam",
        complete: "Tamamlanan",
        all: "Tümü",
        beginner: "Başlangıç",
        speed: "Hız",
        skill: "Yetenek",
        milestone: "Kilometre Taşı",
        streak: "Seri",
        secret: "Gizli"
    },
    rewards: {
        title: "GÜNLÜK ÖDÜL",
        loginStreak: "Giriş Serisi",
        days: "GÜN",
        todayReward: "Bugünün Ödülü",
        claim: "ÖDÜLÜ AL",
        claimed: "Ödül alındı!",
        claimedToday: "Bugünün ödülünü aldın! Yarın tekrar gel.",
        weeklyJackpot: "gün sonra haftalık jackpot!"
    }
  }
};
