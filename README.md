# InterviewerHelp — AI 候選人評估工具

面試官 / 招募經理專用。上傳候選人 CV + 貼上 JD，AI 自動產生五維度評估報告與面試問題建議。

---

## 1. 系統架構總覽

```
┌──────────────────────────────────────────────────────────────────────┐
│ Browser (使用者)                                                     │
│   - 上傳 CV (PDF/DOCX/TXT/MD, ≤10MB)                                 │
│   - 貼上 Job Description                                             │
└─────────────────────────┬────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Azure Static Web Apps (Next.js 16 standalone)                        │
│   ├─ middleware.ts          → CSP + nonce 安全標頭                   │
│   ├─ lib/auth.ts            → SWA x-ms-client-principal 解析         │
│   │                                                                  │
│   ├─ app/page.tsx           → 上傳表單 UI (shadcn/ui + Tailwind v4)  │
│   │                                                                  │
│   └─ app/api/evaluate       → POST 評估 API                          │
│        │                                                             │
│        ├─ lib/file-extract  → pdf-parse / mammoth → 純文字           │
│        ├─ lib/evaluator     → 組 prompt + 呼叫 OpenAI                │
│        ├─ lib/openai-client → 多區 streaming + fallback              │
│        ├─ lib/azure-storage → 上傳 CV 到 Blob                        │
│        └─ lib/azure-table   → 儲存評估結果                           │
└──────┬──────────────────────┬──────────────────────┬────────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌─────────────┐      ┌────────────────┐    ┌────────────────────┐
│ Azure       │      │ Azure Storage  │    │ Azure Storage      │
│ OpenAI      │      │ (Blob)         │    │ (Table)            │
│ gpt-5.4-mini│      │ candidate-cvs/ │    │ evaluations table  │
└─────────────┘      └────────────────┘    └────────────────────┘
```

### 1.1 資料流（單次評估）

1. 使用者上傳 CV + JD → `POST /api/evaluate`
2. [lib/file-extract.ts](lib/file-extract.ts) 萃取純文字（最多 30K 字元，超過會截斷）
3. CV 原檔上傳到 Blob（`candidate-cvs/<timestamp>-<filename>`）
4. [lib/evaluator.ts](lib/evaluator.ts) 組 prompt → [lib/openai-client.ts](lib/openai-client.ts) streaming 呼叫 Azure OpenAI（primary，失敗自動切 fallback region）
5. 回傳 JSON 解析後寫入 Table Storage（`evaluations` table，`PartitionKey=userId`, `RowKey=eval-<ts>-<rand>`）
6. 同步回傳結果給前端渲染

### 1.2 技術棧

| 層        | 選擇                                                                   |
| --------- | ---------------------------------------------------------------------- |
| Framework | Next.js 16（App Router, React 19, output=standalone）                  |
| Language  | TypeScript 5.8                                                         |
| UI        | shadcn/ui + Radix + Tailwind CSS v4 + Recharts                         |
| AI        | Azure OpenAI（GPT-5.4-mini，streaming + JSON mode）                    |
| 多區容錯  | primary / fallback endpoint 雙活                                       |
| Storage   | Azure Storage Account：Blob（CV 原檔）+ Table（評估結果）              |
| Auth      | Azure Static Web Apps 內建身分（`x-ms-client-principal` header）       |
| Hosting   | Azure Static Web Apps                                                  |
| CI/CD     | GitHub Actions（[.github/workflows/ci.yml](.github/workflows/ci.yml)） |
| 測試      | Vitest                                                                 |

### 1.3 檔案結構速查

```
app/
├─ page.tsx                上傳表單頁
├─ layout.tsx              全站 layout
├─ globals.css             Tailwind v4
└─ api/evaluate/route.ts   評估 API endpoint

components/
├─ evaluator-tool.tsx      上傳 + 結果展示主元件
├─ header.tsx              站頭
└─ ui/                     shadcn 元件（button/card/progress）

lib/
├─ openai-client.ts        多區 streaming + AbortController + JSON 解析
├─ evaluator.ts            候選人評估流程（mode: jd-match / quick-screen）
├─ prompts.ts              system / user prompt 模板
├─ file-extract.ts         PDF / DOCX / TXT / MD 文字萃取
├─ azure-storage.ts        Blob upload
├─ azure-table.ts          Table CRUD
├─ auth.ts                 SWA 身分解析（dev 模式有 mock user）
├─ types.ts                共用型別
└─ utils.ts                cn() 等 helper

middleware.ts              CSP nonce 注入
scripts/setup-azure.ps1    一鍵建立 Azure 資源
```

---

## 2. Azure 資源

| 資源            | 名稱                                                               | 用途                                                |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------- |
| Resource Group  | `rg-interviewerhelp`                                               | 容器                                                |
| Storage Account | `interviewerhelpstor`                                              | Blob (`candidate-cvs`) + Table (`evaluations`)      |
| Azure OpenAI    | `aoai-interviewerhelp`（eastus2，獨立資源）                        | GPT-5.4-mini                                        |
| Static Web App  | `swa-interviewerhelp`（eastasia, Standard）                        | <https://red-water-0ac4a4500.7.azurestaticapps.net> |
| Subscription    | `3f899126-8896-4c0a-bdec-cbede0f3032c`（Visual Studio Enterprise） | —                                                   |
| Tenant          | `e0450666-82f8-43c3-b9b8-a232d11be327`                             | —                                                   |

> 本專案的所有 Azure 資源**完全獨立**，不與 CareerOS 共用。

