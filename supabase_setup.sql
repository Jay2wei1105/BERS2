-- ================================================
-- BERS 專案 Supabase 數據庫表結構
-- ================================================
-- 執行此 SQL 在 Supabase SQL Editor 中創建 assessments 表
-- ================================================

-- 1. 創建 assessments 表
CREATE TABLE IF NOT EXISTS public.assessments (
    -- 主鍵和時間戳
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 用戶聯繫資訊
    email TEXT,
    contact_name TEXT,
    building_name TEXT,
    building_type TEXT,
    
    -- 建築基本資訊 (JSONB)
    basic_info JSONB,
    
    -- 營運時間資訊 (JSONB)
    schedule_range JSONB,
    
    -- 電費資料
    electricity_years INTEGER[],
    electricity_data JSONB,
    annual_electricity NUMERIC,
    
    -- 空間資料 (JSONB 數組)
    spaces JSONB,
    total_area NUMERIC,
    
    -- 設備資料 (JSONB)
    equipment JSONB,
    ac_system TEXT,
    
    -- 【新增】用水資料 (JSONB)
    water_data JSONB,
    
    -- 【新增】營運率資料 (JSONB)
    operation_rates JSONB,
    
    -- 【新增】旅館特殊資料 (JSONB, nullable)
    hotel_data JSONB,
    
    -- 【新增】醫院特殊資料 (JSONB, nullable)
    hospital_data JSONB,
    
    -- 計算結果
    calculated_eui NUMERIC,
    bers_rating INTEGER,
    zone_details JSONB
);

-- 2. 創建索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_assessments_email ON public.assessments(email);
CREATE INDEX IF NOT EXISTS idx_assessments_building_name ON public.assessments(building_name);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_building_type ON public.assessments(building_type);

-- 3. 添加列註釋
COMMENT ON TABLE public.assessments IS 'BERS 建築能效評估記錄表';
COMMENT ON COLUMN public.assessments.basic_info IS '基本資料（公司名稱、地址、聯繫方式等）';
COMMENT ON COLUMN public.assessments.schedule_range IS '營運時間範圍';
COMMENT ON COLUMN public.assessments.electricity_data IS '12個月 × 2年 的電費資料';
COMMENT ON COLUMN public.assessments.spaces IS '空間面積資料數組';
COMMENT ON COLUMN public.assessments.equipment IS '設備資料（空調、照明、電梯、機房）';
COMMENT ON COLUMN public.assessments.water_data IS '用水資料（水塔高度、盥洗室、餐廳、熱水設備）';
COMMENT ON COLUMN public.assessments.operation_rates IS '營運率資料（電梯、電扶梯）';
COMMENT ON COLUMN public.assessments.hotel_data IS '旅館特殊資料（客房數、住房率）';
COMMENT ON COLUMN public.assessments.hospital_data IS '醫院特殊資料（床數、占床率）';
COMMENT ON COLUMN public.assessments.calculated_eui IS '計算的 EUI (能源使用強度)';
COMMENT ON COLUMN public.assessments.bers_rating IS 'BERS 等級 (1-7)';

-- 4. 啟用 Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- 5. 創建政策：允許所有用戶讀取和插入
CREATE POLICY "允許所有人查看評估記錄"
ON public.assessments FOR SELECT
USING (true);

CREATE POLICY "允許所有人插入評估記錄"
ON public.assessments FOR INSERT
WITH CHECK (true);

-- 6. 創建更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 執行完成後，您的數據庫就準備好了！
-- ================================================

-- 驗證表創建成功
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'assessments' 
ORDER BY ordinal_position;
