import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NewsSocketService } from './news_socket.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News {

    state = "Waiting for fetching news"
    summary = ""
    clientId = crypto.randomUUID();

    constructor( private http: HttpClient, private ws: NewsSocketService, private cd: ChangeDetectorRef) {
        this.ws.connect(this.clientId);

        this.ws.steps$.subscribe(processStep => {
          this.state = processStep;
          this.cd.detectChanges();
        });
    }

    fetch(category: string) {
        this.state = 'Starting';
        this.cd.detectChanges();

        this.http.post<any>(
          `http://localhost:8000/news/fetch/${category.toLowerCase()}/${this.clientId}`,
          {},
          { withCredentials: true }
        ).subscribe(res => {
          this.summary = res.summary;
          this.state = "Summary Displayed";
          this.cd.detectChanges();
        })
    }

}
