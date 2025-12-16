// BERS Dashboard 专业组件库 - 优化版
// 包含所有仪表板组件的实现

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ============================================
// 1. MetricCard - 指标卡片组件
// ============================================

export function MetricCard({ title, value, unit, trend, trendValue, icon: Icon, color = 'blue' }) {
    const colorClasses = {
        blue: {
            bg: 'from-blue-500/20 to-blue-600/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            iconBg: 'bg-blue-500/20'
        },
        green: {
            bg: 'from-green-500/20 to-green-600/10',
            border: 'border-green-500/30',
            text: 'text-green-400',
            iconBg: 'bg-green-500/20'
        },
        orange: {
            bg: 'from-orange-500/20 to-orange-600/10',
            border: 'border-orange-500/30',
            text: 'text-orange-400',
            iconBg: 'bg-orange-500/20'
        },
        purple: {
            bg: 'from-purple-500/20 to-purple-600/10',
            border: 'border-purple-500/30',
            text: 'text-purple-400',
            iconBg: 'bg-purple-500/20'
        }
    };

    const classes = colorClasses[color] || colorClasses.blue;

    // 趋势图标
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

    return (
        <div className={`relative bg-gradient-to-br ${classes.bg} backdrop-blur-md border ${classes.border} rounded-3xl p-6 overflow-hidden hover-lift`}>
            {/* 背景装饰图标 */}
            {Icon && (
                <div className="absolute top-4 right-4 opacity-10">
                    <Icon size={80} />
                </div>
            )}

            {/* 内容 */}
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    {Icon && (
                        <div className={`p-2 rounded-lg ${classes.iconBg}`}>
                            <Icon size={20} className={classes.text} />
                        </div>
                    )}
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-bold text-white">{value}</span>
                    <span className="text-lg text-slate-400">{unit}</span>
                </div>

                {/* 趋势指示 */}
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
                        <TrendIcon size={16} />
                        <span className="font-medium">{trendValue}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// 2. GaugeChart - 油表式指针组件（支持compact模式）
// ============================================

export function GaugeChart({ value, max = 300, currentLevel, title = "建築能效等級", compact = false }) {
    // 计算角度 (-90度到90度，共180度)
    const percentage = Math.min(Math.max(value / max, 0), 1);
    const angle = -90 + (percentage * 180);

    // 定义5个等级区间的颜色
    const segments = [
        { level: '1+', min: 0, max: 100, color: '#10b981', label: '鑽石級' },
        { level: '1', min: 100, max: 140, color: '#22c55e', label: '黃金級' },
        { level: '2', min: 140, max: 180, color: '#eab308', label: '銀級' },
        { level: '3', min: 180, max: 220, color: '#f97316', label: '合格' },
        { level: '4', min: 220, max: 300, color: '#ef4444', label: '待改善' }
    ];

    // Compact模式 - 只显示指针和数字
    if (compact) {
        return (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover-lift h-full flex flex-col justify-center">
                {/* 简化的SVG指针 */}
                <svg viewBox="0 0 200 110" className="w-full h-20 mb-2">
                    {/* 5个等级的弧线 */}
                    {segments.map((seg, i) => {
                        const startAngle = -90 + ((seg.min / max) * 180);
                        const endAngle = -90 + ((seg.max / max) * 180);
                        const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

                        const startX = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
                        const startY = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
                        const endX = 100 + 70 * Math.cos((endAngle * Math.PI) / 180);
                        const endY = 100 + 70 * Math.sin((endAngle * Math.PI) / 180);

                        return (
                            <path
                                key={i}
                                d={`M ${startX} ${startY} A 70 70 0 ${largeArc} 1 ${endX} ${endY}`}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="6"
                                opacity="0.4"
                            />
                        );
                    })}

                    {/* 指针 - 从圆心向外 */}
                    <line
                        x1="100"
                        y1="100"
                        x2={100 + 55 * Math.cos((angle * Math.PI) / 180)}
                        y2={100 + 55 * Math.sin((angle * Math.PI) / 180)}
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{
                            transition: 'all 1s ease-out'
                        }}
                    />
                    <circle cx="100" cy="100" r="4" fill="white" />
                </svg>

                {/* 数值显示 */}
                <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{value.toFixed(1)}</div>
                    <div className="text-xs text-slate-400 mb-2">kWh/m².yr</div>
                    <div className="text-sm font-semibold text-yellow-400">{currentLevel}</div>
                </div>
            </div>
        );
    }

    // 完整模式（原样保留）
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover-lift">
            <h3 className="text-lg font-bold text-white mb-6 text-center">{title}</h3>

            {/* SVG 仪表盘 */}
            <div className="relative">
                <svg viewBox="0 0 200 120" className="w-full">
                    {/* 5个等级的弧线 */}
                    {segments.map((seg, i) => {
                        const startAngle = -90 + ((seg.min / max) * 180);
                        const endAngle = -90 + ((seg.max / max) * 180);
                        const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

                        const startX = 100 + 70 * Math.cos((startAngle * Math.PI) / 180);
                        const startY = 100 + 70 * Math.sin((startAngle * Math.PI) / 180);
                        const endX = 100 + 70 * Math.cos((endAngle * Math.PI) / 180);
                        const endY = 100 + 70 * Math.sin((endAngle * Math.PI) / 180);

                        return (
                            <path
                                key={i}
                                d={`M ${startX} ${startY} A 70 70 0 ${largeArc} 1 ${endX} ${endY}`}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="12"
                                opacity="0.6"
                            />
                        );
                    })}

                    {/* 指针 */}
                    <line
                        x1="100"
                        y1="100"
                        x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
                        y2={100 + 60 * Math.sin((angle * Math.PI) / 180)}
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{
                            transition: 'all 1s ease-out'
                        }}
                    />
                    <circle cx="100" cy="100" r="6" fill="white" />
                </svg>

                {/* 中心数值 */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-2 text-center">
                    <div className="text-4xl font-bold text-white">{value.toFixed(1)}</div>
                    <div className="text-sm text-slate-400">kWh/m².yr</div>
                </div>
            </div>

            {/* 当前等级显示 */}
            <div className="mt-8 text-center">
                <div className="text-2xl font-bold text-yellow-400">{currentLevel}</div>
            </div>
        </div>
    );
}

