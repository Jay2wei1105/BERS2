// BERS 計算引擎 - VLOOKUP 和能效計算工具
import { zoneParameters } from '../data/zoneParameters.js';
import { exemptZoneParameters } from '../data/exemptZoneParams.js';
import { locationFactors } from '../data/locationFactors.js';
import { soriParameters } from '../data/soriParameters.js';

/**
 * VLOOKUP - 查找分區參數
 * @param {string} zoneCode - 分區代碼（如 'B3'）
 * @param {string} baseline - 基準類型 ('min', 'm', 'max')
 * @returns {object|null} - 分區參數對象
 */
export function lookupZoneParameter(zoneCode, baseline = 'm') {
    const fullCode = `${zoneCode}${baseline}`;
    return zoneParameters.find(row => row.fullCode === fullCode) || null;
}

/**
 * VLOOKUP - 查找免評估分區參數
 * @param {string} zoneCode - 免評估分區代碼（如 'N8', 'N111'）
 * @returns {object|null}
 */
export function lookupExemptZoneParameter(zoneCode) {
    return exemptZoneParameters.find(row => row.code === zoneCode) || null;
}

/**
 * VLOOKUP - 查找城鄉係數
 * @param {string} region - 地區名稱
 * @returns {number} - 係數值
 */
export function lookupLocationFactor(region) {
    const found = locationFactors.find(row => row.region === region);
    return found ? found.factor : 1.0;
}

/**
 * VLOOKUP - 查找營運率
 * @param {string} buildingCode - 建築代碼（如 'B-3'）
 * @returns {object|null}
 */
export function lookupSORi(buildingCode) {
    return soriParameters.find(row => row.buildingCode === buildingCode) || null;
}

/**
 * 計算單一分區的 EUI
 * @param {object} config - 配置對象
 * @param {string} config.zoneCode - 分區代碼
 * @param {number} config.area - 面積 (m²)
 * @param {string} config.region - 地區 ('north'/'center'/'south')
 * @param {string} config.acType - 空調類型 ('fullTime'/'intermittent')
 * @param {string} config.baseline - 基準 ('min'/'m'/'max')
 * @returns {object|null} - 計算結果
 */
export function calculateZoneEUI(config) {
    const {
        zoneCode,
        area,
        region = 'north',
        acType = 'intermittent',
        baseline = 'm'
    } = config;

    // VLOOKUP 查找參數
    const params = lookupZoneParameter(zoneCode, baseline);

    if (!params) {
        console.warn(`找不到分區參數: ${zoneCode}${baseline}`);
        return null;
    }

    // 根據地區和空調類型選擇對應的空調能耗
    const acMapping = {
        fullTime: {
            north: 'fullTimeAC_north',
            center: 'fullTimeAC_center',
            south: 'fullTimeAC_south'
        },
        intermittent: {
            north: 'intermittentAC_north',
            center: 'intermittentAC_center',
            south: 'intermittentAC_south'
        }
    };

    const acKey = acMapping[acType]?.[region];

    if (!acKey) {
        console.warn(`無效的空調類型或地區: ${acType}, ${region}`);
        return null;
    }

    const eeui = params.electricalEEUI || 0;
    const leui = params.lightingLEUI || 0;
    const aeui = params[acKey] || 0;
    const totalEUI = eeui + leui + aeui;

    return {
        zoneCode,
        zoneName: params.description,
        category: params.category,
        area,
        baseline,
        region,
        acType,
        // 各項能耗指標 (kWh/m².yr)
        electricalEEUI: eeui,
        lightingLEUI: leui,
        airConditioningAEUI: aeui,
        totalEUI,
        // 總能耗 (kWh/yr)
        totalEnergy: totalEUI * area,
        // 能耗佔比
        breakdown: {
            electrical: (eeui / totalEUI * 100).toFixed(1) + '%',
            lighting: (leui / totalEUI * 100).toFixed(1) + '%',
            airConditioning: (aeui / totalEUI * 100).toFixed(1) + '%'
        }
    };
}

