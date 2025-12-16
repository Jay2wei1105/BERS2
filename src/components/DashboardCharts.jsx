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

    if (!data || data.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <p className="text-slate-400 text-center">暫無趨勢數據</p>
            </div>
        );
    }

    // 計算最大值用於縮放
    const maxValue = Math.max(...data.flatMap(d => [d.year2023 || 0, d.year2024 || 0]));
    const chartHeight = 200;

    // 計算點的位置
    const calculateY = (value) => {
        return chartHeight - (value / maxValue) * chartHeight;
    };

    // 生成路徑
    const generatePath = (yearKey) => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = calculateY(d[yearKey]);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                    用電趨勢分析
                </h3>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-slate-400">{years?.[0] || '2023'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm text-slate-400">{years?.[1] || '2024'}</span>
                    </div>
                </div>
            </div>

            {/* Hover提示 */}
            {interactive && hoveredIndex !== null && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-medium">{data[hoveredIndex]?.month}</span>
                        <div className="flex gap-4">
                            <span className="text-blue-400">{years?.[0]}: {data[hoveredIndex]?.year2023?.toLocaleString()} kWh</span>
                            <span className="text-green-400">{years?.[1]}: {data[hoveredIndex]?.year2024?.toLocaleString()} kWh</span>
                        </div>
                    </div>
                </div>
            )}

            {/* SVG 圖表 */}
            <svg viewBox="0 0 100 60" className="w-full" style={{ height: '250px' }}>
                <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* 網格線 */}
                {[0, 20, 40, 60, 80, 100].map(y => (
                    <line
                        key={y}
                        x1="0"
                        y1={y * 0.5}
                        x2="100"
                        y2={y * 0.5}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="0.2"
                    />
                ))}

                {/* 2023年度線條 */}
                <path
                    d={generatePath('year2023')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="0.5"
                    className="transition-all duration-1000"
                />

                {/* 2024年度線條 */}
                <path
                    d={generatePath('year2024')}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    className="transition-all duration-1000"
                />

                {/* 數據點（交互）*/}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const isHovered = hoveredIndex === i;
                    return (
                        <g key={i}>
                            {interactive && (
                                <rect
                                    x={x - 2}
                                    y={0}
                                    width={4}
                                    height={50}
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    style={{ cursor: 'pointer' }}
                                />
                            )}
                            <circle
                                cx={x}
                                cy={calculateY(d.year2023) * 0.5}
                                r={isHovered ? "1.2" : "0.8"}
                                fill="#3b82f6"
                                className="transition-all"
                            />
                            <circle
                                cx={x}
                                cy={calculateY(d.year2024) * 0.5}
                                r={isHovered ? "1.2" : "0.8"}
                                fill="#10b981"
                                className="transition-all"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* 月份標籤 */}
            <div className="grid grid-cols-12 gap-1 mt-2">
                {data.map((d, i) => (
                    <div
                        key={i}
                        className={`text-center text-xs ${hoveredIndex === i ? 'text-white font-bold' : 'text-slate-500'} transition-all`}
                        onMouseEnter={() => interactive && setHoveredIndex(i)}
                        onMouseLeave={() => interactive && setHoveredIndex(null)}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                    >
                        {d.month}
                    </div>
                ))}
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
