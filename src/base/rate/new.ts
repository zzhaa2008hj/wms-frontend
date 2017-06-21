import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { RateService } from "../services/rate";
import { autoinject } from "aurelia-dependency-injection";
import { Rate } from "../models/Rate";
import { WorkInfoService } from "../services/work-info";
import { WorkInfo } from "../models/work-info";
import { CargoCategoryService } from "../services/cargo-category";
import { treeHelper, TreeHelper } from "../../utils";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewRate {
  rate: Rate;
  //数据字典数据方法完成后从数据字典中获取
  chargeCategory = [{ text: "仓储费", value: 1 }, { text: "装卸费", value: 2 }, { text: "其他费用", value: 3 }];
  warehouseType = [{ text: "通用", value: 1 }, { text: "保税", value: 2 }, { text: "内贸", value: 3 }];
  customerCategory = [{ text: "仓储客户", value: 1 }, { text: "装卸单位", value: 2 }];
  chargeType = [{ text: "收费", value: 1 }, { text: "付费", value: 2 }];
  warehouseCategory = [{ text: "露天场内", value: 1 }, { text: "库区", value: 2 }];
  unit = [{ text: "吨", value: "吨" }, { text: "方", value: "方" }];
  pricingMode = [{ text: "天", value: 1 }, { text: "阶梯", value: 2 }];

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
    },
    schema: {
      model: {
        id: 'id',
        parentId: 'parentId',
        expanded: true
      }
    }
  };
  selectedCargoCategory: any;
  dataSourceCargoCategory = {
    transport: {
      read: async options => {
        try {
          let items = await this.cargoCategoryService.listCargoCategory();
          this.helper = treeHelper(items, { childrenKey: 'sub' });
          let rootItems = this.helper.toTree();
          options.success(rootItems);
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
  private helper: TreeHelper<any>;

  constructor(private router: Router,
              private rateService: RateService,
              private workInfoService: WorkInfoService,
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

  cancel() {
    this.router.navigateToRoute("list");
  }
}