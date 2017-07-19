import { DataSourceFactory } from "@app/utils";
import { observable, inject} from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { CargoRateStep } from '@app/base/models/cargo-info';

@customElement('rate-steps')
export class RateSteps {

  @bindable
  @observable
  rateSteps: CargoRateStep[];
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