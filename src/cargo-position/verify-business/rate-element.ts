import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { PositionTransferRateService } from "@app/cargo-position/services/transfer-rate";
import { inject } from "aurelia-dependency-injection";

@customElement('rate')
export class RatesCustomElement {

  @bindable()
  @observable
  itemId: string;

  dataSource: kendo.data.DataSource;

  constructor(@inject private positionTransferRateService: PositionTransferRateService) {
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          this.positionTransferRateService.getRatesByItemId(this.itemId)
            .then(options.success)
            .catch(err => options.error("", "", err));
        }
      }
    });
  }

}