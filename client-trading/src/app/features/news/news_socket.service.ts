import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NewsSocketService{
    ws!:WebSocket;
    steps$ = new Subject<string>();

    connect(clientId: string) {
        this.ws = new WebSocket(`http://localhost:8000/news/ws/${clientId}`);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "process_step") {
                this.steps$.next(data.message);
            }
        }
    }

}

