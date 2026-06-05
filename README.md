# InterviewerHelp — AI 候選人評估工具

面試官 / 招募經理專用的 AI 履歷評估工具。上傳候選人 CV，自動比對職缺需求，產生專業評估報告與面試問題建議。

## 功能

- **五維度評估**：技術適配度、經驗相關性、成就品質、文化適配度、成長潛力
- **紅旗偵測**：自動識別短期跳槽、職涯空窗、誇大嫌疑
- **面試問題建議**：根據 CV 生成技術驗證、行為面試、經驗深挖等針對性問題
- **關鍵字比對**：JD 要求 vs CV 內容的匹配度分析
- **技能評估**：強匹配、部分匹配、缺少關鍵技能、額外加分

## 技術棧

- **Framework**: Next.js 16 (App Router, React 19)
- **AI**: Azure OpenAI (GPT-5.4-mini)
- **Storage**: Azure Table Storage + Blob Storage
- **UI**: shadcn/ui + Tailwind CSS v4
- **Auth**: Azure SWA 內建認證
- **Deployment**: Azure Static Web Apps

## 開發

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env.local
# 編輯 .env.local 填入 Azure 金鑰

# 啟動開發伺服器
npm run dev
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | 模型部署名稱 |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage 連線字串 |
| `NEXT_PUBLIC_SITE_URL` | 站點 URL |

## 與 CareerOS 的關係

本專案基於 [CareerOS](https://github.com/JeffAPAC/careeros) 的架構，但視角翻轉：

| | CareerOS | InterviewerHelp |
|---|---|---|
| 目標用戶 | 求職者 | 面試官/招募經理 |
| 核心功能 | 履歷優化建議 | 候選人適配度評估 |
| AI 角色 | 職涯顧問 | 資深招募主管 |
| 輸出 | 改善建議 + 改寫版本 | 評估報告 + 面試問題 |
