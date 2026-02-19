from fastapi import WebSocket
from typing import Dict


class NewsWSManager:
    def __init__(self):
        self.clients: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, ws: WebSocket):
        await ws.accept()
        self.clients[client_id] = ws

    def disconnect(self, client_id: str):
        if client_id in self.clients:
            del self.clients[client_id]

    async def send_step(self, client_id: str, message: str):
        ws = self.clients.get(client_id)
        if ws:
            await ws.send_json({
                "type": "process_step",
                "message": message
            })


news_manager = NewsWSManager()
