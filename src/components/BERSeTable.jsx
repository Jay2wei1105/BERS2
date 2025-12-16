// BERSe 评估总表组件
// 展示完整的建筑能效评估数据

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';

// ============================================
// BERSeTable - 评估总表组件
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

    // 构建评估表数据
    const buildTableData = () => {
        if (!data) return [];

        return [
            {
                id: 'basicInfo',
                title: '一、建筑物及空调基本资料',
                icon: <FileText size={20} />,
                rows: [
                    { label: '建筑物名称', value: data.building_name || '未命名' },
                    { label: '建筑物地址', value: data.basic_info?.address || '-' },
                    { label: '总楼地板面积', value: `${data.total_area?.toLocaleString() || 0} m²` },
                    { label: '地上总楼层数', value: data.basic_info?.floorsAbove || '-' },
                    { label: '地下总楼层数', value: data.basic_info?.floorsBelow || '-' },
                    { label: '建筑分类', value: getBuildingTypeName(data.building_type) },
                    { label: '空调系统类型', value: data.ac_system || '中央空调' },
                    { label: '评估日期', value: formatDate(data.created_at) }
                ]
            },
            {
                id: 'energyIndicators',
                title: '二、能效指标',
                icon: <FileText size={20} />,
                rows: [
                    { label: '年总用电量', value: `${data.annual_electricity?.toLocaleString() || 0} kWh`, highlight: true },
                    { label: '实际 EUI', value: `${data.calculated_eui || 0} kWh/m².yr`, highlight: true },
                    { label: 'BERS 等级', value: calculateBERSLevel(data.calculated_eui), highlight: true },
                    { label: '排碳量', value: `${((data.annual_electricity * 0.502) / 1000).toFixed(2)} 吨CO2/yr` },
                    { label: '电费年度', value: data.electricity_years?.join(', ') || '-' }
                ]
            },
            {
                id: 'spaceData',
                title: '三、空间配置',
                icon: <FileText size={20} />,
                rows: data.spaces?.map((space, i) => ({
                    label: `${space.name} (${space.type})`,
                    value: `${space.area} m²`
                })) || []
            },
            {
                id: 'equipmentData',
                title: '四、设备资料',
                icon: <FileText size={20} />,
                rows: [
                    ...formatEquipment('空调设备', data.equipment?.ac),
                    ...formatEquipment('照明设备', data.equipment?.lighting),
                    ...formatEquipment('电梯设备', data.equipment?.elevator),
                    ...formatEquipment('机房设备', data.equipment?.serverRoom)
                ]
            },
            {
                id: 'calculation',
                title: '五、能效计算明细',
                icon: <FileText size={20} />,
                rows: [
                    { label: '建筑总面积', value: `${data.total_area?.toLocaleString()} m²` },
                    { label: '年总用电量', value: `${data.annual_electricity?.toLocaleString()} kWh` },
                    { label: 'EUI 计算式', value: '年总用电量 ÷ 建筑总面积' },
                    { label: '计算结果', value: `${((data.annual_electricity / data.total_area) || 0).toFixed(2)} kWh/m².yr`, highlight: true },
                    { label: '等级判定', value: calculateBERSLevel(data.calculated_eui), highlight: true }
                ]
            }
        ];
    };

    const tableData = buildTableData();

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            {/* 表头 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">BERSe 评估总表</h2>
                    <p className="text-sm text-slate-400">建筑能效评估完整数据报告</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors">
                    <Download size={16} />
                    下载报告
                </button>
            </div>

            {/* 评估表内容 */}
            <div className="space-y-4">
                {tableData.map((section) => (
                    <div
                        key={section.id}
                        className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                    >
                        {/* 章节标题 */}
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-blue-400">{section.icon}</div>
                                <h3 className="text-lg font-bold text-white">{section.title}</h3>
                                <span className="text-sm text-slate-500">({section.rows.length} 项)</span>
                            </div>
                            {expandedSections[section.id] ? (
                                <ChevronUp size={20} className="text-slate-400" />
                            ) : (
                                <ChevronDown size={20} className="text-slate-400" />
                            )}
                        </button>

                        {/* 章节内容 */}
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
                                                <td className={`py-3 text-right ${row.highlight
                                                        ? 'text-blue-400 font-bold text-base'
                                                        : 'text-white font-medium'
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

            {/* 页脚说明 */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-300">
                    <strong>说明：</strong>本评估表依据「建筑能效评估系统 (BERS)」标准制作，
                    评估结果仅供参考，实际节能效果需视具体改善措施而定。
                </p>
            </div>
        </div>
    );
}

// ============================================
// 辅助函数
// ============================================

function getBuildingTypeName(type) {
    const typeMap = {
        'office': '办公场所',
        'accommodation': '住宿类',
        'hotel': '旅馆',
        'medical': '医疗照护',
        'retail': '商场百货',
        'restaurant': '餐饮场所',
        'entertainment': '娱乐场所',
        'finance': '金融证券',
        'edu': '文教'
    };
    return typeMap[type] || type || '其他';
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function calculateBERSLevel(eui) {
    const euiNum = parseFloat(eui);
    if (euiNum < 100) return '1+ 级 (钻石级)';
    if (euiNum < 140) return '1 级 (黄金级)';
    if (euiNum < 180) return '2 级 (银级)';
    if (euiNum < 220) return '3 级 (合格)';
    return '4 级 (待改善)';
}

function formatEquipment(category, equipmentList) {
    if (!equipmentList || equipmentList.length === 0) {
        return [{ label: category, value: '无' }];
    }

    return equipmentList.map((item, index) => ({
        label: `${category} ${index + 1}`,
        value: item.type || item.name || item.model || '未指定'
    }));
}
