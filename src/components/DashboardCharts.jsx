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

    const range = typeRanges[buildingType] || typeRanges.default;
    const max = range.max;

    // 計算位置百分比
    const position = Math.min((yourValue / max) * 100, 100);

    // 確定當前級別
    let currentCategory = 'poor';
    let categoryColor = 'text-red-400';
    let categoryLabel = '需改善';

    if (yourValue <= range.excellent) {
        currentCategory = 'excellent';
        categoryColor = 'text-emerald-400';
        categoryLabel = '優秀';
    } else if (yourValue <= range.good) {
        currentCategory = 'good';
        categoryColor = 'text-green-400';
        categoryLabel = '良好';
    } else if (yourValue <= range.average) {
        currentCategory = 'average';
        categoryColor = 'text-yellow-400';
        categoryLabel = '一般';
    } else if (yourValue <= range.poor) {
        currentCategory = 'poor';
        categoryColor = 'text-orange-400';
        categoryLabel = '待改善';
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                同類建築能效率比較
            </h3>
            <p className="text-sm text-slate-400 mb-6">
                {buildingType === 'office' ? '辦公類' : '其他類型'} 建築能效分布
            </p>

            {/* 區間條 */}
            <div className="relative h-16 mb-4">
                {/* 背景漸變條 */}
                <div className="absolute inset-0 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500/30" style={{ width: `${(range.excellent / max) * 100}%` }}></div>
                    <div className="h-full bg-green-500/30" style={{ width: `${((range.good - range.excellent) / max) * 100}%` }}></div>
                    <div className="h-full bg-yellow-500/30" style={{ width: `${((range.average - range.good) / max) * 100}%` }}></div>
                    <div className="h-full bg-orange-500/30" style={{ width: `${((range.poor - range.average) / max) * 100}%` }}></div>
                    <div className="h-full bg-red-500/30" style={{ width: `${((max - range.poor) / max) * 100}%` }}></div>
                </div>

                {/* 當前位置標記 */}
                <div
                    className="absolute top-0 h-full flex items-center transition-all duration-1000"
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                    <div className="relative">
                        {/* 箭頭 */}
                        <div className={`w-0.5 h-20 ${categoryColor.replace('text-', 'bg-')}`}></div>
                        {/* 值標籤 */}
                        <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full ${categoryColor.replace('text-', 'bg-')}/20 border ${categoryColor.replace('text-', 'border-')} whitespace-nowrap`}>
                            <span className={`text-sm font-bold ${categoryColor}`}>{yourValue}</span>
                        </div>
                        {/* 圓點 */}
                        <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${categoryColor.replace('text-', 'bg-')} border-2 border-white animate-pulse`}></div>
                    </div>
                </div>
            </div>

            {/* 刻度標籤 */}
            <div className="relative h-6 mb-4">
                {[
                    { value: range.excellent, label: '優秀' },
                    { value: range.good, label: '良好' },
                    { value: range.average, label: '一般' },
                    { value: range.poor, label: '待改善' }
                ].map((mark, index) => (
                    <div
                        key={index}
                        className="absolute top-0 text-xs text-slate-500"
                        style={{ left: `${(mark.value / max) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                        {mark.value}
                    </div>
                ))}
            </div>

            {/* 統計信息 */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-slate-400 text-xs mb-1">您的表現</p>
                    <p className={`text-lg font-bold ${categoryColor}`}>{categoryLabel}</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                    <p className="text-slate-400 text-xs mb-1">優於同類</p>
                    <p className="text-lg font-bold text-white">{percentile}%</p>
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
// 6. EquipmentAnalysis - 設備能耗效率分析
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
