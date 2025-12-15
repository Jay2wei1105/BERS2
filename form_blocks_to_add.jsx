/* ========================================
   补充栏位 - 表单区块代码
   请将以下代码插入到 App.jsx 第 940 行之后
   （在 </SectionCard> 和 <div className="pt-4"> 之间）
   ======================================== */

{/* 5. 用水資料 */ }
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

{/* 6. 營運率資料 */ }
<SectionCard icon={<Activity size={16} />} title="營運率資料">
    <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-300">
                💡 提示：營運率會根據建築分類自動調整。一般電梯預設 0.6，電扶梯預設 0.8。
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
            <InputField
                label="電梯營運率 (Or)"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={operationRates.elevatorOR}
                onChange={(e) => updateOperationRates('elevatorOR', e.target.value)}
                placeholder="0.6"
            />
            <InputField
                label="電扶梯營運率 (Osr)"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={operationRates.escalatorOR}
                onChange={(e) => updateOperationRates('escalatorOR', e.target.value)}
                placeholder="0.8"
            />
        </div>

        {/* 建築分類營運率說明 */}
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-slate-300 mb-2">
                <strong className="text-white">建築分類營運率：</strong>
            </p>
            <ul className="text-xs text-slate-400 space-y-1 ml-4">
                <li>• 辦公場所：0.6 (電梯) / 0.8 (電扶梯)</li>
                <li>• 住宿類：0.15 (電梯) / 0.3 (電扶梯)</li>
                <li>• 商場百貨：0.6 (電梯) / 0.9 (電扶梯)</li>
                <li>• 24hr 營運建築：表列營運率 × 80%</li>
            </ul>
        </div>
    </div>
</SectionCard>

{/* 7. 旅館特殊資料 (只在建築類型為旅館時顯示) */ }
{
    (basicInfo.buildingType === 'hotel' || basicInfo.buildingType === 'accommodation') && (
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
    )
}

{/* 8. 醫院特殊資料 (只在建築類型為醫療時顯示) */ }
{
    basicInfo.buildingType === 'medical' && (
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
    )
}
