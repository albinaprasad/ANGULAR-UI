import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { WebSocketConnectionState, WebSocketService } from './services/websocket/websocket.service';
import { Subscription } from 'rxjs';
import { AuthService } from './services/http/auth.service';
import environmentJson from '../../configs/environment.json';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit,OnDestroy{
  protected readonly title = signal('my-angular-app');
  private subs: Subscription[] = [];
  websocketState: WebSocketConnectionState = 'closed';
  receivedMessages: string[] = [];
  demoMessage = 'hello';
  private previousToken: string | null = null;

  constructor(
    private websocketService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.previousToken = this.getToken();

    if (this.authService.isAuthenticated()) {
      this.websocketService.connect('notifications');
    }

    this.subs.push(
      this.authService.tokenChanges.subscribe((token) => {
        if (!token || !this.authService.isAuthenticated()) {
          this.previousToken = null;
          this.websocketService.disconnect();
          return;
        }

        if (this.previousToken && this.previousToken !== token) {
          this.websocketService.disconnect();
        }

        this.previousToken = token;
        this.websocketService.connect('notifications');
      }),
      this.websocketService.onStateChange().subscribe((state) => {
        this.websocketState = state;
      }),
      this.websocketService.onMessage$().subscribe((msg) => {
        this.receivedMessages = [
          JSON.stringify(msg),
          ...this.receivedMessages
        ].slice(0, 30);
      })
    )
  }

  connectWebsocket(): void {
    this.websocketService.connect('notifications');
  }

  disconnectWebsocket(): void {
    this.websocketService.disconnect();
  }

  sendHello(): void {
    this.websocketService.send({ message: this.demoMessage || 'hello' });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.websocketService.disconnect();
  }

  private getToken(): string | null {
    return localStorage.getItem(environmentJson.AUTH_TOKEN_KEY);
  }
}
