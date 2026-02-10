import asyncio
import random
from datetime import datetime

class FakeMarket:
    def __init__(self, manager):
        self.manager = manager

        self.prices = {
            "BTC": 43000.0,
            "ETH": 2300.0,
            "SOL": 98.0,
        }
        
        # candle state per symbol
        self.candles = {}

    
    async def start(self):
        """ Starts fake market engine loop """
        print("\n !!!!!! Market engine started")

        while True:
            await asyncio.sleep(0.5)

            for symbol in self.prices:
                await self._update_prices(symbol)


    async def _update_prices(self, symbol):
        # random price movement
        change = random.uniform(-40, 40)
        self.prices[symbol] += change
        price = round(self.prices[symbol], 2)

        # send price update
        await self.manager.broadcast_price(symbol, price)

        # candle generation
        now = int(datetime.utcnow().timestamp())

        if symbol not in self.candles:
            self.candles[symbol] = {
                "time": now, 
                "open": price,
                "high": price,
                "low": price,
                "close": price
            }

        candle = self.candles[symbol]

        # new candle every 5s
        if now - candle["time"] >= 5:
            await self.manager.broadcast_candle(symbol, candle)

            self.candles[symbol] = {
                "time": now, 
                "open": price,
                "high": price,
                "low": price,
                "close": price
            }
        
        else:
            candle["high"] = max(candle["high"], price)
            candle["low"] = max(candle["low"], price)
            candle["close"] = price

            await self.manager.broadcast_candle(symbol, candle)


