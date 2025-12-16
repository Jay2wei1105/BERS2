// BERSe 評估總表組件
// 展示完整的建築能效評估數據

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Activity as ActivityIcon, Download } from 'lucide-react';

// ============================================
// BERSeTable - 評估總表組件
// ============================================

export function BERSeTable({ data }) {
    const [expandedSections, setExpandedSections] = useState({
        basicInfo: true,
        reliability: true,
        exemptionZone: true,
        consumptionZone: true,
        energyIndicators: true,
        spaceData: false,
        equipmentData: false,
        calculation: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // 構建評估表數據
    const buildTableData = () => {
        if (!data) {
            console.warn('BERSeTable: No data provided');
            return [];
        }

        return [
            {
                id: 'basicInfo',
                title: '一、建築物及空調基本資料',
                icon: <FileText size={20} />,
                rows: [
                    { label: '建築物名稱', value: data?.building_name || '未命名' },
                    { label: '建築物地址', value: data?.basic_info?.address || '-' },
                    { label: '總樓地板面積', value: `${data?.total_area?.toLocaleString() || 0} m²` },
                    { label: '評估樓地板面積', value: `${data?.total_area?.toLocaleString() || 0} m²` },
                    { label: '地上總樓層數', value: `${data?.basic_info?.floorsAbove || '-'} 層` },
                    { label: '地下總樓層數', value: `${data?.basic_info?.floorsBelow || '-'} 層` },
                    { label: '實際年總耗電量 (EUI)', value: `${data?.calculated_eui || 0} kWh/(m².yr)` },
                    { label: '雨中水年利用量', value: `${data?.water_data?.rainwater || 0} m³` },
                    { label: '其他特殊用電', value: `${data?.special_electricity || 0} kWh/(m².yr)` },
                    { label: '城鄉係數', value: `${data?.ur_coefficient || 1.0}` },
                    { label: '建築分類', value: getBuildingTypeName(data?.building_type) },
                    { label: '空調系統類型', value: data?.ac_system || '中央空調' },
                    { label: '評估日期', value: formatDate(data?.created_at) }
                ]
            },
            {
                id: 'reliability',
                title: '二、用電信賴度檢驗',
                icon: <ActivityIcon size={20} />,
                rows: [
                    { label: '年總耗電量', value: `${data?.annual_electricity?.toLocaleString() || '-'}`, unit: '(kWh/yr)' },
                    {
                        label: '日平均用電量之最大月電量變動率',
                        type: 'check',
                        isPass: true,
                        conditions: ['合格(<50%)', '不合格']
                    },
                    {
                        label: '日平均用電量之年變動率',
                        type: 'check',
                        isPass: true,
                        conditions: ['合格(<50%)', '不合格']
                    }
                ]
            },
            {
                id: 'exemptionZone',
                title: '三、BERSe免評估分區資料',
                icon: <FileText size={20} />,
                rows: data?.exemption_zones || [],
                footer: {
                    totalArea: data?.exemption_total_area || '-',
                    totalElec: data?.exemption_total_elec || '-'
                }
            },
            {
                id: 'consumptionZone',
                title: '四、BERSe耗能分區資料',
                icon: <FileText size={20} />,
                rows: data?.consumption_zones || [],
                footer: {
                    assessedArea: data?.total_area || '-',
                    totalZoneElec: '-',
                    te: data?.annual_electricity?.toLocaleString() || '-',
                    et: '-',
                    ep: '-',
                    eh: '-',
                    ee: data?.special_electricity || '-',
                    teui: '-',
                    majorEui: '-'
                }
            },
            {
                id: 'energyIndicators',
                title: '五、能效指標',
                icon: <FileText size={20} />,
                rows: [
                    { label: 'EUI 最小值', value: '-', unit: 'kWh/(m².yr)', label2: 'EUI GB 基準值 EUIg', value2: '-', unit2: 'kWh/(m².yr)' },
                    { label: 'EUI 中位值', value: '-', unit: 'kWh/(m².yr)', label2: 'EUI 最大值 EUImax', value2: '-', unit2: 'kWh/(m².yr)' },
                    { label: "耗電密度差距", value: '-', unit: 'kWh/(m².yr)', isWide: true },
                    { label: '耗電密度指標', value: '-', unit: 'kWh/(m².yr)', isWide: true },
                    { label: '碳排密度指標', value: '-', unit: 'kgCO2/(m².yr)', isWide: true },
                    { label: '能效得分計算', value: '-', unit: '分', isWide: true },
                    { label: '能效等級判定', value: calculateBERSLevel(data?.calculated_eui), unit: '等級', isWide: true, highlight: true }
                ]
            },
        ];
    };

    const tableData = buildTableData();

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            {/* 表頭 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">BERSe 評估總表</h2>
                    <p className="text-sm text-slate-400">建築能效評估完整數據報告</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors">
                    <Download size={16} />
                    下載報告
                </button>
            </div>

            {/* 評估表內容 */}
            <div className="space-y-4">
                {tableData.map((section) => (
                    <div
                        key={section.id}
                        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                    >
                        {/* 章節標題 */}
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-blue-400">{section.icon}</div>
                                <h3 className="text-lg font-bold text-white">{section.title}</h3>
                                <span className="text-sm text-slate-500">({section.rows.length} 項目)</span>
                                {section.header && <span className="text-xs text-slate-500 ml-2">{section.header}</span>}
                            </div>
                            {expandedSections[section.id] ? (
                                <ChevronUp size={20} className="text-slate-400" />
                            ) : (
                                <ChevronDown size={20} className="text-slate-400" />
                            )}
                        </button>

                        {/* 章節內容 */}
                        {expandedSections[section.id] && (
                            <div className="px-6 pb-4">
                                {/* 1. Basic Info */}
                                {section.id === 'basicInfo' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse border border-white/20 table-fixed">
                                            <colgroup>
                                                <col className="w-[20%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[10%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[20%]" />
                                                <col className="w-[10%]" />
                                            </colgroup>
                                            <tbody className="text-slate-200">
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">建築物名稱</td>
                                                    <td className="border border-white/20 p-3" colSpan="5">{section.rows[0].value}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">建築物地址</td>
                                                    <td className="border border-white/20 p-3" colSpan="5">{section.rows[1].value}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">總樓地板面積</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[2].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">(m²)</td>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">評估樓地板面積 Afe</td>
                                                    <td className="border border-white/20 p-3 text-right text-blue-300 font-medium">{section.rows[3].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">(m²)</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">地上總樓層數</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[4].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">層</td>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">地下總樓層數</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[5].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">層</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">實際年總耗電量</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[6].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">kWh/(m².yr)</td>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">雨中水年利用量</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[7].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">m³</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">其他特殊用電 Ee</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[8].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">kWh/(m².yr)</td>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">城鄉係數 UR</td>
                                                    <td className="border border-white/20 p-3 text-right">{section.rows[9].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* 2. Reliability */}
                                {section.id === 'reliability' && (
                                    <div className="overflow-x-auto">
                                        <div className="text-slate-300 mb-2 font-bold bg-white/10 p-2 rounded">
                                            實際年總耗電量 TE 信賴度檢驗：
                                        </div>
                                        <table className="w-full text-sm border-collapse border border-white/20">
                                            <colgroup>
                                                <col className="w-[40%]" />
                                                <col className="w-[50%]" />
                                                <col className="w-[10%]" />
                                            </colgroup>
                                            <tbody className="text-slate-200">
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">年總耗電量 TE</td>
                                                    <td className="border border-white/20 p-3 text-right text-lg text-blue-300 font-bold">{section.rows[0].value}</td>
                                                    <td className="border border-white/20 p-3 text-center text-slate-400 font-light">{section.rows[0].unit}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">日平均用電量之最大月電量變動率</td>
                                                    <td className="border border-white/20 p-3" colSpan="2">
                                                        <div className="flex items-center justify-end gap-6">
                                                            <label className="flex items-center gap-2">
                                                                <input type="checkbox" checked={section.rows[1].isPass} readOnly className="rounded text-blue-500 bg-white/10 border-white/30" />
                                                                <span>合格(&lt;50%)</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 opacity-50">
                                                                <input type="checkbox" checked={!section.rows[1].isPass} readOnly className="rounded text-red-500 bg-white/10 border-white/30" />
                                                                <span>不合格</span>
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">日平均用電量之年變動率</td>
                                                    <td className="border border-white/20 p-3" colSpan="2">
                                                        <div className="flex items-center justify-end gap-6">
                                                            <label className="flex items-center gap-2">
                                                                <input type="checkbox" checked={section.rows[2].isPass} readOnly className="rounded text-blue-500 bg-white/10 border-white/30" />
                                                                <span>合格(&lt;50%)</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 opacity-50">
                                                                <input type="checkbox" checked={!section.rows[2].isPass} readOnly className="rounded text-red-500 bg-white/10 border-white/30" />
                                                                <span>不合格</span>
                                                            </label>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* 3. Exemption */}
                                {section.id === 'exemptionZone' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse border border-white/20">
                                            <thead>
                                                <tr className="bg-white/10 text-white font-bold">
                                                    <th className="border border-white/20 p-3 text-center">免評估分區</th>
                                                    <th className="border border-white/20 p-3 text-center w-32">Afk面積<br /><span className="text-xs font-normal">(m2)</span></th>
                                                    <th className="border border-white/20 p-3 text-center">年耗電量 Enk 計算公式<br /><span className="text-xs font-normal">(kWh/yr)</span></th>
                                                    <th className="border border-white/20 p-3 text-center w-32">年耗電量<br /><span className="text-xs font-normal">(kWh/yr)</span></th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-200">
                                                {(section.rows.length > 0 ? section.rows : Array(5).fill({})).map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="border border-white/20 p-3 h-10">{row.name || ''}</td>
                                                        <td className="border border-white/20 p-3 h-10 text-right">{row.area || ''}</td>
                                                        <td className="border border-white/20 p-3 h-10">{row.formula || ''}</td>
                                                        <td className="border border-white/20 p-3 h-10 text-right">{row.elec || ''}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold">免評估分區總面積<br />AFn</td>
                                                    <td className="border border-white/20 p-3 text-right text-blue-300 font-medium font-mono text-base">{section.footer.totalArea}</td>
                                                    <td className="border border-white/20 p-3 bg-white/5 font-bold text-right">免評估分區總年耗電量 EN</td>
                                                    <td className="border border-white/20 p-3 text-right text-blue-300 font-medium font-mono text-base">{section.footer.totalElec}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* 4. Consumption Zone */}
                                {section.id === 'consumptionZone' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse border border-white/20">
                                            <thead>
                                                <tr className="bg-white/10 text-white font-bold">
                                                    <th className="border border-white/20 p-2 text-center">耗能分區</th>
                                                    <th className="border border-white/20 p-2 text-center">面積<br /><span className="text-xs font-normal">m2</span></th>
                                                    <th className="border border-white/20 p-2 text-center">AEUIm<br /><span className="text-xs font-normal">kWh/(m².yr)</span></th>
                                                    <th className="border border-white/20 p-2 text-center">LEUIm<br /><span className="text-xs font-normal">kWh/(m².yr)</span></th>
                                                    <th className="border border-white/20 p-2 text-center">EEUIm<br /><span className="text-xs font-normal">kWh/(m².yr)</span></th>
                                                    <th className="border border-white/20 p-2 text-center">城鄉係數UR</th>
                                                    <th className="border border-white/20 p-2 text-center">空間營運率<br /><span className="text-xs font-normal">SORi</span></th>
                                                    <th className="border border-white/20 p-2 text-center">年耗電量<br /><span className="text-xs font-normal">(kWh/yr)</span></th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-200">
                                                {(section.rows.length > 0 ? section.rows : Array(8).fill({})).map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td className="border border-white/20 p-2 h-10">{row.name || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-right">{row.area || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-right">{row.aeui || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-right">{row.leui || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-right">{row.eeui || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-center">{row.ur || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-center">{row.sor || ''}</td>
                                                        <td className="border border-white/20 p-2 h-10 text-right">{row.elec || ''}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold">評估分區總面積</td>
                                                    <td className="border border-white/20 p-2 text-right text-blue-300 font-bold">{section.footer.assessedArea}</td>
                                                    <td className="border border-white/20 p-2" colSpan="3"></td>
                                                    <td className="border border-white/20 p-2 text-center">1.0</td>
                                                    <td className="border border-white/20 p-2" colSpan="2"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold" colSpan="7">
                                                        耗能分區總年耗電量 UR × Σ [(AEUIm + LEUIm + EEUIm) × SORi × Afi]
                                                    </td>
                                                    <td className="border border-white/20 p-2 text-right text-blue-300 font-bold">{section.footer.totalZoneElec}</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold">實際年總耗電量 TE</td>
                                                    <td className="border border-white/20 p-2 text-right" colSpan="2">{section.footer.te}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/yr</td>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold">輸送設備年耗電量 Et</td>
                                                    <td className="border border-white/20 p-2 text-right" colSpan="2">{section.footer.et}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/yr</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold">揚水設備年耗電量 Ep</td>
                                                    <td className="border border-white/20 p-2 text-right" colSpan="2">{section.footer.ep}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/yr</td>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold">加熱設備年耗電量 Eh</td>
                                                    <td className="border border-white/20 p-2 text-right" colSpan="2">{section.footer.eh}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/yr</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold">其他特殊用電量 Ee</td>
                                                    <td className="border border-white/20 p-2 text-right" colSpan="2">{section.footer.ee}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/yr</td>
                                                    <td className="border border-white/20 p-2" colSpan="3"></td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold" colSpan="5">總耗電密度 TEUI = TE / (AFe + AFn)</td>
                                                    <td className="border border-white/20 p-2 text-right text-red-400 font-bold" colSpan="2">{section.footer.teui}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/(m².yr)</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-white/20 p-2 bg-white/5 font-bold" colSpan="5">主設備用電密度 EUI' = [TE - UR×(EN+Et+Ep+Eh) - Ee] / Afe</td>
                                                    <td className="border border-white/20 p-2 text-right text-red-400 font-bold" colSpan="2">{section.footer.majorEui}</td>
                                                    <td className="border border-white/20 p-2 text-center text-slate-400">kWh/(m².yr)</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* 5. Energy Indicators Custom Render */}
                                {section.id === 'energyIndicators' && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse border border-white/20 table-fixed">
                                            <colgroup>
                                                <col className="w-[15%]" />
                                                <col className="w-[18%]" />
                                                <col className="w-[17%]" />
                                                <col className="w-[15%]" />
                                                <col className="w-[18%]" />
                                                <col className="w-[17%]" />
                                            </colgroup>
                                            <tbody className="text-slate-200">
                                                {/* Rows 1 & 2: Split columns */}
                                                {section.rows.slice(0, 2).map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">{row.label}</td>
                                                        <td className="border border-white/20 p-3 text-right">{row.value}</td>
                                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">{row.unit}</td>
                                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">{row.label2}</td>
                                                        <td className="border border-white/20 p-3 text-right">{row.value2}</td>
                                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">{row.unit2}</td>
                                                    </tr>
                                                ))}
                                                {/* Rows 3+: Full width label */}
                                                {section.rows.slice(2).map((row, i) => (
                                                    <tr key={i + 2}>
                                                        <td className="border border-white/20 p-3 bg-white/5 font-bold" colSpan="4">{row.label}</td>
                                                        <td className={`border border-white/20 p-3 text-right ${row.highlight ? 'text-green-400 font-bold text-lg' : 'text-red-400'}`}>
                                                            {row.value}
                                                        </td>
                                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">{row.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Default Render for others */}
                                {!['basicInfo', 'reliability', 'exemptionZone', 'consumptionZone', 'energyIndicators'].includes(section.id) && (
                                    <table className="w-full text-sm border-collapse border border-white/20">
                                        <tbody>
                                            {section.rows.map((row, index) => (
                                                <tr key={index} className={`border-t border-white/5 ${row.highlight ? 'bg-blue-500/10' : ''}`}>
                                                    <td className="py-3 px-4 border border-white/20 text-slate-400 w-1/3">{row.label}</td>
                                                    <td className={`py-3 px-4 border border-white/20 font-medium ${row.highlight ? 'text-blue-400' : 'text-slate-200'}`}>{row.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// 輔助函式

function getBuildingTypeName(type) {
    const map = {
        'office': '辦公類',
        'hotel': '旅館類',
        'retail': '百貨商場類',
        'hospital': '醫院類',
        'other': '其他'
    };
    return map[type] || '未分類';
}

function getSpaceTypeName(type) {
    const map = {
        'office': '辦公空間',
        'meeting': '會議室',
        'lounge': '休息區',
        'server': '機房',
        'store': '倉儲'
    };
    return map[type] || type;
}

function calculateBERSLevel(eui) {
    if (!eui) return '-';
    if (eui < 100) return '1+ 級 (鑽石級)';
    if (eui < 140) return '1 級 (黃金級)';
    if (eui < 180) return '2 級 (銀級)';
    if (eui < 220) return '3 級 (合格)';
    return '4 級 (待改善)';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-TW');
    } catch (e) {
        return dateStr;
    }
}

function formatEquipment(category, items) {
    if (!items || items.length === 0) return [];
    return items.map((item, index) => ({
        label: `${category} ${index + 1}`,
        value: `${item.type} - ${item.model}`
    }));
}
