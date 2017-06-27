import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { RateService, RateStepService } from "../services/rate";
import { autoinject } from "aurelia-dependency-injection";
import { Rate, RateStep } from "../models/Rate";
import { WorkInfoService } from "../services/work-info";
import { CargoCategoryService } from "../services/cargo-category";
import { treeHelper, TreeHelper } from "../../utils";
import { NewRateStep } from "./step/new";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  isWorkInfo = false;
  isCargoCategory = false;
  rate: Rate;
  rateStep = new Array;
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
  dataSourceWorkInfo = new kendo.data.HierarchicalDataSource({
    data: [],
    schema: {
      model: {
        id: 'id',
        children: 'sub',
        hasChildren: item => item.sub && item.sub.length > 0
      }
    }
  });
  selectedCargoCategory: any;
  dataSourceCargoCategory = new kendo.data.HierarchicalDataSource({
    data: [],
    schema: {
      model: {
        id: 'id',
        children: 'sub',
        hasChildren: item => item.sub && item.sub.length > 0
      }
    }
  });
  dataSourceRateStep = new kendo.data.HierarchicalDataSource({
    data: []
  });
  private helper: TreeHelper<any>;

  constructor(private router: Router,
              private rateService: RateService,
              private rateStepService: RateStepService,
              private workInfoService: WorkInfoService,
              private dialogService: DialogService,
              private cargoCategoryService: CargoCategoryService,
              private messageDialogService: MessageDialogService) {

  }

  async activate(params) {
    this.rate = await this.rateService.getRate(params.id);
    this.rateStep = await this.rateStepService.listRateStepByRateId(params.id);
    console.log(this.rate);
    this.dataSourceRateStep.data(this.rateStep);
    this.initData();
  }

  async initData() {
    let wData = await this.workInfoService.listWorkInfo();
    this.helper = treeHelper(wData, { childrenKey: 'sub' });
    let wRootItems = this.helper.toTree();
    this.dataSourceWorkInfo.data(wRootItems);
    let cData = await this.cargoCategoryService.listCargoCategory();
    this.helper = treeHelper(cData, { childrenKey: 'sub' });
    let cRootItems = this.helper.toTree();
    this.dataSourceCargoCategory.data(cRootItems);
  }

  onSelectedWorkInfoChange() {
    let node = this.selectedWorkInfo.select()[0];
    if (!node) return;
    let selectedItem = this.selectedWorkInfo.dataItem(node);
    console.log(selectedItem);
    this.rate.workName = selectedItem.name;
    this.rate.workId = selectedItem.id;
  }

  onSelectedCargoCategoryChange() {
    let node = this.selectedCargoCategory.select()[0];
    if (!node) return;
    let selectedItem = this.selectedCargoCategory.dataItem(node);
    console.log(selectedItem);
    this.rate.cargoCategoryName = selectedItem.categoryName;
    this.rate.cargoCategoryId = selectedItem.id;
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