/**
 * 計算免評估分區的年耗電量
 * @param {string} zoneCode - 免評估分區代碼
 * @param {number} area - 面積 (m²)
 * @param {number} utilizationRate - 使用率 (預設 1.0)
 * @returns {object|null}
 */
export function calculateExemptZoneEnergy(zoneCode, area, utilizationRate = 1.0) {
    const params = lookupExemptZoneParameter(zoneCode);

    if (!params) {
        console.warn(`找不到免評估分區參數: ${zoneCode}`);
        return null;
    }

    const annualEnergy = params.annualEnergy * utilizationRate;

    return {
        zoneCode,
        description: params.description,
        area,
        annualEnergy,
        totalEnergy: annualEnergy * area
    };
}

/**
 * 計算整棟建築的總 EUI 和 BERS 等級
 * @param {Array} zones - 分區配置數組
 * @param {Array} exemptZones - 免評估分區數組
 * @param {number} totalFloorArea - 總樓地板面積
 * @param {number} annualElectricity - 年用電量 (kWh)
 * @returns {object} - 計算結果
 */
export function calculateBERS(zones, exemptZones = [], totalFloorArea, annualElectricity) {
    // 計算評估分區總能耗
    let evaluatedEnergy = 0;
    let evaluatedArea = 0;

    zones.forEach(zone => {
        const result = calculateZoneEUI(zone);
        if (result) {
            evaluatedEnergy += result.totalEnergy;
            evaluatedArea += zone.area;
        }
    });

    // 計算免評估分區總能耗
    let exemptEnergy = 0;
    let exemptArea = 0;

    exemptZones.forEach(zone => {
        const result = calculateExemptZoneEnergy(zone.code, zone.area, zone.utilizationRate || 1.0);
        if (result) {
            exemptEnergy += result.totalEnergy;
            exemptArea += zone.area;
        }
    });

    // 總能耗和總面積
    const totalEnergy = evaluatedEnergy + exemptEnergy;
    const totalArea = evaluatedArea + exemptArea;

    // 計算建築 EUI
    const buildingEUI = totalArea > 0 ? totalEnergy / totalArea : 0;

    // 實際 EUI（如果提供了年用電量）
    const actualEUI = totalFloorArea > 0 && annualElectricity > 0
        ? annualElectricity / totalFloorArea
        : null;

    // BERS 等級計算（簡化版 - 實際應根據建築類型和基準值）
    const getBERSRating = (eui) => {
        if (eui < 50) return 1;
        if (eui < 80) return 2;
        if (eui < 110) return 3;
        if (eui < 140) return 4;
        if (eui < 170) return 5;
        if (eui < 200) return 6;
        return 7;
    };

    return {
        // 面積統計
        totalFloorArea,
        evaluatedArea,
        exemptArea,
        // 能耗統計 (kWh/yr)
        evaluatedEnergy,
        exemptEnergy,
        totalEnergy,
        annualElectricity,
        // EUI (kWh/m².yr)
        calculatedEUI: buildingEUI.toFixed(2),
        actualEUI: actualEUI ? actualEUI.toFixed(2) : null,
        // BERS 等級
        bersRating: getBERSRating(actualEUI || buildingEUI),
        // 能耗分區明細
        zoneDetails: zones.map(zone => calculateZoneEUI(zone)).filter(Boolean)
    };
}

/**
 * 獲取所有可用的分區代碼
 * @returns {Array} - 分區代碼和描述的數組
 */
export function getAvailableZones() {
    const uniqueZones = new Map();

    zoneParameters.forEach(param => {
        if (param.baseline === 'm' && !uniqueZones.has(param.code)) {
            uniqueZones.set(param.code, {
                code: param.code,
                category: param.category,
                description: param.description
            });
        }
    });

    return Array.from(uniqueZones.values());
}

/**
 * 獲取所有可用的免評估分區
 * @returns {Array}
 */
export function getAvailableExemptZones() {
    return exemptZoneParameters.map(p => ({
        code: p.code,
        description: p.description
    }));
}
