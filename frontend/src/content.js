// src/content.js
// 這是注入到 Google Meet 頁面的入口腳本
console.log('MeetLogic: Content script loaded successfully into Google Meet.');

// 準備建立 UI 容器
const initMeetLogicUI = () => {
  const containerId = 'meetlogic-container';
  if (document.getElementById(containerId)) return;

  const container = document.createElement('div');
  container.id = containerId;
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '99999';
  container.style.backgroundColor = 'white';
  container.style.padding = '10px';
  container.style.border = '2px solid #ea4335';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  container.innerText = 'MeetLogic MVP Active';
  
  document.body.appendChild(container);
  console.log('MeetLogic: UI Container appended.');
};

// 由於 Google Meet 可能動態加載，稍微延遲執行
setTimeout(initMeetLogicUI, 3000);
