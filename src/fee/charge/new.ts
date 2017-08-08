import { Router } from "aurelia-router";
import { inject, newInstance } from 'aurelia-dependency-injection';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { Organization } from '@app/base/models/organization';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { ChargeInfo, ChargeItem } from '@app/fee/models/charge';
import { ChargeInfoService } from "@app/fee/services/charge";
import { ConstantValues } from "@app/common/models/constant-values";
import { DialogService } from "ui";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

export class NewChargeInfo {
  disabled: boolean = false;
  agents: Organization[];
  agentWidget: any;
  customers: Organization[];
  customerWidget: any;
  chargeInfo = {} as ChargeInfo;
  batchNumbers = new kendo.data.HierarchicalDataSource({
    data: []
  });
  workInfoCategorys = ConstantValues.WorkInfoCategory;
  chargeCategorys = ConstantValues.ChargeCategory;

  batchNumber: string;
  chargeCategory: number;

  chargeItems: ChargeItem[] = [];
  chargeItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.chargeItems);
      }
    }
  });
  units = [] as DictionaryData[];

  constructor(@inject private router: Router,
              @inject private cargoInfoService: CargoInfoService,
              @newInstance() private validationController: ValidationController,
              @inject private chargeInfoService: ChargeInfoService,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate() {
    this.validationController.addObject(this.chargeInfo, validationRules);

    //仓储代理商
    this.agents = await this.cargoInfoService.getCustomers(1);
    //仓储客户
    this.customers = await this.cargoInfoService.getCustomers(1);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
  }

  /**
   * 客户 -> 批次
   */
  async customerChanged() {
    this.chargeInfo.customerId = this.customerWidget.value();
    this.chargeInfo.customerName = this.customerWidget.text();
    this.chargeInfo.agentId = this.agentWidget.value();
    this.chargeInfo.agentName = this.agentWidget.text();
    if (this.chargeInfo.customerId) {
      let batchNumbers = await this.chargeInfoService.getBatchNumbers(this.chargeInfo.customerId);
      if (batchNumbers) {
        let bs = batchNumbers.map(b => Object.assign({key: b, value: b}));
        this.batchNumbers.data(bs);
      }
    }
  }

  validateProperty(propertyName: string) {
    this.validationController.validate({ object: this.chargeInfo, propertyName });
  }
  cancel() {
    this.router.navigateToRoute("list");
  }
  
  /**
   * 列出申请明细
   */
  async addChargeItem() {
    if (!this.batchNumber || !this.chargeCategory) {
      return this.dialogService.alert({ title: "提示", message: "请选择批次和费用类别", icon: 'error' });
    }
    let items = await this.chargeInfoService.getItems(this.batchNumber, this.chargeCategory);
    if (items) {
      items.map(item => {
        let unit = this.units.find(r => r.dictDataCode == item.unit);
        if (unit) {
          item.unitName = unit.dictDataCode;
        }
        let rateType = this.workInfoCategorys.find(r => r.value == item.rateType);
        if (rateType) {
          item.rateTypeName = rateType.text;
        }
        let chargeCategory = this.chargeCategorys.find(r => r.value == item.chargeCategory);
        if (chargeCategory) {
          item.chargeCategoryName = chargeCategory.text;
        }
      });
    }
    this.chargeItems = Array.apply( this.chargeItems, items);
    this.chargeItemDataSource.read();
    
  }

  /**
   * 保存
   */
  async save() {
    this.chargeInfo.chargeItemList = this.chargeItems;
    this.disabled = true;
    try {
      await this.chargeInfoService.saveChargeInfo(this.chargeInfo);
      console.log(this.chargeInfo);
      
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

}

const validationRules = ValidationRules
  .ensure((info: ChargeInfo) => info.agentId)
  .displayName('代理商名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.customerId)
  .displayName('客户名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;

