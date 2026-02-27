<template>
  <div class="meetlogic-panel">
    <div class="panel-header">
      <h3>MeetLogic AI</h3>
      <span class="status-indicator" :class="{ 'is-active': isTracking }"></span>
    </div>
    
    <template v-if="isTracking">
      <div class="data-centric-display">
        <div class="mhi-label">Meeting Health Index (MHI)</div>
        <div class="mhi-score" :style="{ color: mhiColor, textShadow: `0 0 20px ${mhiColor}` }">
          {{ mhiScore }}<span class="mhi-percent">%</span>
        </div>
        <div class="mhi-trend">Live Syncing...</div>
      </div>
      
      <div class="controls">
        <button class="action-btn" @click="generateSummary">生成 AI 總結</button>
        <button class="toggle-btn" @click="toggleTracking">停止追蹤</button>
      </div>
    </template>
    <template v-else>
      <div class="data-centric-display stopped">
        <div class="mhi-score stopped-score">--</div>
        <p class="stopped-text">AI 分析已暫停</p>
      </div>
      <div class="controls">
        <button class="toggle-btn start" @click="toggleTracking">啟動 MHI 追蹤</button>
      </div>
    </template>

    <!-- 模擬 AI 總結 Modal 使用 Teleport 傳送到 body -->
    <Teleport to="body">
      <div v-if="showSummaryModal" class="summary-modal-overlay">
        <div class="summary-modal-content">
          <div class="modal-header">
            <h4>🧠 MeetLogic 深度會議洞察報告</h4>
            <span class="meeting-meta">時長: 45m | 平均 MHI: 82% | 預估耗資: $375</span>
          </div>
          
          <div class="modal-body">
            <div class="summary-section">
              <h5>📍 執行摘要 (Executive Summary)</h5>
              <p>本次會議主要聚焦於 Q3 產品核心迭代方向。團隊一致同意將解決「使用者體驗(UX)技術債」提升至最高優先級，並暫緩原定的小型新功能開發。主要考量點為近期客訴分析顯示，流失率與結帳流程卡頓有高度正相關。</p>
            </div>

            <div class="summary-section">
              <h5>🎯 關鍵決策 (Key Decisions)</h5>
              <ul class="decision-list">
                <li><span class="tag">決策 1</span> <strong>全面翻新結帳流程：</strong> 將目前的 5 步結帳縮減至 3 步，並支援第三方快速登入。</li>
                <li><span class="tag">決策 2</span> <strong>資源重新分配：</strong> 原訂的「社群分享功能」開發延後至 Q4，釋出 2 名前端工程師投入 UX 優化。</li>
                <li><span class="tag">決策 3</span> <strong>效能指標：</strong> 設定新結帳流程的頁面載入時間(LCP)目標為低於 1.5 秒。</li>
              </ul>
            </div>

            <div class="summary-section">
              <h5>✅ 行動承諾 (Action Items)</h5>
              <table class="action-table">
                <thead>
                  <tr>
                    <th>負責人</th>
                    <th>任務內容</th>
                    <th>期限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>@Sarah (PM)</td>
                    <td>產出精簡版結帳流程的 PRD 與需求規格書</td>
                    <td>本週三 18:00</td>
                  </tr>
                  <tr>
                    <td>@David (Design)</td>
                    <td>提供 3 步結帳流程的 Wireframe 與 Mockup</td>
                    <td>本週五 12:00</td>
                  </tr>
                  <tr>
                    <td>@Tech-Lead</td>
                    <td>評估第三方登入 API 整合的技術可行性與工時</td>
                    <td>下週一 10:00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="summary-section dual-column">
              <div class="column">
                <h5>🎫 自動建立 Jira 任務預覽</h5>
                <div class="code-block">
[EPIC] Q3 結帳流程 UX 重構
  ├── [STORY] 縮減結帳步驟至 3 步
  │     └── Assignee: 未定 | Sprint: 24
  ├── [STORY] 整合 Google/Apple 快速登入
  │     └── Assignee: Tech-Lead | Sprint: 24
  └── [TASK] 撰寫新結帳流程 PRD
        └── Assignee: Sarah | Status: TO DO
                </div>
              </div>
              <div class="column">
                <h5>✉️ 後續追蹤 Email 草稿</h5>
                <div class="code-block email-draft">
主旨: [Action Required] Q3 產品迭代會議結論與下一步
收件人: product-team@meetlogic.ai

各位好，
感謝參與今天的會議。我們已確認 Q3 將全力解決 UX 技術債，暫緩社群功能開發。

關鍵下一步：
1. Sarah: 週三前完成 PRD。
2. David: 週五前完成 Mockup。

詳細會議記錄與錄音已同步至 Notion。
Best, MeetLogic AI
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button class="action-btn secondary" @click="closeSummaryModal">稍後再看</button>
            <button class="action-btn primary" @click="closeSummaryModal">✨ 一鍵發送 Email & 建立 Jira</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const mhiScore = ref(85);
const isTracking = ref(true);
const showSummaryModal = ref(false);

let mhiInterval;
const MHI_UPDATE_INTERVAL = 2500; // Update MHI every 2.5 seconds for a dynamic feel

