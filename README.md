# BERS 建築能效評估系統

台灣建築能效評估系統 (Building Energy Rating System) - 完整的前端計算工具

## 🎯 專案簡介

本專案提供完整的建築能效評估 (BERS) 計算功能，包含：
- 📊 完整的分區參數查找表 (273 筆記錄)
- 🔍 VLOOKUP 查找引擎
- 📈 EUI (能源使用強度) 計算
- 🏆 BERS 等級評估
- 💾 Supabase 資料儲存

## 🚀 技術棧

- **前端框架**: Vite + React 19.2.0
- **樣式**: Tailwind CSS 3.4.17
- **資料庫**: Supabase
- **圖示**: Lucide React
- **語言**: JavaScript (ES6+)

## 📁 專案結構

```
Bers/
├── src/
│   ├── data/                     # 查找表數據
│   │   ├── zoneParameters.js     # 分區計算參數 (273筆)
│   │   ├── exemptZoneParams.js   # 免評估分區參數
│   │   ├── locationFactors.js    # 城鄉係數
│   │   └── soriParameters.js     # 營運率參數
│   ├── utils/
│   │   └── bersCalculator.js     # BERS 計算引擎
│   ├── lib/
│   │   └── supabaseClient.js     # Supabase 客戶端
│   ├── App.jsx                   # 主應用程式
│   └── main.jsx                  # 入口文件
├── public/
├── 建築能效計算表單.xlsm          # 原始 Excel 資料
├── lookup_tables.json            # 提取的查找表 JSON
└── package.json
```

## 📊 核心功能

### 1. VLOOKUP 查找

```javascript
import { lookupZoneParameter } from './src/utils/bersCalculator.js';

// 查找 B3 辦公大樓中位值參數
const params = lookupZoneParameter('B3', 'm');
// 返回：電器EEUI, 照明LEUI, 空調AEUI 等完整參數
```

### 2. EUI 計算

```javascript
import { calculateZoneEUI } from './src/utils/bersCalculator.js';

const result = calculateZoneEUI({
  zoneCode: 'B3',
  area: 500,
  region: 'north',
  acType: 'intermittent',
  baseline: 'm'
});

// 返回：
// {
//   totalEUI: 82.81,
//   electricalEEUI: 16.93,
//   lightingLEUI: 31.61,
//   airConditioningAEUI: 34.27,
//   breakdown: { ... }
// }
```

### 3. BERS 等級評估

```javascript
import { calculateBERS } from './src/utils/bersCalculator.js';

const bersResult = calculateBERS(
  zones,              // 分區配置
  exemptZones,        // 免評估分區
  totalFloorArea,     // 總樓地板面積
  annualElectricity   // 年用電量
);

// 返回完整的 BERS 評估結果
```

## 🛠️ 安裝與使用

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 生產構建

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 📋 查找表數據

### 分區計算參數
- **總計**: 273 筆記錄
- **包含**: 住宿類、辦公類、商業類等各類建築分區
- **參數**: 電器EEUI、照明LEUI、空調AEUI (全年/間歇，北中南部)

### 免評估分區參數
- **總計**: 26 筆記錄
- **包含**: 機房、廚房、停車場、洗衣間等特殊分區

### 城鄉係數
- **總計**: 372 筆記錄
- **用途**: 根據建築所在地調整能耗基準

## 🔧 環境設定

創建 `.env` 文件並配置 Supabase：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📖 API 文檔

詳見 `src/utils/bersCalculator.js` 中的完整 JSDoc 註釋。

主要函數：
- `lookupZoneParameter(zoneCode, baseline)` - 查找分區參數
- `lookupExemptZoneParameter(zoneCode)` - 查找免評估分區
- `lookupLocationFactor(region)` - 查找城鄉係數
- `calculateZoneEUI(config)` - 計算單一分區 EUI
- `calculateBERS(zones, exemptZones, totalArea, annualElectricity)` - 計算 BERS 等級
- `getAvailableZones()` - 獲取可用分區列表

## 🎨 UI 特色

- ✨ 深色玻璃擬態設計
- 🌓 動態懸停效果
- 📱 完全響應式佈局
- ⚡ 實時計算反饋
- 🎯 智能表單驗證

## 📝 數據來源

所有參數基於台灣綠建築評估手冊 (EEWH) 和建築能效評估標準，從官方 Excel 表單自動提取。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License

## 👨‍💻 作者

Jay Wu

## 🔗 相關連結

- [GitHub Repository](https://github.com/Jay2wei1105/BERS2)
- [Supabase](https://supabase.com/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

⭐ 如果這個專案對您有幫助，請給個星星！
