import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { NewRateStep } from "./step/new";
import { Rate } from "@app/base/models/rate";
import { RateService, RateStepService } from "@app/base/services/rate";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { CargoCategoryTree } from "@app/base/rate/cargo-category-tree";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  rate: Rate;
  rateStep = [];
  //数据字典数据方法完成后从数据字典中获取
  chargeCategory = [{ text: "仓储费", value: 1 },
  { text: "装卸费", value: 2 },
  { text: "其他费用", value: 5 }];
  customerCategory = [{ text: "仓储客户", value: 1 }, { text: "装卸单位", value: 2 }];
  chargeType = [{ text: "收费业务", value: 1 }, { text: "付费业务", value: 2 }];
  pricingMode = [{ text: "单一计费", value: 1 }, { text: "阶梯计费", value: 2 }];

  warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  unit = [] as DictionaryData[];
  dataSourceRateStep = new kendo.data.HierarchicalDataSource({
    data: []
  });

  constructor(private router: Router,
              private rateService: RateService,
              private rateStepService: RateStepService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {

  }

  async activate(params) {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    
    this.rate = await this.rateService.getRate(params.id);
    let res = await this.rateStepService.listRateStepByRateId(params.id);
    if (res) {
      Object.assign(this.rateStep, res);
      this.dataSourceRateStep.data(this.rateStep);
    }
  }

  async selectWorkInfo() {
    let result = await this.dialogService.open({ viewModel: WorkInfoTree, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    this.rate.workName = workInfo.name;
    this.rate.workId = workInfo.id;
  }

  async selectCargoCategory() {
    let result = await this.dialogService.open({ viewModel: CargoCategoryTree, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.rate.cargoCategoryName = cargoCategory.categoryName;
    this.rate.cargoCategoryId = cargoCategory.id;
  }

  async updateRate() {
    if (this.rateStep) {
      Object.assign(this.rate, { rateStep: this.rateStep });
    }
    try {
      await this.rateService.updateRate(this.rate);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
    }
  }

  async addStep() {
    let result = await this.dialogService.open({ viewModel: NewRateStep, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let r = [0, 1, 2, 3].sort(() => Math.random() - 0.5).toString();
    let ob = {};
    Object.assign(ob, result.output);
    Object.assign(ob, { sign: r });
    this.rateStep.push(ob);
    this.dataSourceRateStep.data(this.rateStep);
  }

  deleteStep(e) {
    for (let o of this.rateStep) {
      if (e.sign == o.sign) {
        let index = this.rateStep.indexOf(o);
        this.rateStep.splice(index, 1);
      }
    }
    this.dataSourceRateStep.data(this.rateStep);
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}