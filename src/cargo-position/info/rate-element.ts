import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { CargoRate } from "@app/base/models/cargo-info";

@customElement('rate')
export class RatesCustomElement {

  @bindable()
  @observable
  rates: CargoRate[];

  dataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.rates);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    },
    autoSync: true
    // schema: {
    //   model: {
    //     id: 'id',
    //     fields: {
    //       stepNum: { editable: false },
    //       stepStart: { editable: false },
    //       stepEnd: { editable: false },
    //       stepPrice: { editable: false },
    //       stepUnitName: { editable: false },
    //       remark: { editable: false }
    //     }
    //   }
    // }
  });
}