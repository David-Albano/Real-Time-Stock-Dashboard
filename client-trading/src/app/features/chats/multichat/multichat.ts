import { Component } from '@angular/core';
import { ChatService } from '../../../core/chatService.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multichat',
  imports: [CommonModule, FormsModule],
  templateUrl: './multichat.html',
  styleUrl: './multichat.css',
})
export class Multichat {

    text = ''
    username = 'trader_' + Math.floor(Math.random()*1000);
    payloadMessages:any[] = [];

    constructor(private chatServiceAux: ChatService) {
      this.chatServiceAux.connect();

      this.chatServiceAux.chatMessages$.subscribe(payloadMessage => {
        let updatedMessageObject = {...payloadMessage}
        updatedMessageObject["isOwnMessage"] = payloadMessage.username === this.username ?  "-is-own-message" : "";

        this.payloadMessages.push(updatedMessageObject)
      });
    };


    send() {
      this.chatServiceAux.send(
        {
          type: "chat", 
          username: this.username,
          message: this.text
        }
      )

      this.text = "";
    }

}
