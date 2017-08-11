import { observable} from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { CargoRateStep } from '@app/base/models/cargo-info';

@customElement('rate-steps')
export class RateStepList {

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
          actualStepPrice: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 } },
          stepUnit: { editable: false },
          remark: { editable: false }
        }
      }
    },
  });

}