# MeetLogic AI MVP

![MeetLogic Banner](https://via.placeholder.com/1200x300.png?text=MeetLogic+AI+MVP+-+Meeting+Governance+%26+Analytics)

MeetLogic 旨在將會議管理從被動的「軟性勸導」升級為「演算法治理」。透過整合多模態 AI 技術，系統能即時監控會議品質、量化隱形成本，並主動介入以消弭企業的數位債務。

此專案目前處於 MVP (Minimum Viable Product) 階段，主要針對 **Google Meet** 平台進行概念驗證。

---

## 🎯 核心功能 (MVP 範圍)

1. **多模態 MHI (會議健康指數) 監控儀表板**
   * **前端臉部專注力追蹤**：透過 TensorFlow.js 在瀏覽器端 (Edge AI) 即時分析與會者的微表情與專注度，確保隱私不出本地。
   * **即時 MHI 演算**：結合專注力分數與語音活躍度，動態計算並展示當前會議的健康狀態。
   * **強制冷靜機制 (模擬)**：當 MHI 過低時，UI 會觸發視覺警告，模擬未來「主動暫停會議」的演算法治理概念。

2. **零點擊自動化代理 (開發中)**
   * **在地端語音轉文字 (STT)**：整合 `faster-whisper`，在本地端即時將會議音訊轉換為逐字稿，兼顧速度與最高級別的隱私。
   * **LLM 決策與任務萃取**：(即將整合 Gemini API) 會議結束後，自動由 AI 梳理決策節點與行動承諾 (Action Items)。

---

## 🛠 技術堆疊

* **前端 (Client / Browser Extension)**
  * [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
  * [TensorFlow.js](https://www.tensorflow.org/js) (BlazeFace 模型)
  * Chrome Extension Manifest V3
* **後端 (Server)**
  * [Python](https://www.python.org/) + [FastAPI](https://fastapi.tiangolo.com/)
  * [faster-whisper](https://github.com/guillaumekln/faster-whisper) (在地端語音辨識)
  * WebSockets (前後端即時音訊與數據串流)
* **資料庫 (預留)**
  * PostgreSQL

---

## 🚀 如何在本地端運行 (開發者指南)

### 1. 後端設定 (Backend)

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

*(備註：目前 MVP 階段已暫時關閉 PostgreSQL 資料庫連線要求，以專注於 AI 串流功能測試)*

### 2. 前端設定與打包 (Frontend)

確保您已安裝 Node.js (建議 v18+)。

```bash
# 開啟一個新的終端機視窗，進入前端目錄
cd frontend

# 安裝依賴
npm install

# 打包 Chrome 擴充功能
npm run build
```

打包完成後，編譯好的擴充功能檔案會放在 `frontend/dist` 目錄下。

### 3. 將擴充功能加載至 Chrome 瀏覽器

1. 開啟 Chrome 瀏覽器，網址列輸入並前往 `chrome://extensions`。
2. 開啟右上角的 **「開發人員模式」 (Developer mode)**。
3. 點擊左上角的 **「載入未封裝項目」 (Load unpacked)**。
4. 選擇本專案中的 `frontend/dist` 資料夾。
5. 確認「MeetLogic AI MVP」已成功出現在擴充功能清單中並處於啟用狀態。

### 4. 開始測試

1. 開啟一個 [Google Meet](https://meet.google.com/) 測試會議。
2. 網頁右上方會出現 MeetLogic 的懸浮面板，顯示 `Status: AI Ready` 與 `WebSocket: Connected`。
3. 點擊 **「Start MHI Analysis」** 按鈕。
4. 在彈出的分享視窗中，選擇您正在使用的 Google Meet 分頁，並 **務必勾選「分享分頁音訊 (Share tab audio)」**。
5. 觀察面板上的 MHI 分數跳動，並對著麥克風講話（約 5-10 秒）。
6. 您會看到辨識出的文字即時顯示在面板底部的 `Transcription` 區塊中！

---

## 📅 開發藍圖 (Roadmap)

- [x] **Phase 1**: 基礎架構建立 (FastAPI, Vue 3 Extension 骨架)
- [x] **Phase 2**: 事中階段核心 (TF.js 臉部追蹤, WebSocket 音訊串流, Whisper 在地 STT)
- [ ] **Phase 3**: AI 分析與 MHI (即時 MHI 演算整合, Gemini LLM 任務萃取) 👈 *我們在這裡*
- [ ] **Phase 4**: 事前與事後 MVP 功能 (成本試算 UI, 會後自動化假任務卡片展示)

---

> 此專案為國立中央大學 (NCU) 相關開發計畫之一。
