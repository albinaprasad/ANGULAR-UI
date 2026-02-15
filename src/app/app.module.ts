import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SharedModule } from "./shared/shared.module";
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, CommonModule, HttpClientModule, SharedModule],
  providers: [
    App,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
