from fastapi import WebSocket
from typing import Set, Dict
import uuid

class WebSocketManager:
    def __init__(self):
        # client_id -> websocket
        self.connected_clients: Dict[str, WebSocket] = {}

        # client_id -> subscribed symbols
        self.client_subscriptions: Dict[str, Set[str]] = {}

        # symbol -> set(client_id)
        self.symbols_subscribers: Dict[str, Set[str]] = {}

    # -------------------------
    # CONNECTION MANAGEMENT
    # -------------------------
    
    async def connect(self, websocket: WebSocket) -> str:
        await websocket.accept()

        client_id = str(uuid.uuid4())[:8]

        self.connected_clients[client_id] = websocket
        self.client_subscriptions[client_id] = set()

        await websocket.send_json({
            "type": "welcome",
            "client_id": client_id
        })

        return client_id

    async def disconnect(self, client_id: str):

        # remove from symbol subscriber
        if client_id in self.client_subscriptions:
            for symbol in self.client_subscriptions[client_id]:
                if symbol in self.symbols_subscribers:
                    self.symbols_subscribers[symbol].discard(client_id)

            
        # remove client
        self.client_subscriptions.pop(client_id, None)
        self.connected_clients.pop(client_id, None)

    # -------------------------
    # SUBSCRIPTIONS
    # -------------------------

    async def subscribe(self, client_id: str, symbols):
        for symbol in symbols:
            symbol = symbol.upper()

            # client side
            self.client_subscriptions[client_id].add(symbol)

            # symbol side
            if symbol not in self.symbols_subscribers:
                self.symbols_subscribers[symbol] = set()

            self.symbols_subscribers[symbol].add(client_id)

        ws = self.connected_clients[client_id]

        await ws.send_json({
            "type": "subscribed",
            "symbols": list(self.client_subscriptions[client_id])
        })


    
    async def unsubscribe(self, client_id: str, symbols):
        for symbol in symbols:
            symbol = symbol.upper()

            self.client_subscriptions[client_id].discard(symbol)

            if symbol in self.symbols_subscribers:
                self.symbols_subscribers[symbol].discard(client_id)

        ws = self.connected_clients[client_id]

        await ws.send_json({
            "type": "unsubscribed",
            "symbols": list(self.client_subscriptions[client_id])
        })



    # -------------------------
    # BROADCASTS
    # -------------------------


    async def broadcast_price(self, symbol: str, price: float):
        if symbol not in self.symbols_subscribers:
            return
        
        payload = {
            "type": "price_update",
            "symbol": symbol,
            "price": price
        }

        dead_clients = []

        for client_id in self.symbols_subscribers[symbol]:
            ws = self.connected_clients.get(client_id)

            if not ws:
                continue

            try:
                await ws.send_json(payload)

            except:
                dead_clients.append(client_id)

            
        # cleanup dead sockets
        for dc in dead_clients:
            self.disconnect(dc)


    async def broadcast_candle(self, symbol: str, candle: dict):
        if symbol not in self.symbols_subscribers:
            return
        
        payload = {
            "type": "candle_update",
            "symbol": symbol,
            "candle": candle
        }

        dead_clients = []

        for client_id in self.symbols_subscribers[symbol]:
            ws = self.connected_clients.get(client_id)

            if not ws: continue

            try:
                await ws.send_json(payload)

            except:
                dead_clients.append(client_id)

        for dc in dead_clients:
            self.disconnect(dc)


    async def broadcast_orderbook(self, symbol: str, payload: dict):
        if symbol not in self.symbols_subscribers: return

        dead_clients = []

        for client_id in self.symbols_subscribers[symbol]:
            ws = self.connected_clients.get(client_id)

            if not ws: continue


            try:
                await ws.send_json(payload)
            
            except:
                dead_clients.append(client_id)

        
        for dc in dead_clients:
            self.disconnect(dc)