import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

console.log('MeetLogic: Content script loaded successfully into Google Meet.');

let model = null;
let isTracking = false;
let videoElement = null;
let audioContext = null;
let mediaStreamSource = null;
let mediaRecorder = null;
let websocket = null;
let intervalId = null;

const WEBSOCKET_URL = 'ws://localhost:8000/ws'; // Backend WebSocket URL

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
  container.style.padding = '15px';
  container.style.border = '2px solid #ea4335';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  container.style.width = '250px';
  container.style.fontFamily = 'sans-serif';

  container.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #ea4335; font-size: 16px;">MeetLogic AI MVP</h3>
    <div style="margin-bottom: 10px;">
      <span style="font-weight: bold; font-size: 14px;">MHI Score: </span>
      <span id="mhi-score" style="font-size: 18px; font-weight: bold; color: #34a853;">--</span>
    </div>
    <div style="margin-bottom: 10px; font-size: 12px; color: #666;">
      Status: <span id="tf-status">Initializing AI...</span>
    </div>
    <button id="start-tracking-btn" style="width: 100%; padding: 8px; background-color: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; opacity: 0.5;" disabled>
      Start MHI Analysis
    </button>
    <div style="margin-top: 10px; font-size: 12px; color: #666;">
      WebSocket: <span id="ws-status">Connecting...</span>
    </div>
    <div style="margin-top: 5px; font-size: 12px; color: #666;">
      Transcription: <span id="ws-transcript">_</span>
    </div>
  `;
  
  document.body.appendChild(container);

  // Hidden video element for processing
  videoElement = document.createElement('video');
  videoElement.style.display = 'none';
  videoElement.autoplay = true;
  document.body.appendChild(videoElement);

  // Initialize WebSocket
  initWebSocket();

  // Load Model
  loadModel();

  // Attach button event
  document.getElementById('start-tracking-btn').addEventListener('click', toggleTracking);
};

const initWebSocket = () => {
  websocket = new WebSocket(WEBSOCKET_URL);
  const wsStatusEl = document.getElementById('ws-status');

  websocket.onopen = () => {
    console.log('MeetLogic: WebSocket connection opened.');
    if (wsStatusEl) wsStatusEl.innerText = 'Connected';
    // Send a test message
    websocket.send('MeetLogic Frontend Connected!');
  };

  websocket.onmessage = (event) => {
    console.log('MeetLogic: WebSocket message received:', event.data);
    const wsTranscriptEl = document.getElementById('ws-transcript');
    if (wsTranscriptEl) {
      wsTranscriptEl.innerText = event.data; // For now, just display whatever backend sends
    }
  };

  websocket.onclose = () => {
    console.log('MeetLogic: WebSocket connection closed.');
    if (wsStatusEl) wsStatusEl.innerText = 'Disconnected';
    // Attempt to reconnect after a delay
    setTimeout(initWebSocket, 5000);
  };

  websocket.onerror = (error) => {
    console.error('MeetLogic: WebSocket error:', error);
    if (wsStatusEl) wsStatusEl.innerText = 'Error';
  };
};


const loadModel = async () => {
  try {
    await tf.setBackend('webgl'); // try webgl
    await tf.ready();
    model = await blazeface.load();
    console.log('MeetLogic: BlazeFace model loaded.');
    
    const statusEl = document.getElementById('tf-status');
    const btnEl = document.getElementById('start-tracking-btn');
    if (statusEl && btnEl) {
      statusEl.innerText = 'AI Ready.';
      // Enable button only if WS is also connected
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        btnEl.disabled = false;
        btnEl.style.opacity = '1';
      }
    }
  } catch (err) {
    console.error('MeetLogic: Failed to load model:', err);
    const statusEl = document.getElementById('tf-status');
    if (statusEl) statusEl.innerText = 'AI Load Error';
  }
};

const toggleTracking = async () => {
  const btnEl = document.getElementById('start-tracking-btn');
  const statusEl = document.getElementById('tf-status');

  if (isTracking) {
    // Stop tracking
    isTracking = false;
    clearInterval(intervalId);
    if (videoElement.srcObject) {
      videoElement.srcObject.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    btnEl.innerText = 'Start MHI Analysis';
    btnEl.style.backgroundColor = '#1a73e8';
    statusEl.innerText = 'Analysis Stopped.';
    document.getElementById('mhi-score').innerText = '--';
    document.getElementById('meetlogic-container').style.borderColor = '#ea4335';
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send('STOP_AUDIO_STREAM'); // Signal backend to stop processing
    }
  } else {
    // Start tracking
    try {
      if (websocket && websocket.readyState !== WebSocket.OPEN) {
        alert('WebSocket is not connected. Please ensure backend is running.');
        return;
      }

      statusEl.innerText = 'Requesting screen...';
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: true // Request audio as well
      });
      videoElement.srcObject = stream;
      
      // Listen for user stopping sharing manually
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        if (isTracking) toggleTracking();
      });

      // --- Audio Processing ---
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        mediaStreamSource = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));

        // Check if browser supports MediaRecorder audio/webm
        const options = { mimeType: 'audio/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.warn(`${options.mimeType} is not supported, trying another.`);
          options.mimeType = 'audio/ogg';
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error('No supported audio mimeType found for MediaRecorder.');
            alert('Your browser does not support audio recording required for transcription.');
            throw new Error('No supported audio mimeType.');
          }
        }
        
        mediaRecorder = new MediaRecorder(mediaStreamSource.mediaStream, options);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(event.data); // Send audio chunk to backend
          }
        };
        mediaRecorder.start(1000); // Send audio chunks every 1 second
      } else {
        console.warn('No audio track found in getDisplayMedia stream.');
      }
      // --- End Audio Processing ---


      isTracking = true;
      btnEl.innerText = 'Stop Analysis';
      btnEl.style.backgroundColor = '#ea4335';
      statusEl.innerText = 'Analyzing focus & audio...';

      // Start video processing loop
      intervalId = setInterval(processFrame, 2000); // Check video every 2 seconds

    } catch (err) {
      console.error('MeetLogic: Failed to get display media:', err);
      statusEl.innerText = 'Permission denied or error.';
      if (mediaRecorder && mediaRecorder.state !== 'inactive') { // Clean up if any part of setup failed
        mediaRecorder.stop();
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
    }
  }
};

const processFrame = async () => {
  if (!model || !isTracking || !videoElement || videoElement.videoWidth === 0) return;

  try {
    const predictions = await model.estimateFaces(videoElement, false);
    
    // Fake logic for MVP: 
    // If faces are detected, assume higher focus. Randomize slightly to make it look alive.
    let baseScore = predictions.length > 0 ? 80 : 50;
    let focusScore = Math.floor(baseScore + (Math.random() * 20)); 
    
    // Ensure score is between 0 and 100
    focusScore = Math.min(100, Math.max(0, focusScore));

    const scoreEl = document.getElementById('mhi-score');
    const container = document.getElementById('meetlogic-container');

    if (scoreEl) {
      scoreEl.innerText = `${focusScore}%`;
      // Visual feedback (Forced Calm mechanism MVP)
      if (focusScore < 60) {
        scoreEl.style.color = '#ea4335'; // Red
        container.style.borderColor = '#ea4335';
        container.style.boxShadow = '0 0 15px rgba(234, 67, 53, 0.5)';
      } else if (focusScore < 80) {
        scoreEl.style.color = '#fbbc05'; // Yellow
        container.style.borderColor = '#fbbc05';
        container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      } else {
        scoreEl.style.color = '#34a853'; // Green
        container.style.borderColor = '#34a853';
        container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }
    }
  } catch (err) {
    console.error('MeetLogic: Face processing error:', err);
  }
};

setTimeout(initMeetLogicUI, 3000);
