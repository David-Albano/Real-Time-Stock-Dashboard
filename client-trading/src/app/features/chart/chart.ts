import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { WebsocketService } from '../../core/websocket.service';

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `<div #chartContainer style="height:400px;"></div>`
})
export class Chart implements AfterViewInit {

  @ViewChild('chartContainer', { static: true }) container!: ElementRef;

  private chart: any;
  private candleSeries: any;

  constructor(private ws: WebsocketService) {}

  ngAfterViewInit() {

    this.chart = createChart(this.container.nativeElement, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#DDD'
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' }
      },
      width: 900,
      height: 400
    });

    // ✅ correct for v5.1
    this.candleSeries = this.chart.addSeries(CandlestickSeries);

    this.ws.messages$.subscribe(msg => {
      if (msg.type === 'candle_update' && msg.symbol === 'BTC') {

        this.candleSeries.update({
          time: msg.candle.time,
          open: msg.candle.open,
          high: msg.candle.high,
          low: msg.candle.low,
          close: msg.candle.close
        });

      }
    });
  }
}
