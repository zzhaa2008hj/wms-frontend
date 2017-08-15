import { Router } from "aurelia-router";
import { inject, newInstance } from 'aurelia-dependency-injection';
import { ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { ChargeInfo, ChargeItem, chargeInfoValidationRules } from '@app/fee/models/charge';
import { ChargeInfoService } from "@app/fee/services/charge";
import { ConstantValues } from "@app/common/models/constant-values";
import { DialogService } from "ui";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";
import { CargoRateStep } from '@app/base/models/cargo-info';

export class NewChargeInfo {
  disabled: boolean = false;
 
  chargeInfo = {} as ChargeInfo;
  batchNumbers = new kendo.data.HierarchicalDataSource({
    data: []
  });
  workInfoCategorys = ConstantValues.WorkInfoCategory;
  chargeCategoryVos = ConstantValues.ChargeCategoryVo;

  batchNumber: string;
  chargeCategory: number;
  rateType: number;

  chargeItems: ChargeItem[] = [];
  chargeItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.chargeItems);
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
          batchNumber: { editable: false },
          rateTypeName: { editable: false },
          chargeCategory: { editable: false },
          cargoCategoryName: { editable: false },
          warehouseName: { editable: false },
          quantity: { editable: false },
          number: { editable: false },
          unitName: { editable: false },
          pricingMode: { editable: false },
          price: { editable: false },
          actualPrice: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 }},
        }
      }
    }
  });
  cargoRateStepList: CargoRateStep[]; 
  units = [] as DictionaryData[];

  constructor(@inject private router: Router,
              @newInstance() private validationController: ValidationController,
              @inject private chargeInfoService: ChargeInfoService,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate({id}) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.chargeInfo = await this.chargeInfoService.getChargeInfoAndItems(id);
    if (this.chargeInfo && this.chargeInfo.chargeItemList && this.chargeInfo.chargeItemList.length > 0) {
      this.chargeInfo.chargeItemList.map(item => {
        let unit = this.units.find(r => r.dictDataCode == item.unit);
        if (unit) {
          item.unitName = unit.dictDataName;
        }
        let rateType = ConstantValues.WorkInfoCategory.find(r => r.value == item.rateType);
        if (rateType) {
          item.rateTypeName = rateType.text;
        }
        let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == item.chargeCategory);
        if (chargeCategory) {
          item.chargeCategoryName = chargeCategory.text;
        }
        item.cargoRateStepList.map(rate => {
          let unit = this.units.find(r => r.dictDataCode == rate.stepUnit);
          if (unit) {
            rate.stepUnitName = unit.dictDataName;
          }
        });
      });
    }
    this.chargeItems = this.chargeInfo.chargeItemList;

    this.customerChanged();
  }

  /**
   * 客户 -> 批次
   */
  async customerChanged() {
    if (this.chargeInfo.customerId) {
      let batchNumbers = await this.chargeInfoService.getBatchNumbers(this.chargeInfo.customerId);
      if (batchNumbers) {
        let bs = batchNumbers.map(b => Object.assign({key: b, value: b}));
        this.batchNumbers.data(bs);
        this.batchNumber = bs[0].value;
      }
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
  
  /**
   * 列出申请明细
   */
  async addChargeItem() {
    if (!this.batchNumber || !this.chargeCategory || this.rateType) {
      return this.dialogService.alert({ title: "提示", message: "请选择批次、费用类型、费用类别", icon: 'error' });
    }
    let items = await this.chargeInfoService.getItems(this.batchNumber, this.chargeCategory, this.rateType);
    if (items && items.length == 0) {
      return await this.dialogService.alert({ title: "提示", message: "无此费用可结算", icon: 'error' });
    }
    if (items.length == undefined) {
      let m = {message: ''};
      Object.assign(m, items);
      return await this.dialogService.alert({ title: "提示", message: m.message, icon: 'error' });
    }
    // 过滤重复
    for (let item of this.chargeItems) {
      if (item.batchNumber == this.batchNumber && item.chargeCategory == this.chargeCategory && item.rateType == this.rateType) {
        return;
      }
    }
    if (items) {
      items.map(item => {
        let unit = this.units.find(r => r.dictDataCode == item.unit);
        if (unit) {
          item.unitName = unit.dictDataName;
        }
        let rateType = this.workInfoCategorys.find(r => r.value == item.rateType);
        if (rateType) {
          item.rateTypeName = rateType.text;
        }
        let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == item.chargeCategory);
        if (chargeCategory) {
          item.chargeCategoryName = chargeCategory.text;
        }
        if (item.cargoRateStepList && item.cargoRateStepList.length > 0) {
          item.cargoRateStepList.map(rate => {
            let unit = this.units.find(r => r.dictDataCode == rate.stepUnit);
            if (unit) {
              rate.stepUnitName = unit.dictDataName;
            }
          });
        }
      });
    }
    
    this.chargeItems = this.chargeItems.concat(items);
    this.chargeItemDataSource.read();
    
  }

  async deleteChargeItem() {
    if (!this.batchNumber || !this.chargeCategory || !this.rateType) {
      return this.dialogService.alert({ title: "提示", message: "请选择批次、费用类型、费用类别", icon: 'error' });
    }
    this.chargeItems = this.chargeItems.filter(item => 
      item.batchNumber != this.batchNumber || item.chargeCategory != this.chargeCategory || item.rateType != this.rateType
    );
    this.chargeItemDataSource.read();
  }

  /**
   * 保存
   */
  async update() {
    this.validationController.addObject(this.chargeInfo, chargeInfoValidationRules);
    this.chargeInfo.chargeItemList = this.chargeItems;
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      await this.chargeInfoService.updateChargeInfo(this.chargeInfo.id, this.chargeInfo);
      await this.dialogService.alert({ title: "提示", message: "修改成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

}
