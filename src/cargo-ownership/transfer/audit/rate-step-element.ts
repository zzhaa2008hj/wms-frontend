import { DataSourceFactory } from "@app/utils";
import { observable, inject} from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { CargoRateStep } from '@app/base/models/cargo-info';
import { CargoOwnershipTranferRateStep } from "@app/cargo-ownership/models/cargo-ownership";

@customElement('rate-steps')
export class CargoTsfRateSteps {

  @bindable
  @observable
  rateSteps: CargoOwnershipTranferRateStep[];
  dataSource: kendo.data.DataSource;

  constructor(@inject private dataSourceFactory: DataSourceFactory) {
  }
  /**
   * 加载数据
   */
  async bind() {
    this.dataSource = this.dataSourceFactory.create({
      readAll: () => this.rateSteps
    });
  }
}