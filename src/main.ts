import { Aurelia } from "aurelia-framework";
import { HttpClient } from "aurelia-http-client";
import * as LogManager from "aurelia-logging";
import { ConsoleAppender } from 'aurelia-logging-console';
import { RestClient } from "./utils";
import { Container } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import { Uploader } from "@app/upload";

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .globalResources('access-control')
    .plugin('webarch')
    .plugin('aurelia-dialog')
    .plugin('aurelia-validation')
    .plugin('aurelia-kendoui-bridge', kendo => kendo.pro());

  LogManager.addAppender(new ConsoleAppender());
  LogManager.setLevel(LogManager.logLevel.warn);
  let config = await loadConfig();
  aurelia.container.registerInstance('config', config);
  let apiBaseUrlOverride = localStorage.getItem('api.baseUrl');
  await configureRestClient(apiBaseUrlOverride || config.api.baseUrl, aurelia.container);

  aurelia.container.registerInstance(Uploader, new Uploader({ baseUrl: config.upload.baseUrl, method: 'PUT' }));

  await aurelia.start();
  await aurelia.setRoot();
}

async function loadConfig() {
  let http = new HttpClient();
  let baseURI = document.baseURI;
  if (!baseURI.endsWith('/')) baseURI += '/';
  let config = await http.get(`${baseURI}config.json`).then(res => res.content);
  return config;
}

/**
 *
 * @param container DI容器
 */
async function configureRestClient(baseUrl: string, container: Container) {
  let eventAggregator: EventAggregator = container.get(EventAggregator);
  let http: HttpClient = new class extends RestClient {};

  eventAggregator.subscribe('user:login', user => {
    console.log('user:login', user);
    http.configure(b => {
      if (user.token) b.withHeader("x-eupwood-session-token", user.token);
    });
  });

  eventAggregator.subscribe('user:logout', () => {
    http.configure(b => {
      b.withHeader("x-eupwood-session-token", null);
    });
  });
  

  http.configure(builder => {
    builder
      .withBaseUrl(baseUrl)
      .withHeader('accept', 'application/json')
      .withInterceptor({
        responseError: res => {
          if (res.statusCode >= 500) {
            if (res.mimeType == 'application/json') {
              console.error(res.content.message);
            } else {
              console.error(res.response);
            }
            return Promise.reject(new Error(`服务器错误[${res.statusCode}]`));
          }
          if (res.mimeType == 'application/json') {
            return Promise.reject(new Error(res.content.message));
          } else {
            return Promise.reject(new Error(res.response));
          }
        }
      });
  });

  container.registerInstance(RestClient, http);
}

