import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketStore } from '../../core/market.store';
import { Chart } from '../chart/chart';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Chart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
    prices;

    constructor(private market: MarketStore) {
      this.prices = this.market.prices;
      this.market.connect();

      // subscribe to symbols
      setTimeout(() => {
        this.market.subscribe(['BTC','ETH','SOL']);
      }, 500);

      effect(() => {
        console.log("Prices updated:", this.prices());
      })

    }

}
