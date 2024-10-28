import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
} from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  IPublicClientApplication,
  InteractionType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { AppConfigService } from './services/app-config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';

export function initializerFactory(env: AppConfigService): unknown {
  const promise = env.loadConfiguration();
  return () => promise;
}

export function mSALInstanceFactory(config: AppConfigService): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: config.getConfig().oAuthSettings.clientId,
      authority: config.getConfig().oAuthSettings.authority,
      knownAuthorities: ['login.microsoftonline.com'],
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage,
      storeAuthStateInCookie: false,
    },
    system: {
      iframeHashTimeout: 10000,
    },
  });
}

export function mSALInterceptorConfigFactory(config: AppConfigService): MsalInterceptorConfiguration {
  //const protectedResourceMap = new Map<string, Array<string>>();
  //protectedResourceMap.set(window.location.origin, config.getConfig().OAuthSettings.scopeUri);
  const protectedResourceMap = new Map<string, string[]>();
  protectedResourceMap.set(config.getConfig().apiUrls.apiBaseUrl, config.getConfig().oAuthSettings.scopeUri);
  protectedResourceMap.set(config.getConfig().graphApi.graphBaseUrl, ['user.read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function mSALGuardConfigFactory(config: AppConfigService): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: config.getConfig().oAuthSettings.scopeUri },
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    AppConfigService,
    DatePipe,

    {
      provide: APP_INITIALIZER,
      useFactory: initializerFactory,
      deps: [AppConfigService],
      multi: true,
    },

  
  ],
};
