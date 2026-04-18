import { Component, Input } from '@angular/core';

import { ChartCardData, ChartPoint } from '../../models/dashboard.models';

interface RenderPoint {
  label: string;
  value: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-chart-card',
  templateUrl: './chart-card.component.html',
  styleUrl: './chart-card.component.css'
})
export class ChartCardComponent {
  @Input({ required: true }) chart!: ChartCardData;

  readonly chartHeight = 180;
  readonly chartWidth = 460;
  readonly padding = 24;

  get renderPoints(): RenderPoint[] {
    const maxValue = Math.max(...this.chart.points.map(point => point.value), 1);
    const usableWidth = this.chartWidth - this.padding * 2;
    const usableHeight = this.chartHeight - this.padding * 2;
    const denominator = Math.max(this.chart.points.length - 1, 1);

    return this.chart.points.map((point: ChartPoint, index: number) => ({
      ...point,
      x: this.padding + (usableWidth / denominator) * index,
      y: this.chartHeight - this.padding - (point.value / maxValue) * usableHeight
    }));
  }

  get gridLines(): number[] {
    return [0, 1, 2, 3].map(index => this.padding + ((this.chartHeight - this.padding * 2) / 3) * index);
  }

  get linePath(): string {
    return this.renderPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
  }

  get areaPath(): string {
    const points = this.renderPoints;
    if (!points.length) {
      return '';
    }

    return `${this.linePath} L ${points[points.length - 1].x} ${this.chartHeight - this.padding} L ${points[0].x} ${this.chartHeight - this.padding} Z`;
  }

  barWidth(): number {
    return Math.max((this.chartWidth - this.padding * 2) / Math.max(this.chart.points.length * 1.7, 1), 16);
  }
}
