# MeetLogic AI MVP - 前端視覺化原型展示

![MeetLogic Banner](https://via.placeholder.com/1200x300.png?text=MeetLogic+AI+MVP+-+Frontend+Visual+Prototype)

MeetLogic 旨在將會議管理從被動的「軟性勸導」升級為「演算法治理」。此專案目前處於 MVP 的前端**視覺化原型展示**階段，主要針對 **Google Meet** 平台，展示核心概念與使用者介面。

**注意：目前為純前端獨立運作模式，所有數據（MHI 分數、AI 總結等）均為介面內部模擬產生，不涉及後端連線與真實 AI 運算。**

---

## 🎯 核心功能 (視覺化原型範圍)

1.  **高科技會議健康指數 (MHI) 監控儀表板**
    *   **動態 MHI 模擬**：在 Google Meet 頁面中注入一個現代化的數據儀表板，即時顯示隨機變動的「會議健康指數 (MHI)」。
    *   **視覺化與數據導向設計**：MHI 分數以醒目、發光的樣式呈現，讓人一眼就能掌握會議「健康」狀態。
    *   **AI 追蹤開關**：模擬啟動/停止 AI 追蹤的按鈕。

2.  **專業 AI 會議總結與自動化預覽**
    *   **詳盡總結 Modal**：點擊按鈕後，彈出一個全螢幕的暗黑風格 Modal，展示高度擬真的「會議摘要」、「關鍵決策」、「行動承諾」等內容。
    *   **自動化任務預覽**：模擬生成 Jira 任務卡片與後續追蹤 Email 草稿，展示「零點擊自動化」的未來願景。

3.  **事前會議成本估算器 (Popup UI)**
    *   點擊 Chrome 擴充功能圖示，會彈出一個介面，允許使用者模擬選擇與會者的角色與數量。
    *   系統會即時顯示根據假定「時薪」計算出的預估會議總成本，凸顯會議的經濟效益考量。

---

## 🛠 技術堆疊

*   **前端 (Client / Browser Extension)**
    *   [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
    *   Chrome Extension Manifest V3
*   **後端 (Server) - 目前未啟用**
    *   Python FastAPI (架構預留，待未來整合真實 AI 模組)
*   **資料庫 (Database) - 目前未啟用**
    *   PostgreSQL (架構預留)

---

## 🚀 如何在本地端運行 (開發者指南)

**目前僅需啟動前端。**

### 1. 前端設定與打包 (Frontend)

確保您已安裝 Node.js (建議 v18+)。

```bash
# 進入前端目錄
cd frontend

# 安裝依賴
npm install

# 打包 Chrome 擴充功能 (會將 popup 和 content script 分開打包)
npm run build
```

打包完成後，編譯好的擴充功能檔案會放在 `frontend/dist` 目錄下。

### 2. 將擴充功能加載至 Chrome 瀏覽器

1.  開啟 Chrome 瀏覽器，網址列輸入並前往 `chrome://extensions`。
2.  開啟右上角的 **「開發人員模式」 (Developer mode)**。
3.  點擊左上角的 **「載入未封裝項目」 (Load unpacked)**。
4.  選擇本專案中的 `frontend/dist` 資料夾。
5.  確認「MeetLogic AI MVP」已成功出現在擴充功能清單中並處於啟用狀態。
6.  **重要：每次修改程式碼並執行 `npm run build` 後，都必須回到 `chrome://extensions` 頁面點擊擴充功能的「重新整理」按鈕，才能載入最新代碼。**

### 3. 開始測試 (前端模擬功能)

1.  **測試 Popup UI (會議成本估算器):**
    *   點擊 Chrome 工具列上的 MeetLogic AI 擴充功能圖示。
    *   彈出的介面讓您模擬調整與會者角色與數量，即時看到預估的會議成本。

2.  **測試 In-Meeting UI (MHI 儀表板與 AI 總結):**
    *   開啟一個 [Google Meet](https://meet.google.com/) 測試會議（您可以自己開一個或加入一個）。
    *   等待約 3 秒，MeetLogic AI 的數據面板會自動出現在會議畫面的右上方。
    *   觀察 MHI 分數的動態變化。
    *   點擊「生成 AI 總結」按鈕，查看詳盡的模擬會議洞察報告 Modal。
    *   點擊「啟動/停止追蹤」按鈕，模擬 AI 分析的開關狀態。

---

## 📅 開發藍圖 (Roadmap)

-   [x] **Phase 1**: 基礎架構建立 (FastAPI, Vue 3 Extension 骨架)
-   [x] **Phase 2**: 事中階段前端視覺化原型 (Google Meet 介面注入, MHI 模擬顯示, 成本與追蹤開關)
-   [x] **Phase 4**: 事前與事後前端視覺化原型 (成本試算 UI, 會後自動化假任務卡片展示)
-   [ ] **下一步**: 前後端整合 (恢復前端 WebSocket 連線, 後端接收音訊進行 STT 與 MHI 演算)
-   [ ] **未來**: 真實 AI 引擎整合 (GPT-4o 決策萃取, TensorFlow.js 臉部/視線追蹤)

---

## 📝 備註 / 附錄 (未來整合用)

### 後端設定 (Backend)

*(註：目前的純前端模擬階段**不需要**啟動後端，以下為未來整合前後端時的參考說明。)*

首先，準備好 Python 3.9+ 環境。

```bash
# 進入後端目錄
cd backend

# 建立並啟動虛擬環境 (Mac/Linux)
python3 -m venv venv
source venv/bin/activate

# 安裝所需套件 (包含 FastAPI, Uvicorn, faster-whisper 等)
pip install fastapi "uvicorn[standard]" faster-whisper

# 啟動後端伺服器 (將在 port 8000 運行)
# 第一次啟動時會自動下載 Whisper Base 模型 (約 140MB)，請耐心等待
uvicorn main:app --reload --port 8000
```

---

> 此專案為國立中央大學 (NCU) 相關開發計畫之一。

