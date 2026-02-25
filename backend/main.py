from fastapi import FastAPI, WebSocket
from contextlib import asynccontextmanager
from database import database, connect_to_db, disconnect_from_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # await connect_to_db()
    yield
    # await disconnect_from_db()

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def read_root():
    return {"message": "Welcome to MeetLogic Backend!"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive()
            if "text" in data:
                text = data["text"]
                await websocket.send_text(f"Message text was: {text}")
                print(f"Received text: {text}")
            elif "bytes" in data:
                # This is audio data from the frontend
                byte_data = data["bytes"]
                print(f"Received audio chunk of {len(byte_data)} bytes")
                # For now, just send an acknowledgement
                # await websocket.send_text(f"Received audio chunk of {len(byte_data)} bytes")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# You can run this file with: uvicorn main:app --reload
