// Demo範例數據 - 用於Dashboard預覽
export const DEMO_DATA = {
    building_name: "範例辦公大樓",
    building_type: "office",
    created_at: new Date().toISOString(),
    total_area: 5000,
    annual_electricity: 750000,
    calculated_eui: 150,
    bers_rating: 3,

    basic_info: {
        companyName: "範例企業有限公司",
        address: "台北市信義區範例路123號",
        floorsAbove: 15,
        floorsBelow: 3
    },

    electricity_years: [2023, 2024],
    electricity_data: [
        [65000, 62000],  // 1月
        [63000, 60000],  // 2月
        [64000, 61500],  // 3月
        [62000, 59000],  // 4月
        [61000, 58500],  // 5月
        [63000, 60500],  // 6月
        [65000, 62500],  // 7月
        [66000, 63000],  // 8月
        [64000, 61000],  // 9月
        [62000, 59500],  // 10月
        [63000, 60000],  // 11月
        [64000, 61500]   // 12月
    ],

    spaces: [
        { name: "辦公區", type: "office", area: 3000 },
        { name: "會議室", type: "meeting", area: 500 },
        { name: "休息區", type: "lounge", area: 300 },
        { name: "機房", type: "server", area: 200 }
    ],

    equipment: {
        ac: [
            { type: "中央空調主機", model: "離心式冰水機組" }
        ],
        lighting: [
            { type: "LED平板燈", model: "T8 18W" }
        ],
        elevator: [
            { type: "直連式電梯", model: "8人座" }
        ],
        serverRoom: [
            { type: "機房空調", model: "精密空調" }
        ]
    },

    ac_system: "中央空調系統",

    // BERSe 評估相關數據
    water_data: {
        rainwater: 120,        // 雨中水年利用量 (m³)
        recycled: 80,          // 中水回收量 (m³)
        total: 200             // 總節水量 (m³)
    },

    special_electricity: 5000,   // 其他特殊用電 (kWh/(m².yr))
    ur_coefficient: 1.0,         // 城鄉係數

    // 免評估分區資料
    exemption_zones: [
        {
            name: '室內停車場',
            area: 1000,
            formula: '1000 × 5',
            elec: 5000
        },
        {
            name: '發電機房',
            area: 200,
            formula: '200 × 20',
            elec: 4000
        },
        {
            name: '消防幫浦室',
            area: 100,
            formula: '100 × 15',
            elec: 1500
        }
    ],
    exemption_total_area: 1300,
    exemption_total_elec: 10500,

    // 耗能分區資料
    consumption_zones: [
        {
            name: '辦公空間A',
            area: 2000,
            aeui: 45,      // 空調耗電密度
            leui: 30,      // 照明耗電密度
            eeui: 10,      // 設備耗電密度
            ur: 1.0,       // 城鄉係數
            sor: 1.0,      // 空間營運率
            elec: 170000   // 年耗電量
        },
        {
            name: '辦公空間B',
            area: 1800,
            aeui: 45,
            leui: 30,
            eeui: 10,
            ur: 1.0,
            sor: 1.0,
            elec: 153000
        },
        {
            name: '會議室',
            area: 500,
            aeui: 50,
            leui: 35,
            eeui: 15,
            ur: 1.0,
            sor: 0.8,
            elec: 40000
        },
        {
            name: '機房',
            area: 200,
            aeui: 60,
            leui: 20,
            eeui: 80,
            ur: 1.0,
            sor: 1.0,
            elec: 32000
        }
    ],

    // 耗能分區腳註數據
    consumption_footer: {
        assessedArea: 4500,           // 評估分區總面積 (扣除免評估分區)
        totalZoneElec: 395000,        // 耗能分區總年耗電量
        te: 750000,                   // 實際年總耗電量 TE (kWh/yr)
        et: 80000,                    // 輸送設備年耗電量 (kWh/yr)
        ep: 30000,                    // 揚水設備年耗電量 (kWh/yr)
        eh: 0,                        // 加熱設備年耗電量 (kWh/yr)
        ee: 5000,                     // 其他特殊用電量 (kWh/yr)
        teui: 119,                    // 總耗電密度 (kWh/(m².yr))
        majorEui: 132                 // 主設備用電密度 (kWh/(m².yr))
    },

    // 能效指標數據
    energy_indicators: {
        euiMin: 80,                   // EUI 最小值
        euiGb: 140,                   // EUI GB 基準值
        euiM: 120,                    // EUI 中位值
        euiMax: 200,                  // EUI 最大值
        deltaEui: 30,                 // 耗電密度差距
        euiStar: 150,                 // 耗電密度指標 EUI*
        ceiStar: 74.25,               // 碳排密度指標 CEI* (= EUI* × 0.495)
        scoreE: 75,                   // 能效得分
        level: '2 級 (銀級)'          // 能效等級判定
    }
};
