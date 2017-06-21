import { DialogController } from "ui";
import { Rate, RateStep } from "../../models/Rate";
import { autoinject } from "aurelia-dependency-injection";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRateStep {
  rateId: string;
  rateStep: RateStep;
  stepUnit = [{ text: "元/天", value: "元/天" }, { text: "元/吨", value: "元/吨" }];

  constructor(private dialogController: DialogController) {

  }

  activate(id: string) {
    this.rateId = id;
  }

  async save() {
    this.rateStep.rateId = this.rateId;
    await this.dialogController.ok(this.rateStep);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}