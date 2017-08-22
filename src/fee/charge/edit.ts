import { Router } from "aurelia-router";
import { inject, newInstance } from 'aurelia-dependency-injection';
import { ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { ChargeInfo, chargeInfoValidationRules } from '@app/fee/models/charge';
import { ChargeInfoService } from "@app/fee/services/charge";
import { ConstantValues } from "@app/common/models/constant-values";
import { DialogService } from "ui";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";
import { CargoRateStep } from '@app/base/models/cargo-info';
import { uuid } from '@app/utils';
import { ChargeAuditItem } from '@app/fee/models/charge-audit';

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
  rateType: number = -1;

  chargeItems: ChargeAuditItem[] = [];
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
          chargeCategoryName: { editable: false },
          cargoCategoryName: { editable: false },
          warehouseName: { editable: false },
          quantity: { editable: false },
          number: { editable: false },
          unitName: { editable: false },
          pricingMode: { editable: false },
          price: { editable: false },
          actualPrice: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 }},
          workName: {editable: false}
        }
      }
    }
  });
  cargoRateStepList: CargoRateStep[]; 
  units = [] as DictionaryData[];
  customerGrid : kendo.ui.Grid;
  rowExpands = new Set();
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
    if (this.chargeInfo && this.chargeInfo.chargeAuditItemList && this.chargeInfo.chargeAuditItemList.length > 0) {
      this.chargeInfo.chargeAuditItemList.map(item => {
        let unit = this.units.find(r => r.dictDataCode == item.unit);
        if (unit) {
          item.unitStr = unit.dictDataName;
        }
        let rateType = ConstantValues.WorkInfoCategory.find(r => r.value == item.rateType);
        if (rateType) {
          item.rateTypeName = rateType.text;
        }
        let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == item.chargeCategory);
        if (chargeCategory) {
          item.chargeCategoryName = chargeCategory.text;
        }
        if (item.cargoRateStepList) {
          item.cargoRateStepList.map(rate => {
            let unit = this.units.find(r => r.dictDataCode == rate.stepUnit);
            if (unit) {
              rate.stepUnitName = unit.dictDataName;
            }
          });
        }
      });
    }
    this.chargeItems = this.chargeInfo.chargeAuditItemList;

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
    if (!this.batchNumber || !this.chargeCategory) {
      return this.dialogService.alert({ title: "提示", message: "请选择批次、费用类别", icon: 'error' });
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
    if (2 == this.chargeCategory) {
      for (let item of this.chargeItems) {
        if (!this.rateType || -1 == this.rateType) {
          if (item.batchNumber == this.batchNumber && (2 == item.chargeCategory || 3 == item.chargeCategory)) {
            return;
          }
        }else {
          if (item.batchNumber == this.batchNumber && (2 == item.chargeCategory || 3 == item.chargeCategory) && item.rateType == this.rateType) {
            return;
          }
        }
      }
    }else {
      for (let item of this.chargeItems) {
        if (!this.rateType || -1 == this.rateType) {
          if (item.batchNumber == this.batchNumber && item.chargeCategory == this.chargeCategory) {
            return;
          }
        }else {
          if (item.batchNumber == this.batchNumber && item.chargeCategory == this.chargeCategory && item.rateType == this.rateType) {
            return;
          }
        }
      }
    }
    if (items) {
      items.map(item => {
        let unit = this.units.find(r => r.dictDataCode == item.unit);
        if (unit) {
          item.unitStr = unit.dictDataName;
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
        // 临时加id，让组件修改时识别
        item.id = '_' + uuid();
      });
    }
    
    this.chargeItems = this.chargeItems.concat(items);
    this.chargeItemDataSource.read();
    
  }

  async deleteChargeItem() {
    if (!this.batchNumber || !this.chargeCategory) {
      return this.dialogService.alert({ title: "提示", message: "请选择批次、费用类别", icon: 'error' });
    }
    if (2 == this.chargeCategory) {
      if (this.rateType && -1 != this.rateType) {
        this.chargeItems = this.chargeItems.filter(item => 
          item.batchNumber != this.batchNumber || (2 != item.chargeCategory && 3 != item.chargeCategory) || item.rateType != this.rateType
        );
      }else {
        this.chargeItems = this.chargeItems.filter(item => 
          item.batchNumber != this.batchNumber || (2 != item.chargeCategory && 3 != item.chargeCategory)
        );
      }
    }else {
      if (this.rateType && -1 != this.rateType) {
        this.chargeItems = this.chargeItems.filter(item => 
          item.batchNumber != this.batchNumber || item.chargeCategory != this.chargeCategory || item.rateType != this.rateType
        );
      }else {
        this.chargeItems = this.chargeItems.filter(item => 
          item.batchNumber != this.batchNumber || item.chargeCategory != this.chargeCategory
        );
      }
    }
    this.chargeItemDataSource.read();
  }

  /**
   * 保存
   */
  async update() {
    // 去除临时id
    if (this.chargeItems) {
      this.chargeItems.forEach(item => {
        if (item.id.startsWith('_')) {
          item.id = null;
        }
      });
    }
    this.validationController.addObject(this.chargeInfo, chargeInfoValidationRules);
    this.chargeInfo.chargeAuditItemList = this.chargeItems;
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

  detailInit(e) {
    let a = e.data;
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(e.data.cargoRateStepList);
          },
          update: (options) => {
            options.success();
          },
          destroy: (options) => {
            options.success();
          }
        },
        schema: {
          model: {
            id: 'id',
            fields: {
              stepNum: { editable: false },
              stepStart: { editable: false },
              stepEnd: { editable: false },
              stepPrice: { editable: false },
              actualStepPrice: { editable: true, notify: true, type: 'number' },
              stepUnit: { editable: false },
              remark: { editable: false }
            }
          }
        },
      },
      editable: true,
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        { field: 'stepPrice', title: '阶梯价'},
        { field: 'actualStepPrice', title: '实际阶梯价'},
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
      save: (e) => {
        e.sender.saveChanges();
        this.chargeItemDataSource.pushUpdate(a as CargoRateStep[]);
      }
    });
  }
  /**
   * 展开
   */
  detailExpand(e) {
    let uid = e.masterRow.data('uid');
    this.rowExpands.add(uid);
  }
  /**
   * 折叠
   */
  detailCollapse(e) {
    let uid = e.masterRow.data('uid');
    this.rowExpands.delete(uid);
  }

  dataBound() {
    this.rowExpands.forEach(uid => this.customerGrid.expandRow($('tr[data-uid=' + uid + ']')));
  }
}
