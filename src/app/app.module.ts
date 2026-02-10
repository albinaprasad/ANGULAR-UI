import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { App } from './app';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from "./shared/shared.module";

@NgModule({
  declarations: [App],
  imports: [BrowserModule, AppRoutingModule, CommonModule, HttpClientModule, SharedModule],
  providers: [App],
  bootstrap: [App]
})
export class AppModule { }
