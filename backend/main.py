import tempfile
import os
import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from database import database, connect_to_db, disconnect_from_db
from faster_whisper import WhisperModel

# 載入 Local Whisper 模型 (提升為 base 模型以增加準確度，預設使用 CPU)
print("Loading Whisper model (base)...")
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
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
    # 使用 faster-whisper 進行語音辨識，強制指定中文並加入繁體中文的初始提示以提高準確度
    segments, info = whisper_model.transcribe(
        file_path, 
        beam_size=5, 
        language="zh", 
        initial_prompt="以下是一段繁體中文的會議記錄："
    )
    text = " ".join([segment.text for segment in segments])
    return text.strip()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    # 狀態變數用於計算 MHI
    current_focus_score = 50
    has_recent_speech = False

    try:
        while True:
            data = await websocket.receive()
            if "text" in data:
                text = data["text"]
                if text == 'STOP_AUDIO_STREAM':
                    print("Audio stream stopped by frontend.")
                else:
                    try:
                        # 嘗試解析來自前端的 JSON 訊息
                        json_data = json.loads(text)
                        if json_data.get('type') == 'focus_score':
                            current_focus_score = json_data.get('value', 50)
                            
                            # --- MHI (Meeting Health Index) 核心演算法 (MVP 版) ---
                            # MVP 邏輯：MHI 主要是專注力，如果最近有語音活動 (有人講話)，分數加成 10%
                            speech_bonus = 10 if has_recent_speech else 0
                            mhi_score = min(100, current_focus_score + speech_bonus)
                            
                            # 每一幀 (大約2秒) 都回傳最新的 MHI 給前端更新儀表板
                            await websocket.send_text(json.dumps({
                                "type": "mhi_update",
                                "score": mhi_score
                            }))
                    except json.JSONDecodeError:
                         # 處理純文字測試訊息
                         print(f"Received text: {text}")
                         
            elif "bytes" in data:
                # 前端現在每 5 秒會傳送一個完整的 WebM 檔案 (Blob) 過來
                byte_data = data["bytes"]
                
                # 如果音訊資料太小，跳過不處理
                if len(byte_data) < 5000:
                    has_recent_speech = False
                    continue
                    
                has_recent_speech = True # 標記最近有有效音訊輸入
                print(f"Processing complete audio file of {len(byte_data)} bytes...")
                
                # 將完整的二進位音訊寫入暫存檔
                with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
                    temp_audio.write(byte_data)
                    temp_audio_path = temp_audio.name
                
                try:
                    # 將高耗時的 AI 運算放到背景執行緒
                    text = await asyncio.to_thread(transcribe_audio, temp_audio_path)
                    if text:
                        print(f"Transcribed: {text}")
                        # 將轉文字結果打包成 JSON 傳回前端
                        await websocket.send_text(json.dumps({
                            "type": "transcription",
                            "text": text
                        }))
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
             await websocket.close()
        except RuntimeError:
             pass

# You can run this file with: uvicorn main:app --reload
