import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Zap,
    Building2,
    BarChart3,
    Home,
    ArrowRight,
    Leaf,
    Info,
    CheckCircle2,
    TrendingDown,
    Calculator,
    Menu,
    X,
    Loader2,
    History,
    Lightbulb,
    Cpu,
    Server,
    ChevronDown, // 新增：用於下拉選單的箭頭圖示
    Droplets,    // 新增：用水資料圖示
    Activity,    // 新增：營運率圖示
    Hotel        // 新增：旅館圖示
} from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// 导入新的 Dashboard 组件
import {
    MetricCard,
    GaugeChart,
    EfficiencyTable
} from './components/DashboardComponents';

import {
    ComparisonRange,
    ElectricityTrendChart,
    EquipmentAnalysis
} from './components/DashboardCharts';

import { BERSeTable } from './components/BERSeTable';
import { DEMO_DATA } from './data/demoData';

// --- 主要應用程式元件 ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [dashboardRecord, setDashboardRecord] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 新增登入狀態
    const [isDemoMode, setIsDemoMode] = useState(false); // 新增 Demo 模式狀態
    const loading = false;

    const handleNavbarItemClick = useCallback(() => {
        // placeholder for future cross-component effects when nav item is selected
    }, []);

    const navigateTo = (page) => {
        handleNavbarItemClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(page);
    };

    const handleAssessmentComplete = (assessment) => {
        setDashboardRecord(assessment);
        setDashboardError(null);
        setIsLoggedIn(true); // 評估完成即視為登入
        setIsDemoMode(false); // 退出 Demo 模式
        navigateTo('dashboard');
    };

    const handleVerifyDashboard = async (email, name) => {
        setDashboardLoading(true);
        setDashboardError(null);
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('*')
                .eq('email', email)
                .eq('contact_name', name)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            if (data && data.length > 0) {
                setDashboardRecord(data[0]);
                setIsLoggedIn(true); // 登入成功
                setIsDemoMode(false); // 退出 Demo 模式
            } else {
                setDashboardError('找不到符合條件的評估記錄，請確認 Email 與姓名是否正確。');
                setIsLoggedIn(false);
            }
        } catch (err) {
            console.error('Dashboard verify error:', err);
            setDashboardError('查詢時發生錯誤，請稍後再試。');
            setIsLoggedIn(false);
        } finally {
            setDashboardLoading(false);
        }
    };

    const handleDemoMode = () => {
        setDashboardRecord(DEMO_DATA);
        setDashboardError(null);
        setIsLoggedIn(true); // Demo 模式也視為登入
        setIsDemoMode(true); // 進入 Demo 模式
        navigateTo('dashboard');
    };

    const handleLogout = () => {
        setDashboardRecord(null);
        setDashboardError(null);
        setIsLoggedIn(false);
        setIsDemoMode(false);
        navigateTo('home');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <Loader2 className="animate-spin mr-2" /> 系統初始化中...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar
                currentPage={currentPage}
                navigateTo={navigateTo}
                onNavItemClick={handleNavbarItemClick}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
            />

            {/* --- 頁面內容渲染 --- */}
            <main className="relative z-10 min-h-screen flex flex-col">
                {currentPage === 'home' && <HomePage navigateTo={navigateTo} />}

                {/* 其他頁面的容器 */}
                {(currentPage === 'form' || currentPage === 'dashboard' || currentPage === 'test') && (
                    <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full flex-grow animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {currentPage === 'form' && (
                            <AnalysisForm
                                onComplete={handleAssessmentComplete}
                                onRetry={() => {
                                    setDashboardRecord(null);
                                    setDashboardError(null);
                                    setIsLoggedIn(false);
                                    setIsDemoMode(false);
                                }}
                            />
                        )}
                        {currentPage === 'dashboard' && (
                            <Dashboard
                                data={dashboardRecord}
                                onRetry={() => navigateTo('form')}
                                onVerify={handleVerifyDashboard}
                                onDemo={handleDemoMode}
                                loading={dashboardLoading}
                                error={dashboardError}
                                isLoggedIn={isLoggedIn}
                                isDemoMode={isDemoMode}
                            />
                        )}
                        {/* 临时测试：验证新组件导入 */}
                        {currentPage === 'test' && (
                            <div className="p-8 space-y-6">
                                <h1 className="text-3xl font-bold text-white">组件导入测试</h1>
                                <MetricCard
                                    title="测试卡片"
                                    value="150"
                                    unit="test"
                                    icon={Zap}
                                    color="blue"
                                />
                                <button
                                    onClick={() => navigateTo('home')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    返回首页
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <footer className="border-t border-white/10 py-8 text-center text-slate-400 text-sm mt-auto backdrop-blur-sm">
                    <p>© 2025 Delta Energy Services.</p>
                </footer>
            </main>

        </div>
    );
}

// --- 元件 1: 統一風格的導航列 ---
function Navbar({ currentPage, navigateTo, onNavItemClick = () => { } }) {
    const [isHovered, setIsHovered] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 新增狀態用於控制捲動時的顯示/隱藏
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);


    const collapseNavbar = useCallback(() => {
        setIsHovered(false);
        setActiveDropdown(null);
        setIsMenuOpen(false);
    }, []);

    const handleNavSelection = useCallback((pageId) => {
        collapseNavbar();
        onNavItemClick?.(pageId);
        navigateTo(pageId);
    }, [collapseNavbar, navigateTo, onNavItemClick]);

    // --- 捲動處理邏輯 ---
    const handleScroll = () => {
        // 鎖定：如果行動選單開啟或正在懸停，則不隱藏
        if (isMenuOpen || isHovered) return;

        const currentScrollY = window.scrollY;

        // 只有在向下捲動超過 50px 才開始隱藏檢查
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY) {
                // 向下捲動: 隱藏 navbar
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                // 向上捲動: 顯示 navbar
                setIsVisible(true);
            }
        } else {
            // 在頂部附近 (50px 內)，始終顯示
            setIsVisible(true);
        }

        // 更新上一次捲動位置
        if (currentScrollY >= 0) {
            setLastScrollY(currentScrollY);
        }
    };

    // 設置捲動事件監聽器，使用 requestAnimationFrame 優化效能
    useEffect(() => {
        let ticking = false;
        const updateScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', updateScroll);

        // 清理函數
        return () => window.removeEventListener('scroll', updateScroll);
    }, [lastScrollY, isHovered, isMenuOpen]); // 依賴項包含相關狀態，確保獲取最新值


    const navItems = [
        {
            id: 'home',
            label: '首頁',
            desc: 'Delta Energy',
            detail: '台達能源整合服務，為您提供從 BERS 評級到淨零改善的一站式解決方案。',
            image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'form',
            label: 'BERS 快速評估',
            desc: '開始您的建築評估',
            detail: '依據台灣綠建築標準，透過 AI 初步檢視您的建築能效等級與耗能狀況。',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'dashboard',
            label: '分析報告',
            desc: '視覺化數據報告',
            detail: '不僅看分數，更看潛力。獲取台達專業的節能改善建議與 EMS 導入評估。',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400'
        },
    ];

    // 觸發亮色模式的條件：滑鼠懸停 或 手機選單打開
    const isLightMode = isHovered || isMenuOpen;
    // 判斷是否展開桌面版的下拉選單
    const isDropdownActive = activeDropdown && isHovered && !isMenuOpen;


    return (
        // 外部容器：負責固定定位、轉場效果和捲動隱藏/顯示
        <div
            className={`
        fixed top-0 left-0 right-0 z-50 flex justify-center px-4
        transition-transform duration-500 ease-in-out
        ${isVisible ? 'translate-y-0 pt-6' : '-translate-y-[150px] pt-6'} 
      `}
        >
            {/* 主容器：包含 Navbar 欄位和下拉選單內容。
        懸停事件移動到這個 `max-w-4xl` 的元素上，限制懸停範圍。
      */}
            <div
                className={`
          relative w-full max-w-4xl transition-all duration-500 ease-in-out overflow-hidden
          
          // 亮色模式/深色模式的背景和邊框
          ${isLightMode
                        ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/20 text-slate-900 border border-slate-100'
                        : 'bg-transparent border border-transparent text-white hover:bg-white/10 hover:border-white/10'
                    }

          // 圓角：展開時頂部圓角，關閉時四邊圓角
          ${isDropdownActive ? 'rounded-t-2xl rounded-b-3xl' : 'rounded-2xl'}
        `}
                onMouseEnter={() => setIsHovered(true)} // 懸停事件移動到此處
                onMouseLeave={collapseNavbar}
            >
                {/* Navbar 主體欄位 (固定高度部分) */}
                <nav className="flex items-center justify-between w-full px-8 py-4 z-10">
                    {/* Logo (DSE.bers) - 圖塊與名稱已更新 */}
                    <div
                        className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer z-10"
                        onClick={() => navigateTo('home')}
                    >
                        {/* 方形圓角深藍底 + 亮藍色三角形 SVG */}
                        <div className={`p-1.5 rounded-xl transition-colors bg-blue-900 text-blue-300 w-8 h-8 flex items-center justify-center`}>
                            <svg width="20" height="20" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                {/* 亮藍色三角形 (Polygon) */}
                                <polygon points="50,10 90,90 10,90" />
                            </svg>
                        </div>
                        {/* 名稱 DSE.bers */}
                        <span>DSE<span className={`hidden sm:inline font-light transition-colors ${isLightMode ? 'text-slate-400' : 'text-white/60'}`}>.bers</span></span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6 z-10">
                        {navItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown(item.id)}
                            >
                                <button
                                    onClick={() => handleNavSelection(item.id)}
                                    className={`
                    flex items-center gap-2 px-2 py-2 text-sm font-medium transition-all duration-300 border-b-2
                    
                    // 1. 當前頁面樣式：文字顏色變亮，底線透明
                    ${currentPage === item.id
                                            ? (isLightMode ? 'text-green-700 border-transparent' : 'text-green-400 border-transparent')
                                            // 修正：非當前頁面時，強制底線透明 (border-transparent)
                                            : (isLightMode
                                                ? 'text-slate-700 border-transparent'
                                                : 'text-white/80 border-transparent')
                                        }

                    // 2. 懸停樣式：文字黑色 + 深藍色底線 (覆蓋當前頁面的底線透明設定)
                    ${isLightMode
                                            ? 'hover:text-slate-900 hover:border-blue-700'
                                            : 'hover:text-white/90 hover:border-blue-500' // 暗色模式懸停
                                        }
                  `}
                                >
                                    {item.label}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className={`md:hidden p-2 z-10 ${isLightMode ? 'text-slate-600' : 'text-white'}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </nav>

                {/* Mega Menu Dropdown 內容 (放置在主容器內部，實現向下延伸) */}
                {isDropdownActive && (
                    <div className="hidden md:block w-full px-8 pb-8 pt-4 animate-in fade-in duration-300 z-40">
                        <div className="
              // 內容區背景為純白，以避免與主體背景（可能帶模糊）衝突
              bg-white/95 
              rounded-2xl 
              overflow-hidden flex
              shadow-inner shadow-slate-100/50
            ">
                            {navItems.map((item) => {
                                if (item.id !== activeDropdown) return null;
                                return (
                                    <div key={item.id} className="flex w-full">
                                        <div className="w-1/2 p-8 flex flex-col justify-center items-start text-left">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase mb-4">
                                                {item.label}
                                            </div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.desc}</h3>
                                            <p className="text-slate-500 mb-6 leading-relaxed text-sm">
                                                {item.detail}
                                            </p>
                                            <button
                                                onClick={() => handleNavSelection(item.id)}
                                                className="flex items-center gap-2 text-blue-600 font-bold hover:translate-x-1 transition-transform text-sm"
                                            >
                                                前往頁面 <ArrowRight size={16} />
                                            </button>
                                        </div>
                                        <div className="w-1/2 relative h-64">
                                            {/* 使用 item.image，但移除外部邊框和陰影，因為主容器已經處理 */}
                                            <img src={item.image} alt={item.label} className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Mobile Menu List */}
                {isMenuOpen && (
                    <div className="md:hidden w-full px-4 pb-4 mt-2 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-2 flex flex-col gap-1 overflow-hidden text-white">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavSelection(item.id)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-left w-full hover:bg-white/10
                  ${currentPage === item.id ? 'bg-green-600/20 text-green-400' : 'text-slate-200'}
                `}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- 元件 2: 首頁 ---
function HomePage({ navigateTo }) {
    return (
        <div className="flex-grow flex items-center justify-center pb-20 pt-32 px-4">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Delta Energy · 建築能效專家
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-8 tracking-tight animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                        從 BERS 評級，<br />
                        到 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-emerald-400">
                            淨零實踐
                        </span> 的完整路徑
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-light animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 border-l-4 border-blue-500/50 pl-6">
                        取得 BERS 標章只是第一步。<br />
                        台達能源整合 <strong className="text-white font-medium">AI 診斷</strong> 與 <strong className="text-white font-medium">EMS 智慧調控</strong>，
                        <br className="hidden md:block" />
                        為您提供從「建築健檢」到「設備優化」的一站式節能方案。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
                        <button
                            onClick={() => navigateTo('form')}
                            className="group relative overflow-hidden rounded-full bg-blue-600 text-white px-10 py-4 shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-3 font-bold text-lg">
                                開始 BERS 評估 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button className="px-10 py-4 rounded-full font-medium text-white border border-white/30 hover:bg-white/10 backdrop-blur-sm transition-colors flex items-center gap-2">
                            <Info size={18} />
                            預約專家諮詢
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-24 animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-500">
                    <GlassCard title="BERS 精準評級" desc="依據台灣綠建築評估手冊 (EEWH)，透過我們開發的 AI 引擎快速試算 EUI 指標，精準定位建築能效等級。" icon={<Leaf className="text-green-400" />} />
                    <GlassCard title="深度能耗診斷" desc="超越表面分數。深入分析空調、照明與動力設備的用電結構，識別潛在的「吃電怪獸」與改善熱點。" icon={<Zap className="text-yellow-400" />} />
                    <GlassCard title="提升方案導入" desc="這是台達的強項。提供 Delta EMS 能源管理系統、高效變頻設備汰換與綠電轉供建議，落實真正的節能。" icon={<TrendingDown className="text-blue-400" />} />
                </div>
            </div>
        </div>
    );
}

// --- 元件 3: 填表頁面 (Dark Glassmorphism) ---
const daysOfWeek = [
    { key: 'mon', label: '星期一' },
    { key: 'tue', label: '星期二' },
    { key: 'wed', label: '星期三' },
    { key: 'thu', label: '星期四' },
    { key: 'fri', label: '星期五' },
    { key: 'sat', label: '星期六' },
    { key: 'sun', label: '星期日' },
];

const monthsOfYear = [
    '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'
];

function AnalysisForm({ onComplete }) {
    // 基本資料狀態
    const [basicInfo, setBasicInfo] = useState({
        companyName: '',
        address: '',
        contactPerson: '',
        contactEmail: '',
        phone: '',
        floorArea: '',    // 新增：樓地板面積
        buildingType: 'office', // 新增：建築類型 (預設辦公)
        floorsAbove: '',  // 新增：地上總樓層數
        floorsBelow: ''   // 新增：地下總樓層數
    });

    // 營運時間狀態 (改為單行範圍)
    const [scheduleRange, setScheduleRange] = useState({
        startDay: 'mon',
        endDay: 'fri',
        startTime: '09:00',
        endTime: '18:00',
        fullDay: false
    });

    const [electricityYears, setElectricityYears] = useState([2024, 2023]);
    const [electricityData, setElectricityData] = useState(
        monthsOfYear.map((month) => ({
            month,
            values: ['', '']
        }))
    );

    // 空間狀態
    const [spaces, setSpaces] = useState([
        { name: '', type: 'office', area: '', acUsage: 'intermittent', isWaterCooled: false } // 新增 isWaterCooled (是否為水冷)
    ]);

    // 設備狀態
    const [equipment, setEquipment] = useState({
        ac: [{ type: '中央空調', tonnage: '', quantity: '', year: '', usage: '' }],
        lighting: [{ type: 'LED 燈具', quantity: '', year: '', usage: '' }],
        elevator: [{ type: '一般電梯', quantity: '', load: '', speed: '', year: '', usage: '' }], // 預設值更新
        serverRoom: [{ name: '', power: '' }] // 新增：資訊機房
    });

    // 【新增】用水資料狀態
    const [waterData, setWaterData] = useState({
        // 揚水系統
        waterTankHeight: '',  // 水塔高度 (m)
        annualWaterUsage: '', // 年用水量 (m³/yr)

        // 盥洗室
        washroomArea: '',     // 盥洗室面積 (m²)
        washroomYOH: '',      // 盥洗室全年營運時間 (h/yr)

        // 餐廳
        restaurantType: '',   // 餐廳類型 (選擇: 高級/平價/輕食/24hr)
        restaurantArea: '',   // 餐廳面積 (m²)
        restaurantYOD: '',    // 餐廳全年營運天數 (day/yr)

        // 熱水設備
        hotWaterSystem: '',   // 熱水供應設備 (選擇: 電熱/瓦斯/太陽能/熱泵)
    });

    // 【新增】營運率資料狀態 - 5個空間類型
    const [operationRates, setOperationRates] = useState({
        exhibition: '',           // 展覽區營運率 (DL)
        largeMeeting: '',         // 200人以上大會議室 (D2)
        smallMeeting: '',         // 200人以下會議室 (D3)
        performanceNational: '',  // 國家級演藝廳 (G1)
        performanceGeneral: ''    // 一般級演藝廳 (G2)
    });

    // 【新增】旅館特殊資料（如果是旅館類建築）
    const [hotelData, setHotelData] = useState({
        roomCount: '',        // 飯店客房數
        occupancyRate: '',    // 年住房率 (%)
    });

    // 【新增】醫院特殊資料（如果是醫院類建築）
    const [hospitalData, setHospitalData] = useState({
        bedCount: '',         // 病房床數
        bedOccupancyRate: '', // 年占床率 (%)
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 如果使用者輸入了基本資料的樓地板面積，則優先使用，否則使用空間加總
    const calculatedTotalArea = useMemo(() => spaces.reduce((sum, item) => sum + (parseFloat(item.area) || 0), 0), [spaces]);

    const latestElectricityTotal = useMemo(
        () => electricityData.reduce((sum, item) => sum + (parseFloat(item.values[0]) || 0), 0),
        [electricityData]
    );

    const updateBasicInfo = (field, value) => {
        setBasicInfo(prev => ({ ...prev, [field]: value }));
    };

    // 【新增】用水資料更新函數
    const updateWaterData = (field, value) => {
        setWaterData(prev => ({ ...prev, [field]: value }));
    };

    // 【新增】營運率更新函數
    const updateOperationRates = (field, value) => {
        setOperationRates(prev => ({ ...prev, [field]: value }));
    };

    // 【新增】旅館資料更新函數
    const updateHotelData = (field, value) => {
        setHotelData(prev => ({ ...prev, [field]: value }));
    };

    // 【新增】醫院資料更新函數
    const updateHospitalData = (field, value) => {
        setHospitalData(prev => ({ ...prev, [field]: value }));
    };

    // 簡化後的營運時間更新
    const updateScheduleRange = (field, value) => {
        setScheduleRange(prev => {
            // 如果勾選整日，自動設定時間
            if (field === 'fullDay' && value === true) {
                return { ...prev, fullDay: true, startTime: '00:00', endTime: '23:59' };
            }
            if (field === 'fullDay' && value === false) {
                return { ...prev, fullDay: false, startTime: '09:00', endTime: '18:00' };
            }
            return { ...prev, [field]: value };
        });
    };

    const handleElectricityYearChange = (index, value) => {
        setElectricityYears(prev => {
            const next = [...prev];
            next[index] = Number(value);
            return next;
        });
    };

    const handleElectricityValueChange = (month, columnIndex, value) => {
        setElectricityData(prev => prev.map(item => {
            if (item.month !== month) return item;
            const values = [...item.values];
            values[columnIndex] = value;
            return { ...item, values };
        }));
    };

    const updateSpace = (index, field, value) => {
        setSpaces(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
    };

    const addSpaceRow = () => setSpaces(prev => [...prev, { name: '', type: 'office', area: '', acUsage: 'intermittent' }]);

    const removeSpaceRow = (index) => {
        if (spaces.length === 1) return;
        setSpaces(prev => prev.filter((_, idx) => idx !== index));
    };

    const updateEquipment = (category, index, field, value) => {
        setEquipment(prev => ({
            ...prev,
            [category]: prev[category].map((item, idx) => idx === index ? { ...item, [field]: value } : item)
        }));
    };

    const addEquipmentRow = (category, template) => {
        setEquipment(prev => ({
            ...prev,
            [category]: [...prev[category], template]
        }));
    };

    const removeEquipmentRow = (category, index) => {
        if (equipment[category].length === 1) return;
        setEquipment(prev => ({
            ...prev,
            [category]: prev[category].filter((_, idx) => idx !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // 優先使用使用者手動輸入的樓地板面積
        const finalTotalArea = basicInfo.floorArea ? parseFloat(basicInfo.floorArea) : calculatedTotalArea;

        try {
            const insertPayload = {
                email: basicInfo.contactEmail || null,
                contact_name: basicInfo.contactPerson || basicInfo.companyName || null,
                basic_info: basicInfo,
                schedule_range: scheduleRange,
                electricity_years: electricityYears,
                electricity_data: electricityData,
                spaces,
                equipment,
                total_area: finalTotalArea,
                annual_electricity: latestElectricityTotal,
                building_name: basicInfo.companyName || '未命名建築',
                building_type: basicInfo.buildingType,
                ac_system: equipment.ac[0]?.type || '中央空調',
                calculated_eui: finalTotalArea ? (latestElectricityTotal / finalTotalArea).toFixed(2) : '0',

                // 【新增】用水資料
                water_data: waterData,

                // 【新增】營運率資料
                operation_rates: operationRates,

                // 【新增】旅館資料（如適用）
                hotel_data: (basicInfo.buildingType === 'hotel' || basicInfo.buildingType === 'accommodation') ? hotelData : null,

                // 【新增】醫院資料（如適用）
                hospital_data: basicInfo.buildingType === 'medical' ? hospitalData : null,
            };

            const { data, error } = await supabase
                .from('assessments')
                .insert([insertPayload])
                .select()
                .single();

            if (error) {
                throw error;
            }

            onComplete?.(data);
        } catch (error) {
            console.error("Supabase Save Error:", error);
            alert('儲存失敗，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">能效試算資料輸入</h2>
                <p className="text-slate-400">填寫完整建築資料與設備現況，系統將計算BERS評級。</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. 基本資料 */}
                <SectionCard icon={<Building2 size={16} />} title="用戶基本資料">
                    <div className="grid md:grid-cols-2 gap-4">
                        <InputField label="公司名稱" value={basicInfo.companyName} onChange={(e) => updateBasicInfo('companyName', e.target.value)} />

                        {/* 新增欄位：建築類型 */}
                        <SelectField
                            label="建築類型"
                            value={basicInfo.buildingType}
                            onChange={(e) => updateBasicInfo('buildingType', e.target.value)}
                            options={[
                                { value: 'office', label: '辦公場所' },
                                { value: 'accommodation', label: '住宿類' },
                                { value: 'hotel', label: '旅館' },
                                { value: 'medical', label: '醫療照護' },
                                { value: 'retail', label: '商場百貨' },
                                { value: 'restaurant', label: '餐飲場所' },
                                { value: 'entertainment', label: '娛樂場所' },
                                { value: 'finance', label: '金融證券' },
                                { value: 'edu', label: '文教' },
                            ]}
                            useValueLabel
                        />

                        <InputField label="填寫人員" value={basicInfo.contactPerson} onChange={(e) => updateBasicInfo('contactPerson', e.target.value)} />
                        <InputField label="聯繫信箱" type="email" value={basicInfo.contactEmail} onChange={(e) => updateBasicInfo('contactEmail', e.target.value)} />
                        <InputField label="電話" value={basicInfo.phone} onChange={(e) => updateBasicInfo('phone', e.target.value)} />

                        {/* 新增欄位：樓地板面積 */}
                        <InputField label="樓地板面積 (m²)" type="number" value={basicInfo.floorArea} onChange={(e) => updateBasicInfo('floorArea', e.target.value)} />

                        {/* 新增欄位：地上總樓層數 */}
                        <InputField label="地上總樓層數" type="number" value={basicInfo.floorsAbove} onChange={(e) => updateBasicInfo('floorsAbove', e.target.value)} />

                        {/* 新增欄位：地下總樓層數 */}
                        <InputField label="地下總樓層數" type="number" value={basicInfo.floorsBelow} onChange={(e) => updateBasicInfo('floorsBelow', e.target.value)} />

                        <div className="md:col-span-2">
                            <InputField label="地址" value={basicInfo.address} onChange={(e) => updateBasicInfo('address', e.target.value)} />
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm font-semibold text-slate-300 mb-3">建築營運時間</p>
                        {/* 簡化後的單行營運時間 */}
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-grow grid grid-cols-2 gap-2">
                                <SelectField
                                    label="起始日"
                                    value={scheduleRange.startDay}
                                    onChange={(e) => updateScheduleRange('startDay', e.target.value)}
                                    options={daysOfWeek.map(d => ({ value: d.key, label: d.label }))}
                                    useValueLabel
                                />
                                <SelectField
                                    label="結束日"
                                    value={scheduleRange.endDay}
                                    onChange={(e) => updateScheduleRange('endDay', e.target.value)}
                                    options={daysOfWeek.map(d => ({ value: d.key, label: d.label }))}
                                    useValueLabel
                                />
                            </div>
                            <div className="flex-grow grid grid-cols-2 gap-2">
                                <InputField
                                    label="開始時間"
                                    type="time"
                                    value={scheduleRange.startTime}
                                    onChange={(e) => updateScheduleRange('startTime', e.target.value)}
                                    disabled={scheduleRange.fullDay}
                                />
                                <InputField
                                    label="結束時間"
                                    type="time"
                                    value={scheduleRange.endTime}
                                    onChange={(e) => updateScheduleRange('endTime', e.target.value)}
                                    disabled={scheduleRange.fullDay}
                                />
                            </div>
                            <div className="flex items-center gap-2 pb-3 px-2">
                                <input
                                    type="checkbox"
                                    id="fullDayCheck"
                                    checked={scheduleRange.fullDay}
                                    onChange={(e) => updateScheduleRange('fullDay', e.target.checked)}
                                    className="w-5 h-5 accent-green-500"
                                />
                                <label htmlFor="fullDayCheck" className="text-white text-sm cursor-pointer select-none">整日</label>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* 2. 電費資料 (維持不變) */}
                <SectionCard icon={<Zap size={16} />} title="電費資料 (2 年度)">
                    <div className="flex flex-col gap-4">
                        <div className="overflow-x-auto rounded-2xl border border-white/10">
                            <table className="w-full text-sm text-slate-200">
                                <thead className="bg-white/5">
                                    <tr className="text-left">
                                        <th className="px-4 py-3 w-1/3 text-slate-300">月份</th>
                                        {[0, 1].map(col => (
                                            <th key={col} className="px-4 py-3 w-1/3">
                                                <select
                                                    value={electricityYears[col]}
                                                    onChange={(e) => handleElectricityYearChange(col, e.target.value)}
                                                    className="w-full p-2 rounded-lg border border-white/10 bg-black/30 text-white focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    {[2025, 2024, 2023, 2022].map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthsOfYear.map((month) => (
                                        <tr key={month} className="border-t border-white/5">
                                            <td className="px-4 py-3">{month}</td>
                                            {[0, 1].map(col => (
                                                <td key={`${month}-${col}`} className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        placeholder="kWh"
                                                        value={electricityData.find(item => item.month === month)?.values[col] || ''}
                                                        onChange={(e) => handleElectricityValueChange(month, col, e.target.value)}
                                                        className="w-full bg-black/20 rounded-lg px-3 py-2 border border-white/10 text-white"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SectionCard>

                {/* 3. 空間面積資料 */}
                <SectionCard icon={<Home size={16} />} title="空間面積資料">
                    <div className="space-y-4">
                        {spaces.map((space, index) => (
                            <div key={index} className="grid md:grid-cols-5 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                <div className="md:col-span-1">
                                    <InputField label="空間名稱" value={space.name} onChange={(e) => updateSpace(index, 'name', e.target.value)} />
                                </div>
                                <div className="md:col-span-1">
                                    <SelectField
                                        label="類型"
                                        value={space.type}
                                        onChange={(e) => updateSpace(index, 'type', e.target.value)}
                                        options={['office', 'retail', 'hotel', 'hospital', 'other']}
                                    />
                                </div>
                                {/* 新增：空調使用情形 */}
                                <div className="md:col-span-1">
                                    <SelectField
                                        label="空調使用情形"
                                        value={space.acUsage}
                                        onChange={(e) => updateSpace(index, 'acUsage', e.target.value)}
                                        options={[
                                            { value: 'intermittent', label: '間歇' },
                                            { value: 'fullDay', label: '整日' }
                                        ]}
                                        useValueLabel
                                    />
                                </div>
                                {/* 新增：是否為水冷 */}
                                <div className="md:col-span-1">
                                    <SelectField
                                        label="是否為水冷"
                                        value={space.isWaterCooled}
                                        onChange={(e) => updateSpace(index, 'isWaterCooled', e.target.value === 'true')}
                                        options={[
                                            { value: 'false', label: '否' },
                                            { value: 'true', label: '是' }
                                        ]}
                                        useValueLabel
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <InputField label="面積 (m²)" type="number" value={space.area} onChange={(e) => updateSpace(index, 'area', e.target.value)} />
                                </div>

                                <div className="md:col-span-5 flex justify-end">
                                    <button type="button" onClick={() => removeSpaceRow(index)} className="text-xs text-slate-400 hover:text-red-400">
                                        移除此空間
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addSpaceRow}
                            className="px-4 py-2 rounded-xl border border-dashed border-white/30 text-slate-200 hover:border-white/60 transition"
                        >
                            + 新增空間
                        </button>
                        <div className="text-sm text-slate-400">總樓地板面積 (加總)：<span className="text-white font-semibold">{calculatedTotalArea}</span> m²</div>
                    </div>
                </SectionCard>

                {/* 4. 設備資料 */}
                <SectionCard icon={<BarChart3 size={16} />} title="設備資料">
                    <EquipmentSection
                        title="空調設備"
                        data={equipment.ac}
                        onAdd={() => addEquipmentRow('ac', { type: '中央空調', tonnage: '', quantity: '', year: '', usage: '' })}
                        onRemove={(idx) => removeEquipmentRow('ac', idx)}
                        renderFields={(item, idx) => (
                            <div className="grid md:grid-cols-5 gap-3">
                                <SelectField label="類型" value={item.type} onChange={(e) => updateEquipment('ac', idx, 'type', e.target.value)} options={['中央空調', '分離式', 'VRV/VRF']} />
                                <SelectField label="噸數" value={item.tonnage} onChange={(e) => updateEquipment('ac', idx, 'tonnage', e.target.value)} options={['1RT', '2RT', '3RT', '5RT', '7RT', '10RT', '15RT', '20RT', '30RT', '40RT', '50RT', '60RT', '70RT', '80RT', '90RT', '100RT', '150RT', '200RT', '300RT', '400RT', '500RT', '600RT', '700RT', '800RT', '900RT', '1000RT']} />
                                <InputField label="台數" type="number" value={item.quantity} onChange={(e) => updateEquipment('ac', idx, 'quantity', e.target.value)} />
                                <InputField label="年份" type="number" value={item.year} onChange={(e) => updateEquipment('ac', idx, 'year', e.target.value)} />
                                <InputField label="使用時間 (hr/year)" type="number" value={item.usage} onChange={(e) => updateEquipment('ac', idx, 'usage', e.target.value)} />
                            </div>
                        )}
                    />

                    <EquipmentSection
                        title="照明設備"
                        data={equipment.lighting}
                        onAdd={() => addEquipmentRow('lighting', { type: 'LED 燈具', quantity: '', year: '', usage: '' })}
                        onRemove={(idx) => removeEquipmentRow('lighting', idx)}
                        renderFields={(item, idx) => (
                            <div className="grid md:grid-cols-4 gap-3">
                                <SelectField label="類型" value={item.type} onChange={(e) => updateEquipment('lighting', idx, 'type', e.target.value)} options={['LED 燈具', 'T5 日光燈', '鹵素燈']} />
                                <InputField label="台數" type="number" value={item.quantity} onChange={(e) => updateEquipment('lighting', idx, 'quantity', e.target.value)} />
                                <InputField label="年份" type="number" value={item.year} onChange={(e) => updateEquipment('lighting', idx, 'year', e.target.value)} />
                                <InputField label="使用時間 (hr/year)" type="number" value={item.usage} onChange={(e) => updateEquipment('lighting', idx, 'usage', e.target.value)} />
                            </div>
                        )}
                    />

                    {/* 電梯設備 */}
                    <EquipmentSection
                        title="電梯設備"
                        data={equipment.elevator}
                        onAdd={() => addEquipmentRow('elevator', { type: '一般電梯', quantity: '', load: '', speed: '', year: '', usage: '' })}
                        onRemove={(idx) => removeEquipmentRow('elevator', idx)}
                        renderFields={(item, idx) => (
                            <div className="grid md:grid-cols-6 gap-3">
                                <SelectField label="類型" value={item.type} onChange={(e) => updateEquipment('elevator', idx, 'type', e.target.value)} options={['一般電梯', '變頻電梯', '電力回收']} />
                                <InputField label="台數" type="number" value={item.quantity} onChange={(e) => updateEquipment('elevator', idx, 'quantity', e.target.value)} />
                                <InputField label="載重 (kg)" type="number" value={item.load} onChange={(e) => updateEquipment('elevator', idx, 'load', e.target.value)} />
                                <InputField label="速度 (m/s)" type="number" value={item.speed} onChange={(e) => updateEquipment('elevator', idx, 'speed', e.target.value)} />
                                <InputField label="年份" type="number" value={item.year} onChange={(e) => updateEquipment('elevator', idx, 'year', e.target.value)} />
                                <InputField label="使用時間 (hr/year)" type="number" value={item.usage} onChange={(e) => updateEquipment('elevator', idx, 'usage', e.target.value)} />
                            </div>
                        )}
                    />

                    {/* 資訊機房 */}
                    <EquipmentSection
                        title="資訊機房"
                        data={equipment.serverRoom}
                        onAdd={() => addEquipmentRow('serverRoom', { name: '', power: '' })}
                        onRemove={(idx) => removeEquipmentRow('serverRoom', idx)}
                        renderFields={(item, idx) => (
                            <div className="grid md:grid-cols-2 gap-3">
                                <InputField label="機房名稱" value={item.name} onChange={(e) => updateEquipment('serverRoom', idx, 'name', e.target.value)} />
                                <InputField label="機櫃總功率 (kW)" type="number" value={item.power} onChange={(e) => updateEquipment('serverRoom', idx, 'power', e.target.value)} />
                            </div>
                        )}
                    />
                </SectionCard>

                {/* 5. 用水資料 */}
                <SectionCard icon={<Droplets size={16} />} title="用水資料">
                    <div className="space-y-6">
                        {/* 揚水系統 */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">揚水系統</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <InputField
                                    label="水塔高度 (m)"
                                    type="number"
                                    value={waterData.waterTankHeight}
                                    onChange={(e) => updateWaterData('waterTankHeight', e.target.value)}
                                    placeholder="例如: 42"
                                />
                                <InputField
                                    label="年用水量 (m³/yr)"
                                    type="number"
                                    value={waterData.annualWaterUsage}
                                    onChange={(e) => updateWaterData('annualWaterUsage', e.target.value)}
                                    placeholder="例如: 221.4"
                                />
                            </div>
                        </div>

                        {/* 盥洗室 */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">盥洗室</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <InputField
                                    label="盥洗室面積 (m²)"
                                    type="number"
                                    value={waterData.washroomArea}
                                    onChange={(e) => updateWaterData('washroomArea', e.target.value)}
                                />
                                <InputField
                                    label="全年營運時間 (h/yr)"
                                    type="number"
                                    value={waterData.washroomYOH}
                                    onChange={(e) => updateWaterData('washroomYOH', e.target.value)}
                                    placeholder="例如: 2500"
                                />
                            </div>
                        </div>

                        {/* 室內餐廳 */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">室內餐廳</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <SelectField
                                    label="餐廳類型"
                                    value={waterData.restaurantType}
                                    onChange={(e) => updateWaterData('restaurantType', e.target.value)}
                                    options={[
                                        { value: '', label: '-- 請選擇 --' },
                                        { value: 'luxury', label: '高級餐廳' },
                                        { value: 'budget', label: '平價餐廳/小吃街' },
                                        { value: 'cafe', label: '輕食咖啡餐廳' },
                                        { value: '24hr', label: '24hr 速食餐廳' }
                                    ]}
                                    useValueLabel
                                />
                                <InputField
                                    label="餐廳面積 (m²)"
                                    type="number"
                                    value={waterData.restaurantArea}
                                    onChange={(e) => updateWaterData('restaurantArea', e.target.value)}
                                />
                                <InputField
                                    label="全年營運天數 (day/yr)"
                                    type="number"
                                    value={waterData.restaurantYOD}
                                    onChange={(e) => updateWaterData('restaurantYOD', e.target.value)}
                                    placeholder="例如: 365"
                                />
                            </div>
                        </div>

                        {/* 熱水供應設備 */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-3">熱水供應設備</h4>
                            <SelectField
                                label="熱水設備類型"
                                value={waterData.hotWaterSystem}
                                onChange={(e) => updateWaterData('hotWaterSystem', e.target.value)}
                                options={[
                                    { value: '', label: '-- 請選擇 --' },
                                    { value: 'electric', label: '電熱式' },
                                    { value: 'gas', label: '瓦斯式' },
                                    { value: 'solar', label: '太陽能' },
                                    { value: 'heatPump', label: '熱泵' },
                                    { value: 'hybrid', label: '複合式' }
                                ]}
                                useValueLabel
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* 6. 營運率資料 */}
                <SectionCard icon={<Activity size={16} />} title="營運率資料">
                    <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                            <p className="text-sm text-blue-300">
                                💡 提示：針對有會議或展演空間的建築物，請填寫相關空間的營運率。非必填，如無相關空間可留空。
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField
                                label="展覽區營運率"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={operationRates.exhibition}
                                onChange={(e) => updateOperationRates('exhibition', e.target.value)}
                                placeholder="例如: 0.6"
                            />
                            <InputField
                                label="200人以上大會議室營運率"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={operationRates.largeMeeting}
                                onChange={(e) => updateOperationRates('largeMeeting', e.target.value)}
                                placeholder="例如: 0.7"
                            />
                            <InputField
                                label="200人以下會議室營運率"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={operationRates.smallMeeting}
                                onChange={(e) => updateOperationRates('smallMeeting', e.target.value)}
                                placeholder="例如: 0.6"
                            />
                            <InputField
                                label="國家級演藝廳營運率"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={operationRates.performanceNational}
                                onChange={(e) => updateOperationRates('performanceNational', e.target.value)}
                                placeholder="例如: 0.8"
                            />
                            <InputField
                                label="一般級演藝廳營運率"
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                value={operationRates.performanceGeneral}
                                onChange={(e) => updateOperationRates('performanceGeneral', e.target.value)}
                                placeholder="例如: 0.7"
                            />
                        </div>

                        {/* 營運率說明 */}
                        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <p className="text-sm text-slate-300 mb-2">
                                <strong className="text-white">營運率參考值：</strong>
                            </p>
                            <ul className="text-xs text-slate-400 space-y-1 ml-4">
                                <li>• 展覽區：通常為 100 部年/台(上限273)</li>
                                <li>• 200人以上會議室：通常為 100 部年/台(上限208)</li>
                                <li>• 200人以下會議室：通常為 100 部年/台(上限208)</li>
                                <li>• 國家級演藝廳：通常為 100 部年/台(上限156)</li>
                                <li>• 一般級演藝廳：通常為 100 部年/台(上限156)</li>
                            </ul>
                        </div>
                    </div>
                </SectionCard>

                {/* 7. 旅館特殊資料 (只在建築類型為旅館時顯示) */}
                {(basicInfo.buildingType === 'hotel' || basicInfo.buildingType === 'accommodation') && (
                    <SectionCard icon={<Hotel size={16} />} title="旅館特殊資料">
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField
                                label="飯店客房數 (NR)"
                                type="number"
                                value={hotelData.roomCount}
                                onChange={(e) => updateHotelData('roomCount', e.target.value)}
                            />
                            <InputField
                                label="年住房率 (%)"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={hotelData.occupancyRate}
                                onChange={(e) => updateHotelData('occupancyRate', e.target.value)}
                                placeholder="例如: 75"
                            />
                        </div>
                    </SectionCard>
                )}

                {/* 8. 醫院特殊資料 (只在建築類型為醫療時顯示) */}
                {basicInfo.buildingType === 'medical' && (
                    <SectionCard icon={<Activity size={16} />} title="醫院特殊資料">
                        <div className="grid md:grid-cols-2 gap-4">
                            <InputField
                                label="病房床數 (NB)"
                                type="number"
                                value={hospitalData.bedCount}
                                onChange={(e) => updateHospitalData('bedCount', e.target.value)}
                            />
                            <InputField
                                label="年占床率 (%)"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={hospitalData.bedOccupancyRate}
                                onChange={(e) => updateHospitalData('bedOccupancyRate', e.target.value)}
                                placeholder="例如: 80"
                            />
                        </div>
                    </SectionCard>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                資料儲存中...
                            </>
                        ) : (
                            <>開始分析評估 <ArrowRight size={18} /></>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ... SectionCard, EquipmentSection 保持不變 ...

// 改進版 SelectField
function SelectField({ label, value, onChange, options, useValueLabel = false }) {
    return (
        <div className="flex flex-col gap-1.5 w-full"> {/* 加入 w-full 確保容器寬度 */}
            <label className="text-sm font-semibold text-slate-300">{label}</label>
            <div className="relative w-full"> {/* 加入 relative 和 w-full */}
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full appearance-none p-3 pr-10 rounded-xl border border-white/10 bg-black/20 text-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer" // 加入 appearance-none, pr-10, w-full, cursor-pointer
                >
                    {options.map(option => {
                        const val = useValueLabel ? option.value : option;
                        const text = useValueLabel ? option.label : getOptionLabel(option);
                        return <option key={val} value={val}>{text}</option>
                    })}
                </select>
                {/* 自定義下拉箭頭 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={18} />
                </div>
            </div>
        </div>
    );
}

// 輔助函式
function getOptionLabel(val) {
    const map = {
        'office': '辦公空間',
        'retail': '商場',
        'hotel': '旅宿',
        'hospital': '醫療',
        'other': '其他'
    };
    return map[val] || val;
}

function SectionCard({ icon, title, children }) {
    return (
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold text-green-400 uppercase tracking-wider">
                {icon} {title}
            </div>
            {children}
        </div>
    );
}

function EquipmentSection({ title, data, onAdd, onRemove, renderFields }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">{title}</h4>
                <button
                    type="button"
                    onClick={onAdd}
                    className="text-sm text-slate-300 px-3 py-1 rounded-lg border border-white/20 hover:bg-white/10 transition"
                >
                    + 新增
                </button>
            </div>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                        {renderFields(item, index)}
                        <div className="flex justify-end">
                            <button type="button" onClick={() => onRemove(index)} className="text-xs text-slate-400 hover:text-red-400">
                                移除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 修正 InputField 加入 w-full
function InputField({ label, type = "text", ...props }) {
    return (
        <div className="flex flex-col gap-1.5 w-full"> {/* 加入 w-full */}
            <label className="text-sm font-semibold text-slate-300">{label}</label>
            <input
                type={type}
                className="w-full p-3 rounded-xl border border-white/10 bg-black/20 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 disabled:opacity-40" // 加入 w-full
                {...props}
            />
        </div>
    );
}

// --- 元件 4: 儀表板 (专业 BERS Dashboard) ---
function Dashboard({ data, onRetry, onVerify, onDemo, loading, error, isLoggedIn, isDemoMode }) {
    const [formState, setFormState] = useState({ email: '', name: '' });
    const [showLoginForm, setShowLoginForm] = useState(false);

    const handleInputChange = (field, value) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        onVerify?.(formState.email.trim(), formState.name.trim());
        // 不在此處立即關閉，等待 verify 成功後通過 useEffect 關閉
    };

    // 監聽 demo 模式狀態，若是登入成功（isDemoMode 變為 false），則關閉 Modal
    useEffect(() => {
        if (!isDemoMode && isLoggedIn) {
            setShowLoginForm(false);
        }
    }, [isDemoMode, isLoggedIn]);

    const handleLogout = () => {
        onDemo?.(); // 觸發回到 Demo 模式
        setFormState({ email: '', name: '' }); // 清空表單
    };

    // === 使用Demo数据或实际数据 ===
    const displayData = data || DEMO_DATA;
    const isDemo = !data || isDemoMode;

    // === 数据计算 ===
    const area = parseFloat(displayData?.total_area ?? displayData?.totalArea) || 1000;
    const elec = parseFloat(displayData?.annual_electricity ?? displayData?.annualElectricity) || 150000;
    const euiValue = elec / area;
    const eui = euiValue.toFixed(1);

    // 计算排碳量（电力排碳系数 0.502 kgCO2/kWh）
    const carbonEmission = (elec * 0.502 / 1000).toFixed(2); // 吨CO2

    // 计算BERS等级
    let level = 1;
    let rating = '待改善';
    let color = 'text-red-400';

    if (euiValue < 100) { level = 5; rating = '1+ 級 (鑽石級)'; color = 'text-emerald-400'; }
    else if (euiValue < 140) { level = 4; rating = '1 級 (黃金級)'; color = 'text-green-400'; }
    else if (euiValue < 180) { level = 3; rating = '2 級 (銀級)'; color = 'text-yellow-400'; }
    else if (euiValue < 220) { level = 2; rating = '3 級 (合格)'; color = 'text-orange-400'; }

    // 计算总分（简化版：100 - EUI相对值）
    const totalScore = Math.max(10, Math.min(100, 100 - (euiValue - 80) / 2)).toFixed(0);

    // 格式化电费趋势数据
    const formatElectricityData = () => {
        if (!displayData?.electricity_data) return [];

        const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        return monthLabels.map((month, index) => ({
            month,
            year2023: displayData.electricity_data[index]?.[0] || 0,
            year2024: displayData.electricity_data[index]?.[1] || 0
        }));
    };

    return (
        <div className="animate-in fade-in zoom-in duration-500 space-y-8">
            {/* 頂部：Demo模式提示或登入按鈕 */}
            {/* 頂部 Demo Banner 已整合至下方標題列 */}

            {/* 登入表單（彈出式） */}
            {showLoginForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">登入查看報告</h2>
                        <form onSubmit={handleVerifySubmit} className="space-y-4">
                            <InputField
                                label="聯絡人姓名"
                                value={formState.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                            />
                            <InputField
                                label="電子郵件"
                                type="email"
                                value={formState.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                required
                            />
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-50"
                                >
                                    {loading ? '查詢中...' : '登入'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLoginForm(false)}
                                    className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10"
                                >
                                    取消
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 报告标题（不显示用户和建筑信息如果是Demo） */}
            {/* 报告标题与操作栏 (整合 Demo 提示) */}
            <div className={`flex flex-col md:flex-row justify-between items-center mb-8 gap-4 text-white ${isDemo ? 'p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl' : ''}`}>
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold">評估結果報告</h2>
                            {isDemo && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300">
                                    <span className="text-sm">📊 範例數據展示</span>
                                </div>
                            )}
                        </div>
                        {!isDemo && (
                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                <span className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/10">專案</span>
                                <span>{displayData?.building_name || displayData?.basic_info?.companyName || '未命名建築'}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isDemo ? (
                        <>
                            <button
                                onClick={() => setShowLoginForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v1" />
                                </svg>
                                登入查看報告
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleLogout} className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg font-medium hover:bg-red-500/10 transition-colors">
                                登出
                            </button>
                            <div className="w-px h-6 bg-white/10 mx-1"></div>
                            <button onClick={() => setTimeout(() => window.print(), 0)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 font-medium hover:bg-white/10 hover:text-white transition-colors">匯出報表</button>
                            <button onClick={onRetry} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors">新增試算</button>
                        </>
                    )}
                </div>
            </div>

            {/* === 1. 关键指标卡片（4列）=== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="建築 EUI"
                    value={eui}
                    unit="kWh/m².yr"
                    trend="down"
                    trendValue="-5.2%"
                    icon={Zap}
                    color="blue"
                />
                <MetricCard
                    title="排碳量"
                    value={carbonEmission}
                    unit="噸CO2/yr"
                    trend="down"
                    trendValue="-3.1%"
                    icon={Leaf}
                    color="green"
                />
                <MetricCard
                    title="總和得分"
                    value={totalScore}
                    unit="分"
                    trend="up"
                    trendValue="+2.5%"
                    icon={BarChart3}
                    color="purple"
                />
                {/* 能效等级替换建筑面积 */}
                <GaugeChart
                    value={parseFloat(eui)}
                    max={300}
                    currentLevel={rating}
                    compact={true}
                />
            </div>

            {/* === 2. 等级对应表格（全宽，更多建议）=== */}
            <EfficiencyTable
                currentEUI={parseFloat(eui)}
                currentLevel={level}
                totalArea={area}
                fullWidth={true}
            />

            {/* === 3. 比较区间 === */}
            <ComparisonRange
                buildingType={displayData?.building_type || 'office'}
                yourValue={parseFloat(eui)}
                percentile={65}
            />

            {/* === 4. 用电趋势图（全宽，带交互）=== */}
            <ElectricityTrendChart
                data={formatElectricityData()}
                years={displayData?.electricity_years || [2023, 2024]}
                interactive={true}
            />

            {/* === 5. 設備分析（全寬）=== */}
            <EquipmentAnalysis
                equipment={[
                    {
                        name: '中央空調系統 (Chiller)',
                        efficiency: 45,
                        rating: '一級能效',
                        status: '優',
                        savingPotential: '低 (已最佳化)',
                        color: 'green'
                    },
                    {
                        name: '辦公照明系統',
                        efficiency: 18,
                        rating: '一級能效',
                        status: '優',
                        savingPotential: '低',
                        color: 'green'
                    },
                    {
                        name: '電梯直連梯',
                        efficiency: 8,
                        rating: '三級能效',
                        status: '高 (建議改善)',
                        savingPotential: '高',
                        color: 'orange'
                    }
                ]}
            />

            {/* === 6. BERSe 評估總表 === */}
            <BERSeTable data={displayData} />
        </div>
    );
}

// 輔助元件
function GlassCard({ title, desc, icon }) {
    return (
        <div className="group p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-white/10 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function ChartBar({ label, percent, color, value }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1 font-medium text-slate-300">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
        </div>
    );
}

function SuggestionItem({ title, desc }) {
    return (
        <li className="flex gap-3 items-start">
            <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
            <div>
                <h4 className="font-bold text-slate-200 text-sm">{title}</h4>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>
        </li>
    );
}