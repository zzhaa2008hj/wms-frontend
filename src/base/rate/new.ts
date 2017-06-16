import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { RateService } from "../services/rate";
import { autoinject } from "aurelia-dependency-injection";
import { Rate } from "../models/Rate";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  rate: Rate;
  dataSourceWorkInfo = new kendo.data.DataSource({
    transport: {
      read: (o) => {
            o.success;
          });
      }
    }
  });

  constructor(private router: Router,
              private rateService: RateService,
              private messageDialogService: MessageDialogService) {
  }

  async addNewRate() {
    console.log(this.rate.chargeCategory);
    // try {
    //   await this.rateService.saveRate(this.rate);
    //   await this.messageDialogService.alert({ title: "新增成功" });
    //   this.router.navigateToRoute("list");
    // } catch (err) {
    //   await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    // }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}