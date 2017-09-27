import { observable} from "aurelia-framework";
import { bindable } from "aurelia-templating";
import { CargoRateStep } from '@app/base/models/cargo-info';

// @customElement('rate-steps')
export class RateStepsCustomElement {

  @bindable
  @observable
  rateSteps: CargoRateStep[];
  
  dataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.rateSteps);
      },
      update: (options) => {
        options.success();
        console.log();
      },
      destroy: (options) => {
        options.success();
      }
    },
    autoSync: true,
    schema: {
      model: {
        id: 'id',
        fields: {
          stepNum: { editable: false },
          stepStart: { editable: false },
          stepEnd: { editable: false },
          stepPrice: { editable: false },
          stepUnitName: { editable: false },
          remark: { editable: false }
        }
      }
    }
  });
}