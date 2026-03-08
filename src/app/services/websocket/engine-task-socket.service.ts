import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { EngineSocketEvent } from '../../types/role-dashboard.types';
import { BaseWebSocketService } from './base.service';

export type EngineTaskSocketState = 'connecting' | 'open' | 'closed' | 'error';

@Injectable({ providedIn: 'root' })
export class EngineTaskSocketService extends BaseWebSocketService {
  private readonly stateSubject = new BehaviorSubject<EngineTaskSocketState>('closed');
  private readonly eventSubject = new Subject<EngineSocketEvent>();
  private readonly closeSubject = new Subject<CloseEvent>();
  private readonly errorSubject = new Subject<Event>();

  private currentTaskId: string | null = null;
  private currentUrl: string | null = null;

  connect(taskId: string, wsPath: string): boolean {
    const normalizedTaskId = String(taskId || '').trim();
    const normalizedPath = String(wsPath || '').trim();
    if (!normalizedTaskId || !normalizedPath) {
      this.stateSubject.next('error');
      return false;
    }

    const token = this.getAuthToken();
    if (!token) {
      this.stateSubject.next('error');
      return false;
    }

    const url = this.resolveSocketUrl(normalizedPath, token);
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      if (this.currentTaskId === normalizedTaskId && this.currentUrl === url) {
        return true;
      }
      this.disconnect();
    }

    this.currentTaskId = normalizedTaskId;
    this.currentUrl = url;
    this.stateSubject.next('connecting');
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.stateSubject.next('open');
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as EngineSocketEvent;
        if (parsed && parsed.task_id && parsed.event) {
          this.eventSubject.next(parsed);
        }
      } catch {
        // Ignore malformed websocket payloads.
      }
    };

    this.socket.onerror = (event) => {
      this.stateSubject.next('error');
      this.errorSubject.next(event);
    };

    this.socket.onclose = (event) => {
      this.stateSubject.next('closed');
      this.closeSubject.next(event);
      this.socket = undefined;
    };

    return true;
  }

  disconnect(): void {
    if (!this.socket) {
      this.stateSubject.next('closed');
      this.currentTaskId = null;
      this.currentUrl = null;
      return;
    }

    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onerror = null;
    this.socket.onclose = null;

    if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
      this.socket.close();
    }

    this.socket = undefined;
    this.currentTaskId = null;
    this.currentUrl = null;
    this.stateSubject.next('closed');
  }

  onStateChange(): Observable<EngineTaskSocketState> {
    return this.stateSubject.asObservable();
  }

  onEvent(): Observable<EngineSocketEvent> {
    return this.eventSubject.asObservable();
  }

  onClose(): Observable<CloseEvent> {
    return this.closeSubject.asObservable();
  }

  onError(): Observable<Event> {
    return this.errorSubject.asObservable();
  }

  private resolveSocketUrl(wsPath: string, token: string): string {
    if (/^wss?:\/\//i.test(wsPath)) {
      const absolute = new URL(wsPath);
      absolute.searchParams.set('token', token);
      return absolute.toString();
    }

    if (wsPath.startsWith('/')) {
      const baseOrigin = new URL(this.BASE_URL).origin;
      const absolute = new URL(`${baseOrigin}${wsPath}`);
      absolute.searchParams.set('token', token);
      return absolute.toString();
    }

    return this.buildSocketUrl(wsPath, token);
  }
}
