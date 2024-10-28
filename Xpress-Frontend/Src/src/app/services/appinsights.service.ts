// import { ApplicationInsights } from '@microsoft/applicationinsights-web';
// import { Injectable } from '@angular/core';
// import { AppConfigService } from './app-config.service';

// @Injectable()
// export class MonitoringService {
//   appInsights: ApplicationInsights;
//   constructor(private config: AppConfigService) {
//     this.appInsights = new ApplicationInsights({
//       config: {
//         instrumentationKey: config.getConfig().appInsights.instrumentationKey,
//         enableAutoRouteTracking: true,
//         enableCorsCorrelation: true,
//         enableRequestHeaderTracking: true,
//         enableResponseHeaderTracking: true,
//         autoTrackPageVisitTime: true,
//       },
//     });
//     this.appInsights.loadAppInsights();
//   }

//   logPageView(name?: string, url?: string) {
//     this.appInsights.trackPageView({ name, uri: url });
//   }

//   logEvent(name: string, properties?: Record<string, string>) {
//     this.appInsights.trackEvent({ name }, properties);
//   }

//   logError(err: Error, properties?: Record<string, string>) {
//     this.appInsights.trackException({ exception: err, properties });
//   }

//   logException(exception: Error, event?: string, severityLevel?: number) {
//     this.appInsights.trackException({ exception, severityLevel, properties: { event } });
//   }

//   logTrace(message: string, properties?: Record<string, string>) {
//     this.appInsights.trackTrace({ message }, properties);
//   }
// }
