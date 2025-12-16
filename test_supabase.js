// Supabase 连接测试脚本
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ubhqpqszsonosgjixccn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaHFwcXN6c29ub3Nnaml4Y2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mjc5NjEsImV4cCI6MjA3MzAwMzk2MX0.WFW1aklbVy6i162NpZYhFCLwpFtWZ3Xg0k0jQqO9chs'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 測試 Supabase 連接...\n')

// 测试连接并检查 assessments 表
async function testConnection() {
    try {
        // 检查 assessments 表是否存在
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .limit(1)

        if (error) {
            console.error('❌ Supabase 連接失敗:', error.message)
            console.log('\n可能的原因:')
            console.log('1. assessments 表尚未創建')
            console.log('2. 權限設置問題')
            console.log('\n建議: 需要創建 assessments 表')
        } else {
            console.log('✅ Supabase 連接成功!')
            console.log('✅ assessments 表存在')
            if (data && data.length > 0) {
                console.log(`📊 表中已有 ${data.length} 筆記錄`)
            } else {
                console.log('📊 表為空，可以開始使用')
            }
        }
    } catch (err) {
        console.error('❌ 測試過程發生錯誤:', err)
    }
}

testConnection()
