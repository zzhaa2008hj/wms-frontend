import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { inject } from "aurelia-dependency-injection";
import { PositionTransferRateItemService } from "@app/cargo-position/services/transfer-rate";

@customElement('rate-steps')
export class RateStepsCustomElement {

  @bindable
  @observable
  rateStepsId: string;

  dataSource: kendo.data.DataSource;

  constructor(@inject private positionTransferRateItemService: PositionTransferRateItemService) {
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          this.positionTransferRateItemService.getItemsByRateId(this.rateStepsId)
            .then(options.success)
            .catch(err => options.error("", "", err));
        }
      }
    });

  }
}