const updateMhiScore = () => {
  if (!isTracking.value) return;
  // Simulate natural fluctuation: previous score +/- a small random amount
  const fluctuation = Math.floor(Math.random() * 11) - 5; // -5 to +5
  let newScore = mhiScore.value + fluctuation;
  
  // Keep it within realistic bounds
  if (newScore > 98) newScore = 98;
  if (newScore < 45) newScore = 45; // Rarely goes below 45 in normal operation
  
  mhiScore.value = newScore;
};

const toggleTracking = () => {
  isTracking.value = !isTracking.value;
  if (isTracking.value) {
    startUpdates();
  } else {
    stopUpdates();
  }
};

const generateSummary = () => {
  showSummaryModal.value = true;
};

const closeSummaryModal = () => {
  showSummaryModal.value = false;
};

const startUpdates = () => {
  mhiInterval = setInterval(updateMhiScore, MHI_UPDATE_INTERVAL);
  updateMhiScore();
};

const stopUpdates = () => {
  clearInterval(mhiInterval);
};

onMounted(() => {
  startUpdates();
});

onUnmounted(() => {
  stopUpdates();
});

const mhiColor = computed(() => {
  if (mhiScore.value >= 80) return '#00e676'; // Neon Green for excellent
  if (mhiScore.value >= 60) return '#ffea00'; // Neon Yellow for okay
  return '#ff1744'; // Neon Red for danger
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Roboto:wght@300;400;700&display=swap');

.meetlogic-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 280px;
  /* Glassmorphism effect */
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  font-family: 'Roboto', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.meetlogic-panel h3 {
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  margin: 0;
  font-size: 1.1em;
  letter-spacing: 1px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #555;
}

.status-indicator.is-active {
  background-color: #00e676;
  box-shadow: 0 0 8px #00e676;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.data-centric-display {
  text-align: center;
  padding: 10px 0;
}

.mhi-label {
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #aaa;
  margin-bottom: 5px;
}

.mhi-score {
  font-family: 'Orbitron', sans-serif;
  font-size: 4.5em;
  font-weight: 700;
  line-height: 1;
  margin: 10px 0;
  transition: color 0.5s ease, text-shadow 0.5s ease;
}

.mhi-percent {
  font-size: 0.3em;
  vertical-align: top;
  opacity: 0.8;
}

.mhi-trend {
  font-size: 0.7em;
  color: #00e676;
  opacity: 0.7;
}

.data-centric-display.stopped .stopped-score {
  color: #555 !important;
  text-shadow: none !important;
}

.data-centric-display.stopped .stopped-text {
  color: #888;
  font-size: 0.9em;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  font-family: 'Roboto', sans-serif;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: bold;
  transition: all 0.2s ease;
}

.action-btn {
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.toggle-btn {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ccc;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.toggle-btn.start {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.toggle-btn.start:hover {
  background: rgba(16, 185, 129, 0.3);
  color: #34d399;
}

/* Modal Styling */
.summary-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.summary-modal-content {
  background: #1e293b;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 0; /* Changed from 30px to 0 for full control */
  border-radius: 16px;
  width: 90%;
  max-width: 800px; /* Widened for more content */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 85vh; /* Keep it within viewport */
  overflow: hidden; /* Hide scrollbar on main container */
}

.modal-header {
  padding: 20px 30px;
  border-bottom: 1px solid #334155;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h4 {
  color: #38bdf8;
  margin: 0;
  font-size: 1.4em;
  font-family: 'Orbitron', sans-serif;
}

.meeting-meta {
  font-size: 0.85em;
  color: #94a3b8;
  background: #0f172a;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #334155;
}

.modal-body {
  padding: 30px;
  overflow-y: auto; /* Enable scrolling only in body */
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.summary-section h5 {
  color: #e2e8f0;
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 1.1em;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #334155;
  padding-bottom: 8px;
}

.summary-section p {
  margin: 0;
  line-height: 1.6;
  color: #cbd5e1;
  font-size: 0.95em;
}

/* Decision List */
.decision-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.decision-list li {
  margin-bottom: 12px;
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #38bdf8;
}

.tag {
  background: #0369a1;
  color: white;
  font-size: 0.7em;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 8px;
  text-transform: uppercase;
  font-weight: bold;
}

/* Action Table */
.action-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.action-table th, .action-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #334155;
}

.action-table th {
  color: #94a3b8;
  font-weight: normal;
  text-transform: uppercase;
  font-size: 0.85em;
}

.action-table td {
  color: #f1f5f9;
}

.action-table tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

/* Dual Column */
.dual-column {
  display: flex;
  gap: 20px;
}

.column {
  flex: 1;
}

/* Code Blocks */
.code-block {
  background: #0f172a;
  border: 1px solid #1e293b;
  padding: 15px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85em;
  color: #a7f3d0;
  white-space: pre-wrap;
  line-height: 1.5;
}

.email-draft {
  color: #e2e8f0;
}

/* Actions */
.modal-actions {
  padding: 20px 30px;
  border-top: 1px solid #334155;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.action-btn.secondary {
  background: transparent;
  border: 1px solid #64748b;
  color: #cbd5e1;
  box-shadow: none;
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #94a3b8;
  color: white;
}

.action-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
</style>
