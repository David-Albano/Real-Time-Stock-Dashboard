import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private ws?: WebSocket;
  private url = 'ws://localhost:8000/ws';

  // stream for all incoming messages
  private messageSubject = new Subject<any>();
  public messages$ = this.messageSubject.asObservable();

  // connection state
  connected = signal(false);
  clientId = signal<string | null>(null);

  connect() {
    if (this.ws) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log("WS connected");
      this.connected.set(true);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // welcome message
      if (data.type === "welcome") {
        this.clientId.set(data.client_id);
      }

      this.messageSubject.next(data);
    };

    this.ws.onclose = () => {
      console.log("WS closed");
      this.connected.set(false);
      this.ws = undefined;

      // auto reconnect
      setTimeout(() => this.connect(), 2000);
    };
  }

  send(data: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(data));
  }

  subscribe(symbols: string[]) {
    this.send({
      type: "subscribe",
      symbols
    });
  }

  unsubscribe(symbols: string[]) {
    this.send({
      type: "unsubscribe",
      symbols
    });
  }
}
