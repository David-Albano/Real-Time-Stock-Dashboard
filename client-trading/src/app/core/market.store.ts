import { Injectable, signal } from '@angular/core';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root'
})
export class MarketStore {

  prices = signal<Record<string, number>>({});

  constructor(private ws: WebsocketService) {
    this.ws.messages$.subscribe(msg => {

      if (msg.type === 'price_update') {
        this.prices.update(p => ({
          ...p,
          [msg.symbol]: msg.price
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
