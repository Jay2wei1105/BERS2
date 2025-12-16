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

    ac_system: "中央空調系統"
};
