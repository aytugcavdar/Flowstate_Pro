import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { getDailyTheme, getWinningCommentary, getGameHint } from './services/geminiService';
import { playSound, startAmbience, setMusicIntensity, stopAmbience } from './services/audio';
import { getProfile, checkBadgesOnWin, generateDailyMissions } from './services/progression';
import { getCampaignProgress, completeLevel, calculateStarsForRun, getNextLevelId, CAMPAIGN_CHAPTERS } from './services/campaign';
import { submitScore, hasPlayedToday } from './services/leaderboardService';
import { loadSettings } from './services/settingsService';
import { rewardGameWin } from './services/economyService';
import { getInventory, usePowerup, PowerupInventory, PowerupType, consumeCoinBoost, isCoinBoostActive } from './services/powerupService';
import { logGameSession } from './services/cloudSyncService';
import { logUserVisit, logGameStart, logGameWin, logModeChange, logShopOpen } from './services/analyticsService';
import { initNotifications } from './services/notificationService';
import { initExperiments } from './services/abTestService';
import { checkReferralBonuses, checkUrlForReferral } from './services/referralService';
import { haptic } from './services/hapticService';
import { Tile } from './components/Tile';
import { Modal } from './components/Modal';
import { CyberpunkOverlay } from './components/CyberpunkOverlay';
import { Header } from './components/Header';
import { GameControls } from './components/GameControls';
import { TerminalWinScreen } from './components/TerminalWinScreen';
import { ProfileModal } from './components/ProfileModal';
import { MissionBoard } from './components/MissionBoard';
import { CampaignMenu } from './components/CampaignMenu';
import { EndlessMode } from './components/EndlessMode';
import { SpeedRunMode } from './components/SpeedRunMode';
import { ThemeSelector } from './components/ThemeSelector';
import { SettingsModal } from './components/SettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { ShopModal } from './components/ShopModal';
import { PowerupBar } from './components/PowerupBar';
import { ConfettiCanvas } from './components/Confetti';
import { AdminDashboard } from './components/AdminDashboard';
import { UsernameModal } from './components/UsernameModal';
import { canClaimReward } from './services/rewardService';
import { getStoredUsername } from './services/usernameService';
import { TRANSLATIONS, Language } from './constants/translations';
import { DailyStats, DailyTheme, TileType, WinAnalysis, PlayerProfile, DailyMission, CampaignLevel, CampaignProgress, GameMode, GridPos } from './types';
import { STORAGE_KEY_STATS, GRID_SIZE } from './constants';
import { useGameState } from './hooks/useGameState';



