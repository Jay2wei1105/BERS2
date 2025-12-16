// BERS Dashboard 圖表與分析組件
// Phase 2: 比較區間、趨勢圖、設備分析

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// ============================================
// 4. ComparisonRange - 同類建築比較區間
// ============================================

export function ComparisonRange({ buildingType, yourValue, percentile }) {
    // 根據建築類型定義基準範圍
    const typeRanges = {
        'office': { excellent: 80, good: 120, average: 160, poor: 200, max: 250 },
        'hotel': { excellent: 100, good: 150, average: 200, poor: 250, max: 300 },
        'retail': { excellent: 90, good: 140, average: 190, poor: 240, max: 280 },
        'default': { excellent: 80, good: 120, average: 160, poor: 200, max: 250 }
    };

    // 建築類型中文名稱映射
    const typeLabels = {
        'office': '辦公場所',
        'accommodation': '住宿類',
        'hotel': '旅館',
        'medical': '醫療照護',
        'retail': '商場百貨',
        'restaurant': '餐飲場所',
        'entertainment': '娛樂場所',
        'finance': '金融證券',
        'edu': '文教',
        'default': '群公用'
    };

    const range = typeRanges[buildingType] || typeRanges.default;
    const max = range.max;
    const buildingLabel = typeLabels[buildingType] || typeLabels.default;

    // 計算位置百分比
    const position = Math.min((yourValue / max) * 100, 100);

    // 確定當前級別
    let currentCategory = 'poor';
    let categoryColor = 'text-red-400';
    let categoryBg = 'bg-red-500';
    let categoryGlow = 'rgba(239, 68, 68, 0.4)';
    let categoryLabel = '需改善';

    if (yourValue <= range.excellent) {
        currentCategory = 'excellent';
        categoryColor = 'text-emerald-400';
        categoryBg = 'bg-emerald-500';
        categoryGlow = 'rgba(16, 185, 129, 0.4)';
        categoryLabel = '優秀';
    } else if (yourValue <= range.good) {
        currentCategory = 'good';
        categoryColor = 'text-green-400';
        categoryBg = 'bg-green-500';
        categoryGlow = 'rgba(34, 197, 94, 0.4)';
        categoryLabel = '良好';
    } else if (yourValue <= range.average) {
        currentCategory = 'average';
        categoryColor = 'text-yellow-400';
        categoryBg = 'bg-yellow-500';
        categoryGlow = 'rgba(234, 179, 8, 0.4)';
        categoryLabel = '一般';
    } else if (yourValue <= range.poor) {
        currentCategory = 'poor';
        categoryColor = 'text-orange-400';
        categoryBg = 'bg-orange-500';
        categoryGlow = 'rgba(249, 115, 22, 0.4)';
        categoryLabel = '待改善';
    }

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover-lift relative overflow-hidden">
            {/* 背景裝飾光暈 */}
            <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[120px] opacity-10 pointer-events-none"
                style={{ background: categoryGlow }}
            ></div>

            {/* 標題 */}
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full shadow-lg"></span>
                同類建築能效等比較
            </h3>
            <p className="text-sm text-slate-400 mb-8 relative z-10">
                {buildingLabel} 建築能效分布
            </p>

            {/* 進度條區域 */}
            <div className="relative mb-6">
                {/* 當前位置指示器 - 改為下箭頭 */}
                <div
                    className="absolute -top-16 transition-all duration-1000 ease-out z-20"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                    {/* 數值標籤 */}
                    <div className={`mb-2 px-4 py-2 rounded-lg ${categoryBg} backdrop-blur-sm border-2 border-white shadow-xl whitespace-nowrap`}>
                        <span className="text-lg font-bold text-white">{yourValue}</span>
                    </div>

                    {/* 下箭頭 */}
                    <div className="flex justify-center">
                        <div
                            className={`w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] ${categoryBg.replace('bg-', 'border-t-')} drop-shadow-lg`}
                            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                        ></div>
                    </div>
                </div>

                {/* 7級平滑漸變條 */}
                <div className="relative h-12 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'linear-gradient(to right, #10b981 0%, #22c55e 16%, #84cc16 33%, #eab308 50%, #f59e0b 66%, #f97316 83%, #ef4444 100%)'
                        }}
                    ></div>
                    {/* 半透明覆蓋層增加深度 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                </div>
            </div>

            {/* 刻度標籤 */}
            <div className="relative h-6 mb-8">
                {[
                    { value: 80, label: '80' },
                    { value: 120, label: '120' },
                    { value: 160, label: '160' },
                    { value: 200, label: '200' }
                ].map((mark, index) => (
                    <div
                        key={index}
                        className="absolute top-0 text-xs text-slate-500 font-medium"
                        style={{ left: `${(mark.value / max) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                        {mark.label}
                    </div>
                ))}
            </div>

            {/* 統計卡片 - 改進設計 */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:scale-105 transition-transform">
                    <p className="text-slate-400 text-xs font-medium mb-2">能源密度</p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-2xl font-bold ${categoryColor}`}>{categoryLabel}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:scale-105 transition-transform">
                    <p className="text-slate-400 text-xs font-medium mb-2">總體預測</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-2xl font-bold text-white">{percentile}</p>
                        <span className="text-lg text-slate-400">%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// 5. ElectricityTrendChart - 用電趨勢雙線圖（帶交互）
// ============================================

export function ElectricityTrendChart({ data, years, interactive = false }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 }); // 用於滑鼠跟隨
    const containerRef = React.useRef(null);

    if (!data || data.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <p className="text-slate-400 text-center">暫無趨勢數據</p>
            </div>
        );
    }

    // 計算最大值用於縮放
    const maxValue = Math.max(...data.flatMap(d => [d.year2023 || 0, d.year2024 || 0]));

    // SVG 座標系 (調整為接近容器比例 2.5:1 以減少變形)
    const svgWidth = 500;
    const svgHeight = 200;

    // 計算點的Y座標 (邏輯座標)
    const calculateY = (value) => {
        return svgHeight - (value / maxValue) * svgHeight;
    };

    // 生成路徑
    const generatePath = (yearKey) => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * svgWidth;
            const y = calculateY(d[yearKey]);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    // 處理鼠標移動
    const handleMouseMove = (e) => {
        if (!interactive || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // 計算最接近的索引
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const index = Math.round(percentage * (data.length - 1));

        setHoveredIndex(index);

        // 更新Tooltip位置
        let tooltipX = x;
        if (x < 70) tooltipX = 70;
        if (x > rect.width - 70) tooltipX = rect.width - 70;

        setTooltipPos({ x: tooltipX, y: 0 });
    };

    const handleMouseLeave = () => {
        if (interactive) setHoveredIndex(null);
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                    用電趨勢分析
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-xs text-slate-400">{years?.[0] || '2023'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-xs text-slate-400">{years?.[1] || '2024'}</span>
                    </div>
                </div>
            </div>

            {/* 用於計算鼠標位置的容器 */}
            <div
                ref={containerRef}
                className="relative cursor-crosshair touch-none h-[250px] w-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* 浮動提示框 */}
                {interactive && hoveredIndex !== null && (
                    <div
                        className="absolute z-20 pointer-events-none transition-all duration-75 ease-out"
                        style={{
                            left: tooltipPos.x, // 跟隨滑鼠X
                            top: 0,
                            transform: 'translate(-50%, -110%)'
                        }}
                    >
                        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl min-w-[140px]">
                            <div className="text-white font-bold mb-2 text-center border-b border-white/10 pb-1 flex justify-between items-center">
                                <span>{data[hoveredIndex]?.month}</span>
                                <span className="text-[10px] text-slate-400 font-normal">詳細數據</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <span className="text-slate-300">{years?.[0]}:</span>
                                    </div>
                                    <span className="text-white font-mono font-medium">{data[hoveredIndex]?.year2023?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <span className="text-slate-300">{years?.[1]}:</span>
                                    </div>
                                    <span className="text-white font-mono font-medium">{data[hoveredIndex]?.year2024?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        {/* 箭頭 */}
                        <div className="w-3 h-3 bg-slate-900 border-r border-b border-white/20 rotate-45 absolute bottom-[-6px] left-1/2 -translate-x-1/2"></div>
                    </div>
                )}

                {/* SVG 圖表 */}
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* 網格線 */}
                    {[0, 20, 40, 60, 80, 100].map(yPercent => {
                        const y = yPercent * (svgHeight / 100);
                        return (
                            <line
                                key={yPercent}
                                x1="0"
                                y1={y}
                                x2={svgWidth}
                                y2={y}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="1" // 相對坐標系適當調細在視覺上
                                vectorEffect="non-scaling-stroke"
                            />
                        );
                    })}

                    {/* 垂直引導線 (跟隨 Hover 索引) */}
                    {interactive && hoveredIndex !== null && (
                        <line
                            x1={(hoveredIndex / (data.length - 1)) * svgWidth}
                            y1="0"
                            x2={(hoveredIndex / (data.length - 1)) * svgWidth}
                            y2={svgHeight}
                            stroke="white"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                            opacity="0.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* 2023年度線條 (藍色) */}
                    <path
                        d={generatePath('year2023')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        filter="drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
                        className="transition-all duration-300"
                        opacity={hoveredIndex !== null ? 0.4 : 1}
                    />
                    <path
                        d={`${generatePath('year2023')} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
                        fill="url(#chartGradientBlue)"
                        opacity="0.5"
                        className="pointer-events-none"
                    />


                    {/* 2024年度線條 (綠色) */}
                    <path
                        d={generatePath('year2024')}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        filter="drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))"
                        className="transition-all duration-300"
                    />
                    <path
                        d={`${generatePath('year2024')} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`}
                        fill="url(#chartGradientGreen)"
                        opacity="0.5"
                        className="pointer-events-none"
                    />

                    {/* 數據點 (僅Hover時顯示當前點) */}
                    {interactive && hoveredIndex !== null && (() => {
                        const d = data[hoveredIndex];
                        const x = (hoveredIndex / (data.length - 1)) * svgWidth;
                        return (
                            <g>
                                {/* 2023點 */}
                                <circle
                                    cx={x}
                                    cy={calculateY(d.year2023)}
                                    r="3" // 半徑調小
                                    fill="#1e293b"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    className="animate-pulse"
                                />
                                {/* 2024點 */}
                                <circle
                                    cx={x}
                                    cy={calculateY(d.year2024)}
                                    r="3"
                                    fill="#1e293b"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    className="animate-pulse"
                                />
                            </g>
                        );
                    })()}
                </svg>
            </div>

            {/* 月份標籤 (對齊修正) */}
            <div className="flex justify-between px-0 mt-3 text-xs text-slate-500">
                {data.map((d, i) => {
                    return (
                        <div
                            key={i}
                            className={`flex flex-col items-center justify-center w-8 transition-colors ${hoveredIndex === i ? 'text-white font-bold scale-110' : ''
                                }`}
                        >
                            <span>{d.month.replace('月', '')}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// 6. EquipmentAnalysis - 設備能耗效率分析（僅空調與照明）
// ============================================

export function EquipmentAnalysis({ equipment }) {
    if (!equipment) return null;

    // 準備設備列表（只包含空調和照明）
    const equipmentList = [];

    // 處理空調設備
    if (equipment.ac && Array.isArray(equipment.ac)) {
        equipment.ac.forEach((item, index) => {
            if (item.type) {
                equipmentList.push({
                    id: `ac-${index}`,
                    category: '空調',
                    name: `${item.type || '中央空調'}`,
                    specs: `${item.tonnage || 'N/A'} RT`,
                    efficiency: item.quantity > 0 ? 45 : 0, // 簡化效率評估
                    potential: '低',
                    suggestion: '建議定期保養清潔',
                    icon: '🌡️'
                });
            }
        });
    }

    // 處理照明設備
    if (equipment.lighting && Array.isArray(equipment.lighting)) {
        equipment.lighting.forEach((item, index) => {
            if (item.type) {
                const isLED = item.type.includes('LED');
                equipmentList.push({
                    id: `lighting-${index}`,
                    category: '照明',
                    name: item.type || '照明設備',
                    specs: `${item.quantity || 0} 具`,
                    efficiency: isLED ? 85 : 45,
                    potential: isLED ? '低' : '高',
                    suggestion: isLED ? '已使用LED，表現良好' : '建議更換為LED照明',
                    icon: '💡'
                });
            }
        });
    }

    // 如果沒有設備資料，顯示提示
    if (equipmentList.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">重點設備效率檢視</h3>
                <p className="text-slate-400 text-sm">暫無設備資料</p>
            </div>
        );
    }

    // 效率顏色映射
    const getEfficiencyColor = (efficiency) => {
        if (efficiency >= 70) return { bg: 'bg-green-500', text: 'text-green-400', badge: 'bg-green-500/20 border-green-500/50' };
        if (efficiency >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-400', badge: 'bg-yellow-500/20 border-yellow-500/50' };
        return { bg: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/20 border-red-500/50' };
    };

    // 改善潛力顏色
    const getPotentialColor = (potential) => {
        if (potential === '高') return 'text-yellow-400';
        if (potential === '中') return 'text-orange-400';
        return 'text-green-400';
    };

    return (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover-lift">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full shadow-lg"></span>
                重點設備效率檢視
            </h3>
            <p className="text-sm text-slate-400 mb-6">監測主要能源設備的運作效率與改善建議</p>

            <div className="space-y-4">
                {equipmentList.map((item) => {
                    const colors = getEfficiencyColor(item.efficiency);

                    return (
                        <div
                            key={item.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all group"
                        >
                            {/* 標題列 */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="text-3xl">{item.icon}</div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-white font-bold">{item.name}</h4>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border ${colors.badge} text-xs font-medium ${colors.text}`}>
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-1">{item.specs}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 能效等級條 */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                    <span>能效等級</span>
                                    <span className={`font-bold ${colors.text}`}>{item.efficiency}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${colors.bg} transition-all duration-1000 ease-out rounded-full`}
                                        style={{ width: `${item.efficiency}%` }}
                                    />
                                </div>
                            </div>

                            {/* 改善潛力與建議 */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-white/5 rounded-lg p-2">
                                    <span className="text-slate-500">節能潛力</span>
                                    <p className={`font-bold mt-0.5 ${getPotentialColor(item.potential)}`}>
                                        {item.potential}
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-lg p-2">
                                    <span className="text-slate-500">改善建議</span>
                                    <p className="text-slate-300 mt-0.5 font-medium text-xs">
                                        {item.suggestion}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 下載詳細報告按鈕 */}
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-purple-500/30">
                下載詳細報告
            </button>
        </div>
    );
}
// ============================================

export function EquipmentAnalysis({ equipment }) {
    // 預設設備數據
    const defaultEquipment = equipment || [
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
    ];

    const getStatusIcon = (color) => {
        if (color === 'green') return <CheckCircle size={16} className="text-green-400" />;
        if (color === 'orange') return <AlertCircle size={16} className="text-orange-400" />;
        return <XCircle size={16} className="text-red-400" />;
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                重點設備能效檢視
            </h3>
            <p className="text-sm text-slate-400 mb-6">
                監測主要耗能設備的運轉效率與貢獻度
            </p>

            {/* 設備列表 */}
            <div className="space-y-4">
                {defaultEquipment.map((eq, index) => (
                    <div
                        key={index}
                        className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                    >
                        {/* 設備名稱和狀態 */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(eq.color)}
                                <div>
                                    <h4 className="text-white font-medium">{eq.name}</h4>
                                    <p className="text-xs text-slate-500">估算耗能 {eq.efficiency}%</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full ${eq.color === 'green'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                    }`}>
                                    {eq.status}
                                </span>
                            </div>
                        </div>

                        {/* 進度條 */}
                        <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">能效等級</span>
                                <span className="text-slate-300">{eq.rating}</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${eq.color === 'green'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                                        : 'bg-gradient-to-r from-orange-500 to-yellow-400'
                                        }`}
                                    style={{ width: `${eq.efficiency}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* 節能潛力 */}
                        <div className="text-xs text-slate-400">
                            節能潛力: <span className={eq.savingPotential.includes('高') ? 'text-orange-400' : 'text-green-400'}>
                                {eq.savingPotential}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 下載詳細清單按鈕 */}
            <button className="w-full mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all">
                下載詳細清單
            </button>
        </div>
    );
}
