export interface AppConfig {
  apiUrls: ApiUrls;
  scopes: string[];
  graphApi: GraphApi;
  ocpApimSubscriptionKey: string;
  oAuthSettings: OauthSettings;
  appInsights: AppInsights;
  settings: Settings;
}

export interface ApiUrls {
  apiBaseUrl: string;
  apiVersion: ApiVersion;
}

export interface ApiVersion {
  v1: string;
}

export interface OauthSettings {
  authority: string;
  scopeUri: string[];
  clientId: string;
}

export interface AppInsights {
  instrumentationKey: string;
}

export interface Settings {
  footerLinkLimit: number;
  mainCarouselAutoRotation: boolean;
  mainCarouselSpeedInSec: number;
  subCarouselSpeedInMs: number;
  subCarouselTransitionSpeedInMs: number;
  subCarouselAutoRotation: boolean;
  isActionCentre: boolean;
}

export interface GraphApi {
  graphBaseUrl: string;
  profileUrl: string;
}
