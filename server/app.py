from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio, json

from ws_manager import WebSocketManager
from market import FakeMarket

app = FastAPI()

manager = WebSocketManager()
market = FakeMarket(manager)


# ===============**************===============
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request

templates = Jinja2Templates(
    directory="templates"
)

@app.get('/')
async def root(request: Request):
    return templates.TemplateResponse(
        request,
        'test.html',
        {}
    )
# ===============**************===============



@app.on_event("startup")
async def startup_event():
    """ Start fake market in background when server starts """
    
    asyncio.create_task(market.start())


@app.websocket('/ws')
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


