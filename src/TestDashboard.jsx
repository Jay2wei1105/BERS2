// 简单测试新Dashboard组件的导入和渲染
import React from 'react';
import { Zap, TrendingDown, Activity } from 'lucide-react';
import {
    MetricCard,
    GaugeChart,
    EfficiencyTable
} from './components/DashboardComponents';

export function TestDashboardComponents() {
    console.log('测试: Dashboard组件加载成功');

    return (
        <div className="p-8 space-y-6 bg-slate-900 min-h-screen">
            <h1 className="text-3xl font-bold text-white">Dashboard 组件测试</h1>

            {/* 测试 MetricCard */}
            <div className="space-y-4">
                <h2 className="text-xl text-white">1. MetricCard 测试</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                        title="建筑 EUI"
                        value="150.5"
                        unit="kWh/m².yr"
                        trend="down"
                        trendValue="-5.2%"
                        icon={Zap}
                        color="blue"
                    />
                    <MetricCard
                        title="排碳量"
                        value="75.3"
                        unit="吨CO2/yr"
                        trend="down"
                        trendValue="-3.1%"
                        icon={Activity}
                        color="green"
                    />
                    <MetricCard
                        title="总和得分"
                        value="82"
                        unit="分"
                        trend="up"
                        trendValue="+2.5%"
                        color="purple"
                    />
                </div>
            </div>

            {/* 测试 GaugeChart */}
            <div className="space-y-4">
                <h2 className="text-xl text-white">2. GaugeChart 测试</h2>
                <div className="max-w-md">
                    <GaugeChart
                        value={150.5}
                        max={300}
                        currentLevel="2级"
                        title="建筑能效等级"
                    />
                </div>
            </div>

            {/* 测试 EfficiencyTable */}
            <div className="space-y-4">
                <h2 className="text-xl text-white">3. EfficiencyTable 测试</h2>
                <EfficiencyTable
                    currentEUI={150}
                    currentLevel={2}
                    totalArea={1000}
                />
            </div>
        </div>
    );
}
