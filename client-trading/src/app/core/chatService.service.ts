import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private chatWs!: WebSocket;
    chatMessages$ = new Subject<any>();

    connect() {
        this.chatWs = new WebSocket("http://localhost:8000/market/ws/chat");

        this.chatWs.onmessage = (event) => {
            const data = JSON.parse(event.data);

            this.chatMessages$.next(data);
        }
    }

    send(msgFromChat: any) {
        this.chatWs.send(JSON.stringify(msgFromChat));
    }


}