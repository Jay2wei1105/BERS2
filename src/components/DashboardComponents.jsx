// BERS Dashboard 专业组件库
// 包含所有仪表板组件的实现

import React from 'react';
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
// 2. GaugeChart - 油表式指针组件
// ============================================

export function GaugeChart({ value, max = 300, levels, currentLevel, title = "建筑能效等级" }) {
    // 计算角度（180度半圆）
    const percentage = Math.min(Math.max(value / max, 0), 1);
    const angle = -90 + (percentage * 180); // 从左侧-90度到右侧90度

    // 默认等级配置
    const defaultLevels = levels || [
        { max: 100, label: '1+级', color: '#10b981', range: [0, 100] },
        { max: 140, label: '1级', color: '#3b82f6', range: [100, 140] },
        { max: 180, label: '2级', color: '#f59e0b', range: [140, 180] },
        { max: 220, label: '3级', color: '#f97316', range: [180, 220] },
        { max: 300, label: '4级', color: '#ef4444', range: [220, 300] }
    ];

    return (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h3 className="text-slate-400 text-sm font-medium mb-4 text-center">{title}</h3>

            {/* SVG 仪表盘 */}
            <div className="relative w-full aspect-[2/1] max-w-sm mx-auto">
                <svg viewBox="0 0 200 120" className="w-full h-full">
                    {/* 背景弧线 - 分段颜色 */}
                    {defaultLevels.map((level, index) => {
                        const prevMax = index > 0 ? defaultLevels[index - 1].max : 0;
                        const startAngle = -90 + (prevMax / max) * 180;
                        const endAngle = -90 + (level.max / max) * 180;
                        const radius = 80;
                        const thickness = 20;

                        return (
                            <path
                                key={index}
                                d={describeArc(100, 100, radius, startAngle, endAngle)}
                                fill="none"
                                stroke={level.color}
                                strokeWidth={thickness}
                                opacity={0.3}
                            />
                        );
                    })}

                    {/* 激活的弧线 */}
                    <path
                        d={describeArc(100, 100, 80, -90, angle)}
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth={20}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />

                    {/* 渐变定义 */}
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>

                    {/* 指针 */}
                    <g transform={`rotate(${angle} 100 100)`} className="transition-transform duration-1000 ease-out">
                        <line x1="100" y1="100" x2="100" y2="30" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="6" fill="white" />
                    </g>

                    {/* 中心值显示 */}
                    <text x="100" y="95" textAnchor="middle" className="fill-white text-2xl font-bold">
                        {value}
                    </text>
                    <text x="100" y="110" textAnchor="middle" className="fill-slate-400 text-xs">
                        kWh/m².yr
                    </text>
                </svg>
            </div>

            {/* 当前等级显示 */}
            <div className="text-center mt-4">
                <div className="inline-block px-4 py-2 rounded-full bg-white/10 border border-white/20">
                    <span className="text-white font-bold text-lg">{currentLevel}</span>
                </div>
            </div>

            {/* 等级图例 */}
            <div className="grid grid-cols-5 gap-2 mt-4">
                {defaultLevels.map((level, index) => (
                    <div key={index} className="text-center">
                        <div
                            className="w-full h-1.5 rounded-full mb-1"
                            style={{ backgroundColor: level.color }}
                        />
                        <span className="text-xs text-slate-400">{level.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 辅助函数：描述SVG弧线路径
function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// ============================================
// 3. EfficiencyTable - 等级对应表格
// ============================================

export function EfficiencyTable({ currentEUI, currentLevel, totalArea }) {
    // BERS 等级标准
    const levels = [
        {
            level: '1+ 级',
            rating: '钻石级',
            maxEUI: 100,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30',
            suggestions: ['已达最高标准', '可申请绿建筑标章', '建议维持现状']
        },
        {
            level: '1 级',
            rating: '黄金级',
            maxEUI: 140,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            suggestions: ['优化空调系统', '导入EMS能源管理', '考虑太阳能板']
        },
        {
            level: '2 级',
            rating: '银级',
            maxEUI: 180,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            suggestions: ['更换高效LED', '空调主机汰换', '加装变频器']
        },
        {
            level: '3 级',
            rating: '合格',
            maxEUI: 220,
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            suggestions: ['照明系统全面翻新', '空调效率提升', '建议能源审计']
        },
        {
            level: '4 级',
            rating: '待改善',
            maxEUI: 300,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            suggestions: ['紧急能源改善计划', '全面设备更新', '专业顾问介入']
        }
    ];

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                等级对应 EUI 目标与改善建议
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">等级</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">目标 EUI</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">需节电量</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">改善建议</th>
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
                                                    当前
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
                                            <span className="text-emerald-400 text-sm">已达标 ✓</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4">
                                        <ul className="space-y-1">
                                            {item.suggestions.slice(0, 2).map((suggestion, i) => (
                                                <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                    <span className="text-blue-400 mt-1">•</span>
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

// ============================================
// 通用样式
// ============================================

// hover-lift 动画样式（需添加到全局CSS）
const globalStyles = `
.hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
`;
