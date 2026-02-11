import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../../core/websocket.service';

@Component({
  selector: 'app-orderbook',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orderbook.html',
  styleUrl: './orderbook.css',
})
export class Orderbook {

  bids = signal<any[]>([]);
  asks = signal<any[]>([]);

  constructor(private ws: WebsocketService) {

    this.ws.messages$.subscribe(payloadMsg => {
      
      if (payloadMsg.type === "orderbook_update" && payloadMsg.symbol === "BTC") {
        this.bids.set(payloadMsg.bids);
        this.asks.set(payloadMsg.asks)
      };
    });

    effect(() => {
      console.log("Orderbook update")
    })

  }

}