// ============================================
// 3. EfficiencyTable - 等级对应表格（支持fullWidth和更多建议）
// ============================================

export function EfficiencyTable({ currentEUI, currentLevel, totalArea, fullWidth = false }) {
    // BERS 等级标准（繁体中文+更多建议）
    const levels = [
        {
            level: '1+ 級',
            rating: '鑽石級',
            maxEUI: 100,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            suggestions: [
                '已達最高標準，繼續維持',
                '可申請綠建築標章認證',
                '分享節能經驗給其他建築',
                '考慮導入智慧建築系統',
                '參與碳權交易獲取收益'
            ]
        },
        {
            level: '1 級',
            rating: '黃金級',
            maxEUI: 140,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            suggestions: [
                '優化空調系統運轉策略',
                '導入EMS能源管理系統',
                '考慮安裝太陽能光電板',
                '定期進行設備保養維護',
                '員工節能教育訓練'
            ]
        },
        {
            level: '2 級',
            rating: '銀級',
            maxEUI: 180,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            suggestions: [
                '全面更換高效率LED燈具',
                '空調主機汰換為變頻機組',
                '加裝變頻器於水泵風機',
                '改善建築外殼隔熱性能',
                '設置分區計量監控系統'
            ]
        },
        {
            level: '3 級',
            rating: '合格',
            maxEUI: 220,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            suggestions: [
                '照明系統全面改善翻新',
                '空調效率提升至一級能效',
                '建議委託專業能源審計',
                '檢討契約容量優化方案',
                '建立能源管理標準程序'
            ]
        },
        {
            level: '4 級',
            rating: '待改善',
            maxEUI: 300,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            suggestions: [
                '緊急啟動能源改善計劃',
                '全面設備健檢與更新',
                '聘請專業能源顧問介入',
                '申請政府節能補助方案',
                '擬定3年能源改善路徑圖'
            ]
        }
    ];

    const displaySuggestions = fullWidth ? 5 : 3;

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                等級對應 EUI 目標與改善建議
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">等級</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">目標 EUI</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">需節電量</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">改善建議</th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map((item, index) => {
                            const isCurrentLevel = index + 1 === currentLevel;
                            const savingsKWh = currentEUI > item.maxEUI
                                ? ((currentEUI - item.maxEUI) * totalArea).toFixed(0)
                                : 0;

                            return (
                                <tr
                                    key={index}
                                    className={`border-b border-white/5 transition-all ${isCurrentLevel
                                            ? `${item.bgColor} ${item.borderColor} border-l-4`
                                            : 'hover:bg-white/5'
                                        }`}
                                >
                                    <td className="py-4 px-4">
                                        <div className={`font-bold ${item.color}`}>
                                            {item.level}
                                            {isCurrentLevel && (
                                                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                                    當前
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">{item.rating}</div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-white font-medium">
                                            ≤ {item.maxEUI}
                                        </span>
                                        <span className="text-slate-500 text-sm ml-1">
                                            kWh/m².yr
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {savingsKWh > 0 ? (
                                            <div>
                                                <span className="text-white font-medium">
                                                    {parseFloat(savingsKWh).toLocaleString()}
                                                </span>
                                                <span className="text-slate-500 text-sm ml-1">kWh/yr</span>
                                            </div>
                                        ) : (
                                            <span className="text-emerald-400 text-sm">已達標 ✓</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <ul className="space-y-1">
                                            {item.suggestions.slice(0, displaySuggestions).map((suggestion, i) => (
                                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                    <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
