import { Router } from "aurelia-router";
import { inject, newInstance } from 'aurelia-dependency-injection';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { Organization } from '@app/base/models/organization';
import { ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { ChargeInfo, chargeInfoValidationRules } from '@app/fee/models/charge';
import { ChargeInfoService } from "@app/fee/services/charge";
import { ConstantValues } from "@app/common/models/constant-values";
import { DialogService } from "ui";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";
// import { CargoRateStep } from '@app/base/models/cargo-info';
import { uuid } from '@app/utils';
import { ChargeAuditItem } from '@app/fee/models/charge-audit';
import * as moment from 'moment';

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
  chargeCategoryVos = ConstantValues.ChargeCategoryVo;

  batchNumber: string;
  chargeCategory: number = -1;
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
          unitStr: { editable: false },
          pricingMode: { editable: false },
          price: { editable: false },
          actualPrice: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 }},
          workInfoName: {editable: false},
          startDate: {editable: false},
          endDate: {editable: false},
        }
      }
    }
  });
  cargoRateStepList = new Map(); 
  units = [] as DictionaryData[];
  batchNumberWidget: any;
  chargeCategoryWidget: any;
  workInfoCategoryWidget: any;

  startDatePicker: any;
  endDatePicker: any;
  chargeStartDate: any;
  chargeEndDate: any;
  constructor(@inject private router: Router,
              @inject private cargoInfoService: CargoInfoService,
              @newInstance() private validationController: ValidationController,
              @inject private chargeInfoService: ChargeInfoService,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate() {
    this.validationController.addObject(this.chargeInfo, chargeInfoValidationRules);

    //仓储代理商
    this.agents = await this.cargoInfoService.getCustomers(1);
    //仓储客户
    this.customers = await this.cargoInfoService.getCustomers(1);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
  }
  /**
   * 代理商 -> 客户
   */
  async agentChanged() {
    this.chargeInfo.customerId = this.agentWidget.value();
    this.chargeInfo.customerName = this.agentWidget.text();
    this.chargeInfo.agentName = this.agentWidget.text();
    this.chargeInfo.paymentUnit = this.agentWidget.text();
    let batchNumbers = await this.chargeInfoService.getBatchNumbers(this.chargeInfo.customerId);
    if (batchNumbers) {
      let bs = batchNumbers.map(b => Object.assign({key: b, value: b}));
      this.batchNumbers.data(bs);
    }
    this.chargeItems = [];
    this.cargoRateStepList = new Map();
    this.chargeItemDataSource.read();
  }

  /**
   * 客户 -> 批次
   */
  async customerChanged() {
    this.chargeInfo.customerId = this.customerWidget.value();
    this.chargeInfo.customerName = this.customerWidget.text();
    this.chargeInfo.agentId = this.agentWidget.value();
    this.chargeInfo.agentName = this.agentWidget.text();
    this.chargeInfo.paymentUnit = this.customerWidget.text();
    if (this.chargeInfo.customerId) {
      let batchNumbers = await this.chargeInfoService.getBatchNumbers(this.chargeInfo.customerId);
      if (batchNumbers) {
        let bs = batchNumbers.map(b => Object.assign({key: b, value: b}));
        this.batchNumbers.data(bs);
      }
    }
    // this.batchNumberWidget.select(0);
    this.chargeItems = [];
    this.cargoRateStepList = new Map();
    this.chargeItemDataSource.read();
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
    if (!this.chargeInfo.customerId) {
      return this.dialogService.alert({ title: "提示", message: "请选择客户", icon: 'error' });
    }
    this.batchNumber = this.batchNumberWidget.value();
    this.chargeCategory = this.chargeCategoryWidget.value();
    this.rateType = this.workInfoCategoryWidget.value();
    if (!this.rateType) this.rateType = -1;
    if (!this.chargeCategory) this.chargeCategory = -1;
    let chargeStartDate = moment(this.chargeStartDate).format("YYYY-MM-DD HH:mm:ss");
    let chargeEndDate = moment(this.chargeEndDate).hour(23).minute(59).second(59).format("YYYY-MM-DD HH:mm:ss");
    let items = await this.chargeInfoService.getItems(this.chargeInfo.customerId, chargeStartDate, chargeEndDate, this.batchNumber, this.chargeCategory, this.rateType);
    if (items && items.length == 0) {
      return await this.dialogService.alert({ title: "提示", message: "无此费用可结算", icon: 'error' });
    }
    if (items.length == undefined) {
      let m = {message: ''};
      Object.assign(m, items);
      return await this.dialogService.alert({ title: "提示", message: m.message, icon: 'error' });
    }
    // 过滤多选
    for (let item of this.chargeItems) {
      for (let i of items) {
        if (item.batchNumber == i.batchNumber && item.chargeCategory == i.chargeCategory
          && item.rateType == i.rateType && item.cargoItemId == i.cargoItemId
          && item.warehouseId == i.warehouseId && item.cargoRateId == i.cargoRateId) {
          return;
        }
      }
    }
    
    if (items) {
      items.map(item => {
        if (item.startDate) {
          item.startDate = new Date(item.startDate);
        }
        if (item.endDate) {
          item.endDate = new Date(item.endDate);
        }
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
            this.cargoRateStepList.set(rate.id, rate);
          });
        }
        
        // 临时加id，让组件修改时识别
        item.id = uuid();
      });
    }
    
    this.chargeItems = this.chargeItems.concat(items);
    this.chargeItemDataSource.read();
  }

  async deleteChargeItem() {
    this.chargeItems = [];
    this.chargeItemDataSource.read();
  }

  /**
   * 保存
   */
  async save() {
    // 去除临时id
    if (this.chargeItems) {
      this.chargeItems.forEach(item => item.id = null);
    }
    this.chargeInfo.chargeAuditItemList = this.chargeItems;
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      await this.chargeInfoService.saveChargeInfo(this.chargeInfo);
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success([...this.cargoRateStepList.values()]);
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
        filter: { field: 'cargoRateId', operator: 'eq', value: e.data.cargoRateId }
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
        // this.chargeItemDataSource.pushUpdate(a as CargoRateStep[]);
      },
    
    });
  }

  startChange() {
    let startDate = this.startDatePicker.value();
    let endDate = this.endDatePicker.value();

    if (startDate) {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate());
      this.endDatePicker.min(startDate);
    } else if (endDate) {
      this.startDatePicker.max(new Date(endDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }

  endChange() {
    let endDate = this.endDatePicker.value();
    let startDate = this.startDatePicker.value();

    if (endDate) {
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate());
      this.startDatePicker.max(endDate);
    } else if (startDate) {
      this.endDatePicker.min(new Date(startDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }

}
