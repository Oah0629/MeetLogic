from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from database import database, connect_to_db, disconnect_from_db
import tempfile
import os
import asyncio
from faster_whisper import WhisperModel

# 載入 Local Whisper 模型 (MVP 階段使用 tiny 模型以求快速，並預設使用 CPU)
print("Loading Whisper model (tiny)...")
whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
print("Whisper model loaded.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # await connect_to_db()
    yield
    # await disconnect_from_db()

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def read_root():
    return {"message": "Welcome to MeetLogic Backend!"}

def transcribe_audio(file_path: str):
    # 使用 faster-whisper 進行語音辨識
    segments, info = whisper_model.transcribe(file_path, beam_size=5)
    text = " ".join([segment.text for segment in segments])
    return text.strip()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    audio_buffer = bytearray()
    try:
        while True:
            data = await websocket.receive()
            if "text" in data:
                text = data["text"]
                if text == 'STOP_AUDIO_STREAM':
                    audio_buffer = bytearray()
                    print("Audio stream stopped by frontend.")
                else:
                    await websocket.send_text(f"Message text was: {text}")
                    print(f"Received text: {text}")
            elif "bytes" in data:
                # 前端現在每 5 秒會傳送一個完整的 WebM 檔案 (Blob) 過來
                byte_data = data["bytes"]
                
                # 如果音訊資料太小 (例如小於 5KB，可能只是短短的背景雜音或完全沒講話)，就跳過不處理，節省 CPU 算力
                if len(byte_data) < 5000:
                    continue
                    
                print(f"Processing complete audio file of {len(byte_data)} bytes...")
                
                # 將完整的二進位音訊寫入暫存檔
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                    temp_audio.write(byte_data)
                    temp_audio_path = temp_audio.name
                
                try:
                    # 將高耗時的 AI 運算放到背景執行緒，避免阻塞 WebSocket 接收
                    text = await asyncio.to_thread(transcribe_audio, temp_audio_path)
                    if text:
                        print(f"Transcribed: {text}")
                        await websocket.send_text(text)
                except Exception as e:
                    print(f"Transcription error: {e}")
                finally:
                    # 處理完畢後刪除暫存檔
                    if os.path.exists(temp_audio_path):
                        os.remove(temp_audio_path)

    except WebSocketDisconnect:
        print("Client disconnected gracefully.")
    except RuntimeError as e:
        if "Cannot call \"receive\"" not in str(e):
            print(f"WebSocket RuntimeError: {e}")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
             # Only close if it hasn't been closed already (e.g., by client disconnect)
             await websocket.close()
        except RuntimeError:
             pass

# You can run this file with: uvicorn main:app --reload
