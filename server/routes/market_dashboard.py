from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.market.ws_manager import WebSocketManager
from services.market.market import FakeMarket
from services.chat.chat_manager import ChatConnectionManager
import json, time, asyncio

router = APIRouter()


manager = WebSocketManager()
market = FakeMarket(manager)
chat_manager = ChatConnectionManager()


@router.on_event("startup")
async def startup_event():
    """ Start fake market in background when server starts """
    
    asyncio.create_task(market.start())


@router.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    client_id = await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            msg_type = msg.get("type")

            symbols = msg.get("symbols", [])

            if msg_type == "subscribe":
                await manager.subscribe(client_id, symbols)

            elif msg_type == 'unsubscribed':
                await manager.unsubscribe(client_id, symbols)

    except WebSocketDisconnect:
        manager.disconnect(client_id)


# ==============


@router.websocket('/ws/chat')
async def chat_socket(websocket: WebSocket):
    await chat_manager.connect(websocket)

    await chat_manager.broadcast_messages({
        "type": "system",
        "message": "A user joined chat."
    })

    username = "Anonym"

    try:
        
        while True:
            data = await websocket.receive_json()

            if data["type"] == "chat":
                username = data.get("username", "Anonym")

                payload = {
                    "type": "chat",
                    "username": username,
                    "message": data.get("message"),
                    "timestamp": time.time()
                }

                await chat_manager.broadcast_messages(payload)

    except WebSocketDisconnect:
        chat_manager.disconnect(websocket)

        await chat_manager.broadcast_messages(
            {"type": "system", "message": f"{username} left chat."}
        )
    