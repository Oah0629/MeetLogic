import { createApp } from 'vue';
import InMeetingPanel from './components/InMeetingPanel.vue';

console.log('MeetLogic: Content script loaded successfully into Google Meet.');

const initMeetLogicUI = () => {
  const containerId = 'meetlogic-meet-ui-container';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  createApp(InMeetingPanel).mount(container);
  console.log('MeetLogic: InMeetingPanel Vue app mounted.');
};

// Use setTimeout to ensure the Google Meet page is sufficiently loaded
// before attempting to inject the UI.
setTimeout(initMeetLogicUI, 3000);
