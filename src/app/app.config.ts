<<<<<<< HEAD
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations()
  ]
};
=======
// This file is no longer needed for module-based architecture
// Global configuration can be added to AppModule providers if needed

>>>>>>> 2e1f24cf221d75ebdb9cd5b07a61f8e03eaabcde
