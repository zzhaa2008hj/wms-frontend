
export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .plugin('aurelia-dialog')
    .plugin('aurelia-validation')
    .plugin('aurelia-kendoui-bridge', kendo => kendo.pro());

  aurelia.start().then(a => a.setRoot());
}