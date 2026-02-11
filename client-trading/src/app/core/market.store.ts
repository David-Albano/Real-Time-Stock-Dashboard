import { Injectable, signal } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class MarketStore {

  prices = signal<Record<string, number>>({});

  constructor(private ws: WebsocketService) {
    this.ws.messages$.subscribe(payloadMsg => {

      if (payloadMsg.type === 'price_update') {
        this.prices.update(p => ({
          ...p,
          [payloadMsg.symbol]: payloadMsg.price
        }));
      }

    });
  }

  connect() {
    this.ws.connect();
  }

  subscribe(symbols: string[]) {
    this.ws.subscribe(symbols);
  }
  
}
