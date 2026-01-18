import React, { useState, useEffect, useCallback } from 'react';
import {
    isAdmin,
    enableAdminMode,
    disableAdminMode,
    checkAdminSession,
    getAdminSummary,
    getDailyStats,
    getCountryStats,
    getEventStats,
    getErrorLogs,
    getGameModeStats,
    getRecentUsers,
    getRetentionStats,
    getSessionStats,
    getFunnelStats,
    getABTestResults,
    getRealtimeStats,
    getStatsForDateRange,
    banUser,
    warnUser,
    resetUserScore,
    sendAdminBroadcast,
    exportToCSV,
    AdminSummary,
    DailyStatsRow,
    CountryStats,
    EventStats,
    UserSummary,
    RetentionStats,
    SessionStats,
    FunnelStage,
    ABTestResult,
    RealtimeStats,
    DateRangeStats
} from '../services/adminService';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Data states
    const [summary, setSummary] = useState<AdminSummary | null>(null);
    const [dailyStats, setDailyStats] = useState<DailyStatsRow[]>([]);
    const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
    const [eventStats, setEventStats] = useState<EventStats[]>([]);
    const [errorLogs, setErrorLogs] = useState<any[]>([]);
    const [gameModeStats, setGameModeStats] = useState<{ mode: string; count: number; wins: number }[]>([]);
    const [users, setUsers] = useState<UserSummary[]>([]);

    // Advanced analytics states
    const [retention, setRetention] = useState<RetentionStats | null>(null);
    const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
    const [funnelStats, setFunnelStats] = useState<FunnelStage[]>([]);
    const [abTestResults, setAbTestResults] = useState<ABTestResult[]>([]);
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);

    // Users tab state
    const [userSearch, setUserSearch] = useState('');
    const [userSort, setUserSort] = useState<'recent' | 'games' | 'level'>('recent');
    const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
    const [moderationReason, setModerationReason] = useState('');

    // Broadcast state
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastBody, setBroadcastBody] = useState('');

    // Date range state
    const [dateStart, setDateStart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [dateEnd, setDateEnd] = useState(() => new Date().toISOString().split('T')[0]);
    const [dateRangeStats, setDateRangeStats] = useState<DateRangeStats | null>(null);

    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'events' | 'errors' | 'tools'>('overview');

    // Check session on mount
    useEffect(() => {
        if (isOpen && checkAdminSession()) {
            setAuthenticated(true);
            loadData();
        }
    }, [isOpen]);

    // Real-time stats polling
    useEffect(() => {
        if (!authenticated || !isOpen) return;

        const interval = setInterval(async () => {
            const realtime = await getRealtimeStats();
            if (realtime) setRealtimeStats(realtime);
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [authenticated, isOpen]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [
                summaryData, daily, countries, events, errors, modes, userList,
                retentionData, sessions, funnel, abTests, realtime
            ] = await Promise.all([
                getAdminSummary(),
                getDailyStats(7),
                getCountryStats(),
                getEventStats(),
                getErrorLogs(50),
                getGameModeStats(),
                getRecentUsers(100),
                getRetentionStats(),
                getSessionStats(),
                getFunnelStats(7),
                getABTestResults(),
                getRealtimeStats()
            ]);

            setSummary(summaryData);
            setDailyStats(daily);
            setCountryStats(countries);
            setEventStats(events);
            setErrorLogs(errors);
            setGameModeStats(modes);
            setUsers(userList);
            setRetention(retentionData);
            setSessionStats(sessions);
            setFunnelStats(funnel);
            setAbTestResults(abTests);
            setRealtimeStats(realtime);
        } catch (err) {
            console.error('[Admin] Failed to load data:', err);
        }
        setLoading(false);
    };

    const handleDateRangeSearch = async () => {
        const stats = await getStatsForDateRange(dateStart, dateEnd);
        setDateRangeStats(stats);
    };

    const handleUserAction = async (action: 'ban' | 'warn' | 'reset') => {
        if (!selectedUser) return;

        let success = false;
        if (action === 'ban') success = await banUser(selectedUser.id, moderationReason);
        else if (action === 'warn') success = await warnUser(selectedUser.id, moderationReason);
        else if (action === 'reset') success = await resetUserScore(selectedUser.id);

        if (success) {
            alert(`Kullanıcı ${action} işlemi başarılı!`);
            setSelectedUser(null);
            setModerationReason('');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastTitle || !broadcastBody) return;
        const success = await sendAdminBroadcast(broadcastTitle, broadcastBody);
        if (success) {
            alert('Bildirim gönderildi!');
            setBroadcastTitle('');
            setBroadcastBody('');
        }
    };

    const handleLogin = () => {
        if (enableAdminMode(password)) {
            setAuthenticated(true);
            setError('');
            loadData();
        } else {
            setError('Yanlış şifre');
        }
    };

    const handleLogout = () => {
        disableAdminMode();
        setAuthenticated(false);
        setPassword('');
    };

    if (!isOpen) return null;

    // Login Screen
    if (!authenticated) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-red-500/50 rounded-xl p-6 max-w-sm w-full">
                    <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                        🔐 Admin Girişi
                    </h2>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        placeholder="Admin şifresi..."
                        className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white mb-3"
                    />

                    {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            onClick={handleLogin}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold"
                        >
                            Giriş
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                        >
                            İptal
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="fixed inset-0 z-50 bg-black/95 overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-red-500/30 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-red-400 flex items-center gap-2">
                    ⚙️ Admin Dashboard
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                    >
                        {loading ? '...' : '🔄 Yenile'}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-sm text-red-400"
                    >
                        Çıkış
                    </button>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Real-time indicator */}
            {realtimeStats && (
                <div className="sticky top-16 bg-slate-800/80 backdrop-blur px-4 py-2 flex items-center gap-4 text-sm border-b border-slate-700">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-green-400 font-medium">{realtimeStats.activeNow}</span>
                        <span className="text-slate-400">şimdi aktif</span>
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">{realtimeStats.activeLast15Min} (15dk)</span>
                    <span className="text-slate-400">{realtimeStats.activeLast1Hour} (1s)</span>
                    <span className="text-slate-400">{realtimeStats.gamesLast1Hour} oyun/saat</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-700 px-4 overflow-x-auto">
                {(['overview', 'analytics', 'users', 'events', 'errors', 'tools'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab
                            ? 'border-red-400 text-red-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab === 'overview' && '📊 Genel'}
                        {tab === 'analytics' && '📈 Analytics'}
                        {tab === 'users' && '👥 Kullanıcılar'}
                        {tab === 'events' && '🎯 Olaylar'}
                        {tab === 'errors' && '🐛 Hatalar'}
                        {tab === 'tools' && '🛠️ Araçlar'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4 max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Yükleniyor...</div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard
                                        label="Toplam Kullanıcı"
                                        value={summary?.totalUsers || 0}
                                        icon="👥"
                                    />
                                    <StatCard
                                        label="Bugün Aktif"
                                        value={summary?.activeToday || 0}
                                        icon="🟢"
                                    />
                                    <StatCard
                                        label="Toplam Oyun"
                                        value={summary?.totalGamesPlayed || 0}
                                        icon="🎮"
                                    />
                                    <StatCard
                                        label="Ort. Oyun/Kullanıcı"
                                        value={summary?.avgGamesPerUser || 0}
                                        icon="📊"
                                    />
                                </div>

                                {/* Daily Stats Table */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-3">📅 Son 7 Gün</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-slate-500 border-b border-slate-700">
                                                    <th className="text-left py-2">Tarih</th>
                                                    <th className="text-right">Kullanıcı</th>
                                                    <th className="text-right">Ziyaret</th>
                                                    <th className="text-right">Oyun</th>
                                                    <th className="text-right">Kazanma</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dailyStats.map((day, i) => (
                                                    <tr key={i} className="border-b border-slate-700/50">
                                                        <td className="py-2">{day.date}</td>
                                                        <td className="text-right">{day.uniqueUsers}</td>
                                                        <td className="text-right">{day.totalVisits}</td>
                                                        <td className="text-right">{day.totalGames}</td>
                                                        <td className="text-right">{day.totalWins}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Game Modes & Countries Side by Side */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Game Modes */}
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-3">🎮 Oyun Modları</h3>
                                        <div className="space-y-2">
                                            {gameModeStats.map((m, i) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <span className="text-slate-400">{m.mode}</span>
                                                    <div className="flex gap-4 text-sm">
                                                        <span>{m.count} oyun</span>
                                                        <span className="text-green-400">{m.wins} kazanma</span>
                                                        <span className="text-slate-500">
                                                            ({m.count > 0 ? Math.round((m.wins / m.count) * 100) : 0}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Countries */}
                                    <div className="bg-slate-800/50 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-slate-300 mb-3">🌍 Ülkeler</h3>
                                        <div className="space-y-2">
                                            {countryStats.slice(0, 5).map((c, i) => (
                                                <div key={i} className="flex justify-between items-center">
                                                    <span className="text-slate-400">{c.country || 'Bilinmiyor'}</span>
                                                    <div className="flex gap-4 text-sm">
                                                        <span>{c.visitCount} ziyaret</span>
                                                        <span className="text-cyan-400">{c.uniqueUsers} kullanıcı</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Events Tab */}
                        {activeTab === 'events' && (
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3">📈 Event İstatistikleri (Son 7 Gün)</h3>
                                <div className="space-y-2">
                                    {eventStats.map((e, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700/50">
                                            <span className="font-mono text-cyan-400">{e.eventType}</span>
                                            <div className="flex gap-6 text-sm">
                                                <span>{e.eventCount} event</span>
                                                <span className="text-slate-400">{e.uniqueUsers} kullanıcı</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Errors Tab */}
                        {activeTab === 'errors' && (
                            <div className="bg-slate-800/50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-slate-300 mb-3">🐛 Son Hatalar</h3>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {errorLogs.length === 0 ? (
                                        <p className="text-slate-500 text-center py-4">Hata kaydı yok 🎉</p>
                                    ) : (
                                        errorLogs.map((err, i) => (
                                            <div key={i} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-red-400 font-mono text-sm">{err.message}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(err.created_at).toLocaleString('tr')}
                                                    </span>
                                                </div>
                                                {err.component && (
                                                    <span className="text-xs text-slate-400">
                                                        Component: {err.component}
                                                    </span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="space-y-4">
                                {/* Search and Sort Controls */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Kullanıcı ara (ID veya isim)..."
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <select
                                            value={userSort}
                                            onChange={(e) => setUserSort(e.target.value as any)}
                                            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm"
                                        >
                                            <option value="recent">En Yeni</option>
                                            <option value="games">En Çok Oyun</option>
                                            <option value="level">En Yüksek Seviye</option>
                                        </select>
                                    </div>
                                </div>

                                {/* User Count */}
                                <div className="text-sm text-slate-400">
                                    Toplam {users.length} kullanıcı
                                    {userSearch && ` (${users.filter(u =>
                                        u.id.includes(userSearch.toLowerCase()) ||
                                        u.username?.toLowerCase().includes(userSearch.toLowerCase())
                                    ).length} sonuç)`}
                                </div>

                                {/* User List */}
                                <div className="bg-slate-800/50 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-700 text-left">
                                                <th className="px-4 py-3">Kullanıcı</th>
                                                <th className="px-4 py-3 text-center">Seviye</th>
                                                <th className="px-4 py-3 text-center">Oyunlar</th>
                                                <th className="px-4 py-3 text-center">Kazanma</th>
                                                <th className="px-4 py-3 text-center">Ziyaret</th>
                                                <th className="px-4 py-3 text-right">Son Görülme</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users
                                                .filter(u =>
                                                    !userSearch ||
                                                    u.id.includes(userSearch.toLowerCase()) ||
                                                    u.username?.toLowerCase().includes(userSearch.toLowerCase())
                                                )
                                                .sort((a, b) => {
                                                    if (userSort === 'games') return b.totalGames - a.totalGames;
                                                    if (userSort === 'level') return b.level - a.level;
                                                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                                })
                                                .slice(0, 50)
                                                .map((user, i) => (
                                                    <tr
                                                        key={user.id}
                                                        className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-white font-medium">
                                                                    {user.username || 'Anonim'}
                                                                </span>
                                                                <span className="text-xs text-slate-500 font-mono">
                                                                    {user.id.substring(0, 8)}...
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold">
                                                                LVL {user.level}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-slate-300">
                                                            {user.totalGames}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="text-green-400">{user.totalWins}</span>
                                                            {user.totalGames > 0 && (
                                                                <span className="text-slate-500 text-xs ml-1">
                                                                    ({Math.round((user.totalWins / user.totalGames) * 100)}%)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-cyan-400">
                                                            {user.visitCount || 0}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-xs text-slate-400">
                                                            {formatRelativeTime(user.lastSeen)}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>

                                    {users.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            Henüz kullanıcı yok
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                {/* Retention Stats */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Retention Rates</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                                            <div className="text-2xl font-bold text-green-400">{retention?.day1Retention || 0}%</div>
                                            <div className="text-xs text-slate-400">Day 1</div>
                                            <div className="text-xs text-slate-500">{retention?.day1Count || 0} kullanıcı</div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                                            <div className="text-2xl font-bold text-yellow-400">{retention?.day7Retention || 0}%</div>
                                            <div className="text-xs text-slate-400">Day 7</div>
                                            <div className="text-xs text-slate-500">{retention?.day7Count || 0} kullanıcı</div>
                                        </div>
                                        <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-400">{retention?.day30Retention || 0}%</div>
                                            <div className="text-xs text-slate-400">Day 30</div>
                                            <div className="text-xs text-slate-500">{retention?.day30Count || 0} kullanıcı</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Stats */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">⏱️ Session İstatistikleri (Son 7 Gün)</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-white">{sessionStats?.totalSessions || 0}</div>
                                            <div className="text-xs text-slate-400">Toplam Oyun</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-cyan-400">{sessionStats?.avgDurationMinutes || 0} dk</div>
                                            <div className="text-xs text-slate-400">Ort. Süre</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-yellow-400">{sessionStats?.avgMovesPerGame || 0}</div>
                                            <div className="text-xs text-slate-400">Ort. Hamle</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-green-400">{sessionStats?.winRate || 0}%</div>
                                            <div className="text-xs text-slate-400">Kazanma Oranı</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Funnel Analysis */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">🔄 Dönüşüm Hunisi</h3>
                                    <div className="space-y-3">
                                        {funnelStats.map((stage, i) => (
                                            <div key={i} className="relative">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-white">{stage.name}</span>
                                                    <span className="text-sm text-slate-400">{stage.count} ({stage.rate}%)</span>
                                                </div>
                                                <div className="h-6 bg-slate-700 rounded overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                                        style={{ width: `${stage.rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* A/B Test Results */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">🧪 A/B Test Sonuçları</h3>
                                    {abTestResults.length === 0 ? (
                                        <p className="text-slate-500 text-center py-4">Aktif A/B testi yok</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-slate-400 border-b border-slate-700">
                                                        <th className="text-left py-2">Experiment</th>
                                                        <th className="text-left py-2">Variant</th>
                                                        <th className="text-right py-2">Kullanıcı</th>
                                                        <th className="text-right py-2">Event</th>
                                                        <th className="text-right py-2">Event/User</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {abTestResults.map((test, i) => (
                                                        <tr key={i} className="border-b border-slate-700/50">
                                                            <td className="py-2 font-mono text-cyan-400">{test.experiment_id}</td>
                                                            <td className="py-2">{test.variant}</td>
                                                            <td className="py-2 text-right">{test.user_count}</td>
                                                            <td className="py-2 text-right">{test.event_count}</td>
                                                            <td className="py-2 text-right text-green-400">{test.events_per_user}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Date Range Stats */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📅 Özel Tarih Aralığı</h3>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <input
                                            type="date"
                                            value={dateStart}
                                            onChange={(e) => setDateStart(e.target.value)}
                                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                        />
                                        <span className="text-slate-400 self-center">→</span>
                                        <input
                                            type="date"
                                            value={dateEnd}
                                            onChange={(e) => setDateEnd(e.target.value)}
                                            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                                        />
                                        <button
                                            onClick={handleDateRangeSearch}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white text-sm"
                                        >
                                            Ara
                                        </button>
                                    </div>
                                    {dateRangeStats && (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                                            <div>
                                                <div className="text-lg font-bold text-white">{dateRangeStats.uniqueUsers}</div>
                                                <div className="text-xs text-slate-400">Kullanıcı</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-cyan-400">{dateRangeStats.totalVisits}</div>
                                                <div className="text-xs text-slate-400">Ziyaret</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-yellow-400">{dateRangeStats.totalGames}</div>
                                                <div className="text-xs text-slate-400">Oyun</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-green-400">{dateRangeStats.totalWins}</div>
                                                <div className="text-xs text-slate-400">Kazanma</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-purple-400">{dateRangeStats.avgMoves}</div>
                                                <div className="text-xs text-slate-400">Ort. Hamle</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tools Tab */}
                        {activeTab === 'tools' && (
                            <div className="space-y-6">
                                {/* Export Data */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📥 Veri Dışa Aktar (CSV)</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => exportToCSV(users, 'kullanicilar')}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white text-sm"
                                        >
                                            👥 Kullanıcılar
                                        </button>
                                        <button
                                            onClick={() => exportToCSV(dailyStats, 'gunluk_istatistik')}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white text-sm"
                                        >
                                            📊 Günlük İstatistik
                                        </button>
                                        <button
                                            onClick={() => exportToCSV(eventStats, 'olaylar')}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white text-sm"
                                        >
                                            🎯 Olaylar
                                        </button>
                                        <button
                                            onClick={() => exportToCSV(errorLogs, 'hatalar')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
                                        >
                                            🐛 Hatalar
                                        </button>
                                    </div>
                                </div>

                                {/* Admin Broadcast */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">📢 Toplu Bildirim Gönder</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={broadcastTitle}
                                            onChange={(e) => setBroadcastTitle(e.target.value)}
                                            placeholder="Başlık..."
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                        />
                                        <textarea
                                            value={broadcastBody}
                                            onChange={(e) => setBroadcastBody(e.target.value)}
                                            placeholder="Mesaj içeriği..."
                                            rows={3}
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white resize-none"
                                        />
                                        <button
                                            onClick={handleBroadcast}
                                            disabled={!broadcastTitle || !broadcastBody}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded text-white text-sm"
                                        >
                                            Gönder
                                        </button>
                                    </div>
                                </div>

                                {/* User Moderation */}
                                <div className="bg-slate-800/50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-4">⚠️ Kullanıcı Yönetimi</h3>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Kullanıcı ID veya isim ara..."
                                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                                            onChange={(e) => {
                                                const search = e.target.value.toLowerCase();
                                                const found = users.find(u =>
                                                    u.id.includes(search) ||
                                                    u.username?.toLowerCase().includes(search)
                                                );
                                                setSelectedUser(found || null);
                                            }}
                                        />
                                        {selectedUser && (
                                            <div className="p-3 bg-slate-700/50 rounded-lg">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div>
                                                        <span className="text-white font-medium">{selectedUser.username || 'Anonim'}</span>
                                                        <span className="text-xs text-slate-400 ml-2">{selectedUser.id.substring(0, 12)}...</span>
                                                    </div>
                                                    <span className="text-xs text-yellow-400">LVL {selectedUser.level}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={moderationReason}
                                                    onChange={(e) => setModerationReason(e.target.value)}
                                                    placeholder="Sebep (opsiyonel)..."
                                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm mb-3"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUserAction('warn')}
                                                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-white text-sm"
                                                    >
                                                        ⚠️ Uyar
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserAction('reset')}
                                                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-white text-sm"
                                                    >
                                                        🔄 Skor Sıfırla
                                                    </button>
                                                    <button
                                                        onClick={() => handleUserAction('ban')}
                                                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
                                                    >
                                                        🚫 Banla
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Helper component
const StatCard: React.FC<{ label: string; value: number; icon: string }> = ({ label, value, icon }) => (
    <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col items-center">
        <span className="text-2xl mb-1">{icon}</span>
        <span className="text-2xl font-bold text-white">{value.toLocaleString()}</span>
        <span className="text-xs text-slate-400">{label}</span>
    </div>
);

// Helper function for relative time display
const formatRelativeTime = (dateStr: string): string => {
    if (!dateStr) return 'Bilinmiyor';

    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return date.toLocaleDateString('tr');
};
