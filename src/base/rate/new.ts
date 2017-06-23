import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { RateService, RateStepService } from "../services/rate";
import { autoinject } from "aurelia-dependency-injection";
import { Rate, RateStep } from "../models/Rate";
import { WorkInfoService } from "../services/work-info";
import { WorkInfo } from "../models/work-info";
import { CargoCategoryService } from "../services/cargo-category";
import { treeHelper, TreeHelper } from "../../utils";
import { NewRateStep } from "./step/new";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  data: any[];
  rate: Rate;
  rateStep: RateStep;
  //数据字典数据方法完成后从数据字典中获取
  chargeCategory = [{ text: "仓储费", value: 1 },
    { text: "装卸费", value: 2 },
    { text: "拆箱费", value: 3 },
    { text: "过磅费", value: 4 },
    { text: "其他费用", value: 5 }];
  warehouseType = [{ text: "通用", value: 1 }, { text: "保税", value: 2 }, { text: "内贸", value: 3 }];
  customerCategory = [{ text: "仓储客户", value: 1 }, { text: "装卸单位", value: 2 }];
  chargeType = [{ text: "收费业务", value: 1 }, { text: "付费业务", value: 2 }];
  warehouseCategory = [{ text: "库", value: 1 }, { text: "场", value: 2 }];
  unit = [{ text: "重量", value: "重量" },
    { text: "体积", value: "体积" },
    { text: "件数", value: "件数" },
    { text: "车次", value: "车次" }];
  pricingMode = [{ text: "单一计费", value: 1 }, { text: "阶梯计费", value: 2 }];

  selectedWorkInfo: any;
  dataSourceWorkInfo = {
    transport: {
      read: async options => {
        try {
          let res = await this.workInfoService.listWorkInfo();
          options.success(res);
        } catch (err) {
          options.error("", "", err);
        }
      }
    }
  };
  selectedCargoCategory: any;
  dataSourceCargoCategory = {
    transport: {
      read: async options => {
        try {
          let items = await this.cargoCategoryService.listCargoCategory();
          options.success(items);
        } catch (err) {
          options.error("", "", err);
        }
      }
    },
    schema: {
      model: {
        children: 'sub',
        hasChildren: item => item.sub && item.sub.length > 0
      }
    }
  };

  dataSourceRateStep = new kendo.data.HierarchicalDataSource({
    data: this.data
  });

  constructor(private router: Router,
              private rateService: RateService,
              private rateStepService: RateStepService,
              private workInfoService: WorkInfoService,
              private dialogService: DialogService,
              private cargoCategoryService: CargoCategoryService,
              private messageDialogService: MessageDialogService) {

  }

  async addNewRate() {
    if (this.selectedWorkInfo) {
      this.rate.workName = this.selectedWorkInfo.text();
      this.rate.workId = this.selectedWorkInfo.value();
    }
    if (this.selectedCargoCategory) {
      this.rate.cargoCategoryId = this.selectedCargoCategory.value();
      this.rate.cargoCategoryName = this.selectedCargoCategory.text();
    }

    try {
      await this.rateService.saveRate(this.rate);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  async addStep() {
    let result = await this.dialogService.open({ viewModel: NewRateStep, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    this.rateStep = result.output;
    this.data = [result.output];
    console.log(this.data);
    this.dataSourceRateStep.data(this.data);
    // try {
    //   await this.rateStepService.saveRateStep(rateStep);
    //   await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
    //   this.dataSourceRateStep.read();
    // } catch (err) {
    //   await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    // }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}