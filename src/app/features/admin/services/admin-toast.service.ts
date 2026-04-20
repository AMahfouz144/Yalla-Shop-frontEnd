import { Injectable } from '@angular/core';

export type AdminToastType = 'success' | 'error';

export interface AdminToastMessage {
  id: number;
  type: AdminToastType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminToastService {
  private nextId = 1;
  private readonly durationMs = 3200;
  readonly messages: AdminToastMessage[] = [];

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  remove(id: number): void {
    const index = this.messages.findIndex((message) => message.id === id);
    if (index >= 0) {
      this.messages.splice(index, 1);
    }
  }

  private push(type: AdminToastType, text: string): void {
    const message: AdminToastMessage = {
      id: this.nextId++,
      type,
      text
    };

    this.messages.push(message);
    window.setTimeout(() => this.remove(message.id), this.durationMs);
  }
}
