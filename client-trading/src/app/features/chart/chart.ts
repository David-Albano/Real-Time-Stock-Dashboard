import { Component, ElementRef, ViewChild, AfterViewInit, signal, effect } from '@angular/core';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import { WebsocketService } from '../../core/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chart',
  standalone: true,
  templateUrl: './chart.html',
  styleUrl: './chart.css'
})
export class Chart implements AfterViewInit {

  @ViewChild('chartContainer', { static: true }) container!: ElementRef;

  private chart: any;
  private candleSeries: any;
  private sub: Subscription | null = null;

  symbolsOptions = ['BTC','ETH','SOL']

  selectedSymbol = signal("BTC");

  switchSymbol(symbol: string) {
    this.selectedSymbol.set(symbol)
  }

  constructor(private ws: WebsocketService) {
    effect((onCleanup) => {
      const symbol = this.selectedSymbol();

      // Clean up old chart series & subscription
      if (this.sub) {
        this.sub.unsubscribe();
        this.sub = null;
      }
      if (this.chart) {
        this.chart.remove();
        this.chart = null;
      }

      // Create new chart
      this.chart = createChart(this.container.nativeElement, {
        layout: {
          background: { type: ColorType.Solid, color: '#0f172a' },
          textColor: '#DDD'
        },
        grid: {
          vertLines: { color: '#1f2937' },
          horzLines: { color: '#1f2937' }
        },
        width: 1000,
        height: 520,
      });

      this.candleSeries = this.chart.addSeries(CandlestickSeries);

      // Subscribe to WebSocket for this symbol
      this.sub = this.ws.messages$.subscribe(payloadMsg => {
        if (payloadMsg.type === 'candle_update' && payloadMsg.symbol === symbol) {
          this.candleSeries.update({
            time: payloadMsg.candle.time,
            open: payloadMsg.candle.open,
            high: payloadMsg.candle.high,
            low: payloadMsg.candle.low,
            close: payloadMsg.candle.close
          });
        }
      });

      // Cleanup on effect re-run
      onCleanup(() => {
        if (this.sub) this.sub.unsubscribe();
      });
    });
  }

  ngAfterViewInit() {
    // Initial chart created via effect automatically
  }
}
