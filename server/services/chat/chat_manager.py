from fastapi import WebSocket
from typing import List


class ChatConnectionManager:
    def __init__(self):
        self.active_sockets: List[WebSocket] = []


    async def connect(self, websocket: WebSocket):
        await websocket.accept()

        self.active_sockets.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_sockets.remove(websocket)

    async def broadcast_messages(self, data: dict):
        for ws in self.active_sockets:
            await ws.send_json(data)