const App: React.FC = () => {
    // --- UI State ---
    const [lang, setLang] = useState<Language>('en');
    const [mode, setMode] = useState<GameMode>('DAILY');
    const [practiceSeed, setPracticeSeed] = useState(Date.now().toString());

    // Campaign State
    const [campaignLevel, setCampaignLevel] = useState<CampaignLevel | null>(null);
    const [campaignProgress, setCampaignProgress] = useState<CampaignProgress>(getCampaignProgress());

    // Computed Game Key
    const currentKey = useMemo(() => {
        if (mode === 'DAILY') {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        }
        if (mode === 'CAMPAIGN' && campaignLevel) {
            return campaignLevel.seed;
        }
        return `PRACTICE_${practiceSeed}`;
    }, [mode, practiceSeed, campaignLevel]);

    // --- Game State Hook ---
    const { grid, moves, isWon, charges, loading, onTileClick, resetGame, canUndo, undoLastMove, getHintableTile, applyHint } = useGameState(currentKey);

    // --- Power-up State ---
    const [powerupInventory, setPowerupInventory] = useState<PowerupInventory>(getInventory());
    const [hintHighlight, setHintHighlight] = useState<{ position: GridPos; rotation: number } | null>(null);

    // --- Auxiliary State ---
    const [theme, setTheme] = useState<DailyTheme | null>(null);
    const [winData, setWinData] = useState<WinAnalysis | null>(null);
    const [hint, setHint] = useState<string | null>(null);
    const [loadingHint, setLoadingHint] = useState(false);
    const [showHackEffect, setShowHackEffect] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showWin, setShowWin] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showTheme, setShowTheme] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showRewards, setShowRewards] = useState(canClaimReward());
    const [showShop, setShowShop] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showUsernameModal, setShowUsernameModal] = useState(!getStoredUsername());
    const [playerUsername, setPlayerUsername] = useState(getStoredUsername() || '');
    const [stats, setStats] = useState<DailyStats>({ streak: 0, lastPlayed: '', history: {}, completedMissions: [] });
    const [missions, setMissions] = useState<DailyMission[]>([]);

    // Progression State
    const [profile, setProfile] = useState<PlayerProfile>(getProfile());
    const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
    const [lastXpGained, setLastXpGained] = useState(0);
    const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
    const [gameTimeMs, setGameTimeMs] = useState(0);
    const [usedHint, setUsedHint] = useState(false);
    const [lastStars, setLastStars] = useState(0); // For campaign win screen
    const startTimeRef = useRef<number>(0);

    const t = TRANSLATIONS[lang];

    // --- Effects ---

    // Initialize services on mount
    useEffect(() => {
        // Initialize notifications
        initNotifications();

        // Initialize A/B experiments
        initExperiments().catch(err => console.warn('[App] Experiments init failed:', err));

        // Check for referral bonuses
        checkReferralBonuses().then(bonus => {
            if (bonus > 0) {
                console.log(`[App] Claimed ${bonus} coins from referrals`);
            }
        });

        // Check URL for referral code
        const refCode = checkUrlForReferral();
        if (refCode) {
            console.log('[App] Referral code from URL:', refCode);
            // Could show a modal to use the code
        }
    }, []);

    // Load Stats, Theme, Missions + Log User Visit
    useEffect(() => {
        const savedStats = localStorage.getItem(STORAGE_KEY_STATS);
        if (savedStats) setStats(JSON.parse(savedStats));

        setCampaignProgress(getCampaignProgress());

        getDailyTheme(mode === 'DAILY' ? currentKey : 'CYBERPUNK_RANDOM', lang).then(setTheme);
        setProfile(getProfile());

        if (mode === 'DAILY') {
            setMissions(generateDailyMissions(currentKey));
        } else {
            setMissions([]);
        }

        // Log user visit on first load
        logUserVisit().catch(err => console.warn('[App] Visit log failed:', err));
    }, [currentKey, mode, lang]);

    // Timer Logic
    useEffect(() => {
        if (loading || isWon) return;
        if (moves === 0) startTimeRef.current = Date.now();
    }, [loading, isWon, moves]);

    // Dynamic Audio
    useEffect(() => {
        if (loading || grid.length === 0 || isWon) return;
        let powered = 0, total = 0;
        grid.forEach(row => row.forEach(tile => {
            if (tile.type !== TileType.EMPTY) {
                total++;
                if (tile.hasFlow) powered++;
            }
        }));
        setMusicIntensity(total > 0 ? (powered / total) : 0);
    }, [grid, isWon, loading]);

    // Track if game was just loaded from cache as already-won (to prevent auto-trigger)
    const wasLoadedAsWonRef = useRef(false);
    const lastProcessedKeyRef = useRef<string | null>(null);
    const prevIsWonRef = useRef(false);
    const loadingCompleteRef = useRef(false);

    // Track when loading completes - if isWon is already true at this point, it's from cache
    useEffect(() => {
        if (!loading && !loadingCompleteRef.current) {
            // Loading just completed
            loadingCompleteRef.current = true;
            if (isWon) {
                // Game was loaded as already won (from cache)
                wasLoadedAsWonRef.current = true;
                console.log('[App] Loaded cached won game, skipping celebration');
            }
        }
    }, [loading, isWon]);

    // Reset refs when game key changes (new game)
    useEffect(() => {
        loadingCompleteRef.current = false;
        wasLoadedAsWonRef.current = false;
        prevIsWonRef.current = false;
    }, [currentKey]);

    // Admin Dashboard keyboard shortcut (Ctrl + Shift + A)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                setShowAdmin(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Win Handler
    useEffect(() => {
        // If game was loaded as won from cache, don't trigger celebration
        if (wasLoadedAsWonRef.current) {
            // User already completed this game before, skip everything
            prevIsWonRef.current = isWon;
            return;
        }

        // Only trigger win celebration if isWon just changed from false to true
        const justWon = isWon && !prevIsWonRef.current;
        prevIsWonRef.current = isWon;

        if (justWon && !showHackEffect && !showWin) {
            // Calculate Time
            const duration = Date.now() - startTimeRef.current;
            setGameTimeMs(duration);

            // Async check for replay (database-first, localStorage fallback)
            const processWin = async () => {
                let isDailyReplay = false;

                if (mode === 'DAILY') {
                    // Check database first
                    isDailyReplay = await hasPlayedToday(currentKey);
                    console.log('[App] Win Check (DB):', { mode, currentKey, isDailyReplay });
                }

                if (isDailyReplay) {
                    console.log('[App] Replay detected - Skipping Rewards');
                    setLastXpGained(0);
                    handleWin(true); // skip animation
                    return;
                }

                // Standard Progression
                const { newProfile, newBadges, xpGained, newCompletedMissions } = checkBadgesOnWin(
                    profile,
                    duration,
                    usedHint,
                    moves,
                    mode === 'DAILY' ? 'DAILY' : 'PRACTICE',
                    grid,
                    stats.streak,
                    missions,
                    stats.completedMissions || []
                );

                let finalXp = xpGained;

                // CAMPAIGN LOGIC
                if (mode === 'CAMPAIGN' && campaignLevel) {
                    const stars = calculateStarsForRun(moves, campaignLevel.parMoves);
                    setLastStars(stars);
                    const { newProgress, justUnlockedChapter } = completeLevel(campaignLevel.id, stars);
                    setCampaignProgress(newProgress);

                    // Campaign Bonus XP
                    finalXp += stars * 50;
                    newProfile.xp += stars * 50;
                    newProfile.level = Math.floor(newProfile.xp / 1000) + 1;
                }

                setProfile(newProfile);
                setUnlockedBadges(newBadges);
                setLastXpGained(finalXp);
                setCompletedMissionIds([...(stats.completedMissions || []), ...newCompletedMissions]);

                // Award Coins
                rewardGameWin(mode, {
                    stars: mode === 'CAMPAIGN' && campaignLevel ? calculateStarsForRun(moves, campaignLevel.parMoves) : undefined,
                    streak: stats.streak + 1,
                    missionsCompleted: newCompletedMissions.length,
                    timeMs: duration,
                });

                // Log game session for analytics
                logGameSession({
                    mode,
                    date_key: currentKey,
                    moves,
                    time_ms: duration,
                    won: true,
                    used_hint: usedHint,
                    powerups_used: {}, // Could track which powerups were used
                }).catch(err => console.warn('[App] Game session log failed:', err));

                // Save Stats Update (Streaks + Missions)
                if (mode === 'DAILY') {
                    const newStats = { ...stats };
                    // Only update if not already updated (redundant check but safe)
                    if (newStats.lastPlayed !== currentKey) {
                        newStats.streak += 1;
                        newStats.lastPlayed = currentKey;
                    }
                    newStats.history[currentKey] = moves;

                    // Merge missions
                    if (!newStats.completedMissions) newStats.completedMissions = [];
                    newCompletedMissions.forEach(id => {
                        if (!newStats.completedMissions.includes(id)) newStats.completedMissions.push(id);
                    });

                    setStats(newStats);
                    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(newStats));
                }

                // Mark this key as processed so cache load detection works correctly
                lastProcessedKeyRef.current = currentKey;
                wasLoadedAsWonRef.current = false; // Reset for future loads
                setTimeout(() => handleWin(false), 1000);
            };

            processWin(); // Execute the async function
        }
    }, [isWon]);

    // Reset hints on new level
    useEffect(() => {
        setUsedHint(false);
        startTimeRef.current = Date.now();
    }, [currentKey]);

    // --- Handlers ---

    const handleWin = async (skipEffect: boolean = false) => {
        if (!skipEffect) {
            setShowHackEffect(true);
            playSound('win');

            // Auto-submit score to leaderboard (Daily only)
            if (mode === 'DAILY') {
                const settings = loadSettings(); // Ensure we have latest name
                submitScore(currentKey, moves, gameTimeMs, settings.playerName || 'NETRUNNER')
                    .then(() => console.log('Score submitted automatically'))
                    .catch(err => console.error('Auto-submit failed:', err));
            }
        } else {
            setShowWin(true);
        }
        const data = await getWinningCommentary(moves, grid, lang);
        setWinData(data);
    };

    const requestHint = async () => {
        if (loadingHint || isWon) return;
        setLoadingHint(true);
        setUsedHint(true); // Mark as used
        playSound('click');
        const hintText = await getGameHint(grid, lang);
        setHint(hintText);
        setLoadingHint(false);
        setTimeout(() => setHint(null), 8000);
    };

    // Power-up handlers
    const handleUsePowerup = useCallback((type: PowerupType) => {
        if (isWon) return;

        switch (type) {
            case 'hint': {
                // Use hint from inventory
                if (usePowerup('hint', mode)) {
                    setPowerupInventory(getInventory());
                    setUsedHint(true);
                    haptic.powerupUse();

                    // Get a hintable tile and highlight it
                    const hintData = getHintableTile();
                    if (hintData) {
                        setHintHighlight({ position: hintData.position, rotation: hintData.correctRotation });
                        // Auto-apply after a brief highlight
                        setTimeout(() => {
                            applyHint(hintData.position.r, hintData.position.c, hintData.correctRotation);
                            setHintHighlight(null);
                        }, 500);
                    }
                }
                break;
            }
            case 'undo': {
                if (canUndo && usePowerup('undo', mode)) {
                    setPowerupInventory(getInventory());
                    undoLastMove();
                }
                break;
            }
            case 'freeze': {
                // Freeze is handled in SpeedRunMode directly
                // This is just for display purposes
                playSound('click');
                break;
            }
            case 'coinBoost': {
                // Coin boost is passive, nothing to do
                break;
            }
        }
    }, [isWon, mode, canUndo, getHintableTile, applyHint, undoLastMove]);

    // Refresh inventory when shop closes or game starts
    useEffect(() => {
        setPowerupInventory(getInventory());
    }, [showShop, currentKey]);

    const handleStartGame = () => {
        setShowIntro(false);
        startAmbience();
        playSound('power');
        startTimeRef.current = Date.now();
        setPowerupInventory(getInventory()); // Refresh on game start

        // Log game start for analytics
        logGameStart(mode, campaignLevel?.id).catch(err => console.warn('[App] Game start log failed:', err));
    };

    const handleModeSwitch = (newMode: GameMode) => {
        // Log mode change for analytics
        logModeChange(mode, newMode).catch(err => console.warn('[App] Mode change log failed:', err));

        setMode(newMode);

        if (newMode === 'PRACTICE') {
            setPracticeSeed(Date.now().toString());
            setShowIntro(true);
        } else if (newMode === 'DAILY') {
            setShowIntro(true);
        } else if (newMode === 'CAMPAIGN') {
            setCampaignLevel(null); // Reset level selection to show menu
            setShowIntro(false); // Campaign doesn't have the standard intro modal
        } else if (newMode === 'ENDLESS') {
            setShowIntro(false); // Endless has its own UI
        } else if (newMode === 'SPEEDRUN') {
            setShowIntro(false); // SpeedRun has its own UI
        } else if (newMode === 'WEEKLY') {
            setShowIntro(true); // Weekly uses similar intro
        }

        setShowWin(false);
        stopAmbience();
    };

    const handleCampaignLevelSelect = (level: CampaignLevel) => {
        setCampaignLevel(level);
        // We don't need to manually reset grid here, currentKey dependency in useGameState handles it
        startAmbience();
    };

    const copyShare = () => {
        let modeText = t.shareTemplate.practice;
        if (mode === 'DAILY') modeText = `${t.shareTemplate.daily} ${currentKey}`;
        if (mode === 'CAMPAIGN') modeText = `Campaign ${campaignLevel?.title} (${lastStars}★)`;

        const text = `${t.title} ${modeText}\n${moves} ${t.shareTemplate.moves}\n⚡ SYSTEM HACKED`;
        navigator.clipboard.writeText(text);
        alert(t.win.shareText);
    };

    const nextLevel = () => {
        setShowWin(false);
        setWinData(null);
        setUnlockedBadges([]);
        setUsedHint(false);

        if (mode === 'PRACTICE') {
            setPracticeSeed(Date.now().toString());
            startAmbience();
        } else if (mode === 'CAMPAIGN' && campaignLevel) {
            const nextId = getNextLevelId(campaignLevel.id);
            if (nextId) {
                // Find the full object
                let found = null;
                for (const ch of CAMPAIGN_CHAPTERS) {
                    const lvl = ch.levels.find(l => l.id === nextId);
                    if (lvl) found = lvl;
                }
                if (found) {
                    setCampaignLevel(found);
                    startAmbience();
                } else {
                    setCampaignLevel(null); // Return to menu if complete
                }
            } else {
                setCampaignLevel(null); // End of campaign
            }
        }
    }

    // Calculate current stars for header preview
    const currentRunStars = mode === 'CAMPAIGN' && campaignLevel
        ? calculateStarsForRun(moves, campaignLevel.parMoves)
        : undefined;

    // Render Logic for Main Content
    const renderMainContent = () => {
        // 1. Loading
        if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono animate-pulse">{t.status.initializing}</div>;

        // 2. Campaign Menu (Special Case)
        if (mode === 'CAMPAIGN' && !campaignLevel) {
            return (
                <div className="flex-1 w-full flex items-start justify-center overflow-y-auto">
                    <CampaignMenu
                        progress={campaignProgress}
                        onSelectLevel={handleCampaignLevelSelect}
                        lang={lang}
                        onBack={() => handleModeSwitch('DAILY')} // Fallback to Daily
                    />
                </div>
            );
        }

        // 3. Endless Mode (Full Screen)
        if (mode === 'ENDLESS') {
            return (
                <EndlessMode
                    lang={lang}
                    onExit={() => handleModeSwitch('DAILY')}
                />
            );
        }

        // 4. Speed Run Mode (Full Screen)
        if (mode === 'SPEEDRUN') {
            return (
                <SpeedRunMode
                    lang={lang}
                    onExit={() => handleModeSwitch('DAILY')}
                />
            );
        }

        // 5. Game Board
        return (
            <main className="flex-1 w-full max-w-lg p-2 flex flex-col items-center justify-center gap-4">

                {/* Hint Display */}
                <div className="h-6 flex items-center justify-center w-full px-4">
                    {hint && <div className="text-xs font-mono text-yellow-300 bg-yellow-900/30 px-3 py-1 rounded border border-yellow-600/50 animate-in fade-in slide-in-from-top-2">{hint}</div>}
                </div>

                {/* Grid */}
                <div
                    className={`grid gap-0.5 p-1 bg-slate-900 rounded-xl shadow-2xl border transition-all duration-1000 ${isWon ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]' : 'border-slate-800'}`}
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: '100%', aspectRatio: '1/1' }}
                >
                    {grid.map((row, r) => row.map((tile, c) => {
                        const isHinted = hintHighlight?.position.r === r && hintHighlight?.position.c === c;
                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`w-full h-full transition-all ${isHinted ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900 animate-pulse' : ''}`}
                            >
                                <Tile tile={tile} onClick={() => onTileClick(r, c)} isWon={isWon} charges={charges} row={r} />
                            </div>
                        );
                    }))}
                </div>

                {/* Power-up Bar */}
                {!isWon && (powerupInventory.hints > 0 || powerupInventory.undos > 0) && (
                    <div className="w-full flex justify-center">
                        <PowerupBar
                            inventory={powerupInventory}
                            lang={lang}
                            onUsePowerup={handleUsePowerup}
                            disabled={isWon}
                            showFreeze={false}
                        />
                    </div>
                )}

                <GameControls
                    isWon={isWon}
                    loadingHint={loadingHint}
                    mode={mode === 'DAILY' ? 'DAILY' : 'PRACTICE'} // Campaign uses Practice controls (no special buttons needed yet)
                    charges={charges}
                    lang={lang}
                    onRequestHint={requestHint}
                    onReset={resetGame}
                    onNewLevel={nextLevel}
                />

                {theme && mode !== 'CAMPAIGN' && <div className="text-center opacity-40 mt-2"><p className="text-[10px] font-mono tracking-[0.2em] text-cyan-500 uppercase">{theme.name}</p></div>}
            </main>
        );
    };

    return (
        <div className="min-h-screen font-sans flex flex-col items-center" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
            {showHackEffect && <CyberpunkOverlay onComplete={() => { setShowHackEffect(false); setShowWin(true); }} lang={lang} />}

            <Header
                moves={moves}
                mode={mode}
                lang={lang}
                setLang={(l) => { setLang(l); playSound('click'); }}
                setMode={handleModeSwitch}
                onOpenProfile={() => setShowProfile(true)}
                onOpenTheme={() => setShowTheme(true)}
                onOpenSettings={() => setShowSettings(true)}
                onOpenLeaderboard={() => setShowLeaderboard(true)}
                onOpenAchievements={() => setShowAchievements(true)}
                onOpenRewards={() => setShowRewards(true)}
                onOpenShop={() => setShowShop(true)}
                profile={profile}
                campaignLevel={campaignLevel}
                currentStars={currentRunStars}
            />

            {renderMainContent()}

            {/* Modals */}
            <Modal isOpen={showIntro} onClose={() => setShowIntro(false)} title={mode === 'DAILY' ? t.intro.dailyTitle : t.intro.simTitle}>
                <div className="space-y-3">
                    <div className="text-sm text-slate-400 italic border-l-2 border-cyan-500 pl-3">"{theme?.description || "Color mixing protocols engaged."}"</div>

                    {mode === 'DAILY' && <MissionBoard missions={missions} stats={stats} lang={lang} />}

                    <div className="bg-slate-800 p-3 rounded text-xs space-y-2 text-slate-400">
                        <div className="flex items-center gap-2 text-white bg-slate-900/50 p-2 rounded"><span className="text-cyan-400 font-bold">CYAN</span> + <span className="text-fuchsia-400 font-bold">MAGENTA</span> = WHITE</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>🔹 {t.intro.li1}</div>
                            <div>⚡ {t.intro.li2}</div>
                            <div>🚫 {t.intro.li3}</div>
                        </div>
                    </div>
                    <button onClick={handleStartGame} className={`w-full py-3 font-bold rounded-lg transition-all text-white ${mode === 'DAILY' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-fuchsia-600 hover:bg-fuchsia-500'}`}>{mode === 'DAILY' ? t.buttons.startDaily : t.buttons.startSim}</button>
                </div>
            </Modal>

            <ProfileModal
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
                profile={profile}
                lang={lang}
            />

            <ThemeSelector
                isOpen={showTheme}
                onClose={() => setShowTheme(false)}
                lang={lang}
            />

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                lang={lang}
                setLang={(l) => { setLang(l); playSound('click'); }}
            />

            <AchievementsModal
                isOpen={showAchievements}
                onClose={() => setShowAchievements(false)}
                profile={profile}
                lang={lang}
            />

            <LeaderboardModal
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                lang={lang}
                dateKey={currentKey}
                // Only pass score if game is won today and it's daily mode
                playerMoves={isWon && mode === 'DAILY' ? moves : undefined}
                playerTime={isWon && mode === 'DAILY' ? gameTimeMs : undefined}
            />

            <DailyRewardModal
                isOpen={showRewards}
                onClose={() => setShowRewards(false)}
                lang={lang}
            />

            <ShopModal
                isOpen={showShop}
                onClose={() => setShowShop(false)}
                lang={lang}
            />

            {showWin && (
                <>
                    <ConfettiCanvas />
                    <TerminalWinScreen
                        moves={moves}
                        timeMs={gameTimeMs}
                        unlockedBadges={unlockedBadges}
                        winAnalysis={winData}
                        lang={lang}
                        onShare={copyShare}
                        onNext={nextLevel}
                        onClose={() => { setShowWin(false); if (mode === 'CAMPAIGN') setCampaignLevel(null); }}
                        mode={mode}
                        xpGained={lastXpGained}
                        missions={mode === 'DAILY' ? missions : undefined}
                        completedMissionIds={completedMissionIds}
                        streak={stats.streak}
                        campaignStars={lastStars}
                        hasNextLevel={mode === 'CAMPAIGN' && campaignLevel ? !!getNextLevelId(campaignLevel.id) : false}
                        dateKey={currentKey}
                    />
                </>
            )}
            {/* Admin Dashboard - Access with Ctrl + Shift + A */}
            <AdminDashboard
                isOpen={showAdmin}
                onClose={() => setShowAdmin(false)}
            />

            {/* Username Modal - Shows on first visit */}
            <UsernameModal
                isOpen={showUsernameModal}
                onComplete={(username) => {
                    setPlayerUsername(username);
                    setShowUsernameModal(false);
                }}
                isFirstTime={true}
            />
        </div>
    );
};

export default App;
