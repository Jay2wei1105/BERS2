// BERSe 評估總表組件
// 展示完整的建築能效評估數據

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';

// ============================================
// BERSeTable - 評估總表組件
// ============================================

export function BERSeTable({ data }) {
    const [expandedSections, setExpandedSections] = useState({
        basicInfo: true,
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
                    { label: '評估樓地板面積 Afe', value: `${data?.total_area?.toLocaleString() || 0} m²` }, // 暫時假設等於總面積
                    { label: '地上總樓層數', value: `${data?.basic_info?.floorsAbove || '-'} 層` },
                    { label: '地下總樓層數', value: `${data?.basic_info?.floorsBelow || '-'} 層` },
                    { label: '實際年總耗電量 (EUI)', value: `${data?.calculated_eui || 0} kWh/(m².yr)` }, // 依截圖單位，此處指 EUI
                    { label: '雨中水年利用量', value: `${data?.water_data?.rainwater || 0} m³` },
                    { label: '其他特殊用電 Ee', value: `${data?.special_electricity || 0} kWh/(m².yr)` },
                    { label: '城鄉係數 UR', value: `${data?.ur_coefficient || 1.0}` },
                    { label: '建築分類', value: getBuildingTypeName(data?.building_type) },
                    { label: '空調系統類型', value: data?.ac_system || '中央空調' },
                    { label: '評估日期', value: formatDate(data?.created_at) }
                ]
            },
            {
                id: 'reliability',
                title: '二、用電信賴度檢驗',
                icon: <Activity size={20} />,
                header: '實際年總耗電量 TE 信賴度檢驗：',
                rows: [
                    { label: '年總耗電量 TE', value: `${data?.annual_electricity?.toLocaleString() || '-'}`, unit: '(kWh/yr)' },
                    {
                        label: '日平均用電量之最大月電量變動率',
                        type: 'check',
                        isPass: true, // 暫時預設合格，後續可接計算邏輯
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
                id: 'energyIndicators',
                title: '三、能效指標',
                icon: <FileText size={20} />,
                rows: [
                    { label: '年總用電量', value: `${data?.annual_electricity?.toLocaleString() || 0} kWh`, highlight: true },
                    { label: '實際 EUI', value: `${data?.calculated_eui || 0} kWh/m².yr`, highlight: true },
                    { label: 'BERS 等級', value: calculateBERSLevel(data?.calculated_eui), highlight: true },
                    { label: '排碳量', value: `${((data?.annual_electricity * 0.502) / 1000 || 0).toFixed(2)} 噸CO2/yr` },
                    { label: '電費年度', value: data?.electricity_years?.join(', ') || '-' }
                ]
            },
            {
                id: 'spaceData',
                title: '四、空間配置',
                icon: <FileText size={20} />,
                rows: data?.spaces?.map((space, i) => ({
                    label: `${space.name} (${space.type && getSpaceTypeName(space.type)})`,
                    value: `${space.area} m²`
                })) || []
            },
            {
                id: 'equipmentData',
                title: '五、設備資料',
                icon: <FileText size={20} />,
                rows: [
                    ...formatEquipment('空調設備', data?.equipment?.ac),
                    ...formatEquipment('照明設備', data?.equipment?.lighting),
                    ...formatEquipment('電梯設備', data?.equipment?.elevator),
                    ...formatEquipment('機房設備', data?.equipment?.serverRoom)
                ]
            },
            {
                id: 'calculation',
                title: '六、能效計算明細',
                icon: <FileText size={20} />,
                rows: [
                    { label: '建築總面積', value: `${data?.total_area?.toLocaleString() || 0} m²` },
                    { label: '年總用電量', value: `${data?.annual_electricity?.toLocaleString() || 0} kWh` },
                    { label: 'EUI 計算式', value: '年總用電量 ÷ 建築總面積' },
                    { label: '計算結果', value: `${((data?.annual_electricity / data?.total_area) || 0).toFixed(2)} kWh/m².yr`, highlight: true },
                    { label: '等級判定', value: calculateBERSLevel(data?.calculated_eui), highlight: true }
                ]
            }
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
            <div className="space-y-8">
                {/* 一、建築物及空調基本資料 (客製化表格佈局) */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button
                        onClick={() => toggleSection('basicInfo')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors bg-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-blue-400"><FileText size={20} /></div>
                            <h3 className="text-lg font-bold text-white">一、建築物及空調基本資料</h3>
                        </div>
                        {expandedSections.basicInfo ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>

                    {expandedSections.basicInfo && (
                        <div className="p-6 overflow-x-auto">
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
                                    {/* 建築物名稱 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">建築物名稱</td>
                                        <td className="border border-white/20 p-3" colSpan="5">{data?.building_name || '未命名'}</td>
                                    </tr>
                                    {/* 建築物地址 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">建築物地址</td>
                                        <td className="border border-white/20 p-3" colSpan="5">{data?.basic_info?.address || '-'}</td>
                                    </tr>
                                    {/* 總樓地板面積 | 評估樓地板面積 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">總樓地板面積</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.total_area?.toLocaleString() || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">(m²)</td>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">評估樓地板面積 Afe</td>
                                        <td className="border border-white/20 p-3 text-right text-blue-300 font-medium">{data?.total_area?.toLocaleString() || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">(m²)</td>
                                    </tr>
                                    {/* 地上樓層 | 地下樓層 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">地上總樓層數</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.basic_info?.floorsAbove || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">層</td>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">地下總樓層數</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.basic_info?.floorsBelow || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">層</td>
                                    </tr>
                                    {/* 實際耗電量 | 雨中水 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">實際年總耗電量</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.calculated_eui || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">kWh/(m².yr)</td>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">雨中水年利用量</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.water_data?.rainwater || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">m³</td>
                                    </tr>
                                    {/* 特殊用電 | 城鄉係數 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">其他特殊用電 Ee</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.special_electricity || '-'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">kWh/(m².yr)</td>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">城鄉係數 UR</td>
                                        <td className="border border-white/20 p-3 text-right">{data?.ur_coefficient || '1.0'}</td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 二、用電信賴度檢驗 (客製化表格佈局) */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button
                        onClick={() => toggleSection('reliability')}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors bg-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-blue-400"><Activity size={20} /></div>
                            <h3 className="text-lg font-bold text-white">二、用電信賴度檢驗</h3>
                        </div>
                        {expandedSections.reliability ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </button>

                    {expandedSections.reliability && (
                        <div className="p-6 overflow-x-auto">
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
                                    {/* TE */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">年總耗電量 TE</td>
                                        <td className="border border-white/20 p-3 text-right text-lg text-blue-300 font-bold">
                                            {tableData.find(s => s.id === 'reliability')?.rows[0]?.value}
                                        </td>
                                        <td className="border border-white/20 p-3 text-center text-slate-400 font-light">
                                            {tableData.find(s => s.id === 'reliability')?.rows[0]?.unit}
                                        </td>
                                    </tr>
                                    {/* 變動率 1 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">日平均用電量之最大月電量變動率</td>
                                        <td className="border border-white/20 p-3" colSpan="2">
                                            <div className="flex items-center justify-end gap-6">
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={tableData.find(s => s.id === 'reliability')?.rows[1]?.isPass} readOnly className="rounded text-blue-500 bg-white/10 border-white/30" />
                                                    <span>合格(&lt;50%)</span>
                                                </label>
                                                <label className="flex items-center gap-2 opacity-50">
                                                    <input type="checkbox" checked={!tableData.find(s => s.id === 'reliability')?.rows[1]?.isPass} readOnly className="rounded text-red-500 bg-white/10 border-white/30" />
                                                    <span>不合格</span>
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* 變動率 2 */}
                                    <tr>
                                        <td className="border border-white/20 p-3 bg-white/5 font-bold">日平均用電量之年變動率</td>
                                        <td className="border border-white/20 p-3" colSpan="2">
                                            <div className="flex items-center justify-end gap-6">
                                                <label className="flex items-center gap-2">
                                                    <input type="checkbox" checked={tableData.find(s => s.id === 'reliability')?.rows[2]?.isPass} readOnly className="rounded text-blue-500 bg-white/10 border-white/30" />
                                                    <span>合格(&lt;50%)</span>
                                                </label>
                                                <label className="flex items-center gap-2 opacity-50">
                                                    <input type="checkbox" checked={!tableData.find(s => s.id === 'reliability')?.rows[2]?.isPass} readOnly className="rounded text-red-500 bg-white/10 border-white/30" />
                                                    <span>不合格</span>
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 其他章節 (過濾掉 basicInfo 和 reliability) */}
                {tableData.filter(s => s.id !== 'basicInfo' && s.id !== 'reliability').map((section) => (
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
                                <table className="w-full">
                                    <tbody>
                                        {section.rows.map((row, index) => (
                                            <tr
                                                key={index}
                                                className={`border-t border-white/5 ${row.highlight ? 'bg-blue-500/10' : ''
                                                    }`}
                                            >
                                                <td className="py-3 text-slate-400 text-sm w-1/3">
                                                    {row.label}
                                                </td>
                                                <td className={`py-3 text-sm font-medium ${row.highlight ? 'text-blue-400' : 'text-slate-200'
                                                    }`}>
                                                    {row.value}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