### 直接從網頁存取 Azure

| 用途                                                                          | 網址                                                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Azure Portal**（所有資源主控台）                                            | <https://portal.azure.com>                                                      |
| **Storage 瀏覽**（在 Portal 內看 Blob / Table 內容，不用裝 Storage Explorer） | Portal → Storage Account → 左側 _Storage browser_                               |
| **Azure AI Foundry**（看 / 管 OpenAI 部署、跑 playground、看 metrics）        | <https://ai.azure.com>                                                          |
| **Azure OpenAI Studio**（舊版 playground，仍可用）                            | <https://oai.azure.com>                                                         |
| **Cloud Shell**（瀏覽器內直接跑 `az` CLI，免裝）                              | <https://shell.azure.com>                                                       |
| **Static Web Apps 管理**（部署狀態、環境變數、自訂網域）                      | Portal → 搜尋 _Static Web Apps_                                                 |
| **Cost Management**（看花費）                                                 | <https://portal.azure.com/#view/Microsoft_Azure_CostManagement/Menu/~/overview> |

> 第一次進去要先選對 tenant：右上角 _Directories + subscriptions_ → 切到 `e0450666-82f8-43c3-b9b8-a232d11be327`，並把 subscription filter 勾上 `3f899126-...`（Visual Studio Enterprise）。

---

## 3. 環境變數

| 變數                              | 必填 | 說明                                                                     |
| --------------------------------- | ---- | ------------------------------------------------------------------------ |
| `AZURE_OPENAI_ENDPOINT`           | ✅   | 主區 endpoint，例 `https://aoai-interviewerhelp-965b1.openai.azure.com/` |
| `AZURE_OPENAI_API_KEY`            | ✅   | 主區 API key                                                             |
| `AZURE_OPENAI_DEPLOYMENT_NAME`    | ✅   | 部署名稱，預設 `gpt-5.4-mini`                                            |
| `AZURE_OPENAI_FALLBACK_ENDPOINT`  | ⬜   | 備援區 endpoint                                                          |
| `AZURE_OPENAI_FALLBACK_KEY`       | ⬜   | 備援區 key                                                               |
| `AZURE_OPENAI_FALLBACK_MODEL`     | ⬜   | 備援區模型（預設同主區）                                                 |
| `AZURE_STORAGE_CONNECTION_STRING` | ⬜   | 沒設則跳過 Blob/Table 儲存（評估仍可用，但結果不留存）                   |
| `NEXT_PUBLIC_SITE_URL`            | ⬜   | 站點 URL（[app/robots.ts](app/robots.ts) 使用）                          |

範本見 [.env.example](.env.example)。

---

## 4. 開發

```bash
# 安裝依賴
npm install

# 建立 .env.local（從範本複製後填值）
cp .env.example .env.local

# 啟動 dev server（http://localhost:3000）
npm run dev

# 驗證（lint + format + 測試）
npm run validate
```

開發模式下 [lib/auth.ts](lib/auth.ts) 會回傳 `dev-user` mock 身分；要測未登入流程，在瀏覽器設 cookie `dev_auth_state=guest`。

### 一鍵建立 Azure 資源

```powershell
pwsh scripts/setup-azure.ps1
```

會：

1. 登入指定 tenant + 切 subscription
2. 建 Resource Group + Storage Account（Standard_LRS, TLS 1.2）
3. 建 `candidate-cvs` blob container
4. 建專屬 Azure OpenAI 資源 + `gpt-5.4-mini` 部署（eastus2, GlobalStandard）
5. 產生 `.env.local`（含 OpenAI endpoint/key、Storage 連線字串）

> 若 model / region 沒有 quota，可用參數覆寫：`-OpenAILocation eastus -OpenAIModelVersion 2025-04-14`。

---

## 5. 與 CareerOS 的關係

本專案基於 [CareerOS](https://github.com/JeffAPAC/careeros) 的架構，視角翻轉，**Azure 資源完全獨立切開**：

|                    | CareerOS            | InterviewerHelp                 |
| ------------------ | ------------------- | ------------------------------- |
| 目標用戶           | 求職者              | 面試官 / 招募經理               |
| 核心功能           | 履歷優化建議        | 候選人適配度評估                |
| AI 角色            | 職涯顧問            | 資深招募主管                    |
| 輸出               | 改善建議 + 改寫版本 | 評估報告 + 面試問題             |
| Azure Subscription | 另一個訂閱          | `3f899126-...`（VS Enterprise） |
| Azure OpenAI 資源  | CareerOS 自己的     | 獨立 `aoai-interviewerhelp`     |
| Storage            | 獨立 `careeros*`    | 獨立 `interviewerhelpstor`      |

---

## 6. 評估功能細節

- **五維度評分**：技術適配度 / 經驗相關性 / 成就品質 / 文化適配度 / 成長潛力
- **紅旗偵測**：短期跳槽、職涯空窗、誇大嫌疑
- **面試問題建議**：技術驗證 / 行為面試 / 經驗深挖
- **關鍵字比對**：JD 要求 vs CV 內容匹配度
- **技能評估**：強匹配 / 部分匹配 / 缺少關鍵技能 / 額外加分
- **雙模式**：`jd-match`（有 JD）/ `quick-screen`（無 JD，快速篩選）

token 預算依 CV 長度自動調整（5000–9000 `max_completion_tokens`），timeout 20–22 秒，回應 truncate 會丟 `AnalysisTruncatedError`。
