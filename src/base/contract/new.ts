import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { MessageDialogService, DialogService } from "ui";
import { ContractService } from "@app/base/services/contract";
import { ContractVo } from "@app/base/models/contractVo";
import { Rate, RateStep } from "@app/base/models/rate";
import { WorkInfo } from "@app/base/models/work-info";
import { Organization } from "@app/base/models/organization";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { Contract, ContractSearch, warehouseIdRules, contractValidationRules } from '@app/base/models/contract';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoCategoryTree } from "@app/base/cargo-category/tree";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";

@autoinject
export class NewContract {
  disabled: boolean = false;
  validationController: ValidationController;

  contractVo = {} as ContractVo;
  contract = {} as Contract;
  unit = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  contractTypes = ConstantValues.ContractTypes;
  warehouses: WorkInfo[];

  customers: Organization[] = [];
  handlingCustomers: Organization[];
  wareHouseCustomer: Organization[];

  customerInfo: kendo.ui.DropDownList;
  datasource: kendo.data.DataSource;
  customerDatasource: kendo.data.DataSource;

  startDatePicker: kendo.ui.DatePicker;
  endDatePicker: kendo.ui.DatePicker;

  /**
   * 基础费率
   */
  baseRateAndSteps: Rate[];
  filterBaseRateSteps: Rate[];
  source: Rate[];


  /**
   * 基础阶梯费率
   */
  baseRateStep: RateStep[];
  instockStages: any[] = ConstantValues.InstockStages;

  selection: Rate[];
  search = {} as ContractSearch;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;

  constructor(private router: Router,
              private contractService: ContractService,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.filterBaseRateSteps);
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
            price: {
              type: 'number',
              validation: { required: true, min: 0, max: 1000000000000000 },
              editable: true,
              nullable: false
            },
            rateCategory: { editable: false },
            chargeCategory: { editable: false },
            chargeType: { editable: false },
            unitStr: { editable: false },
            rateTypeStr: { editable: false },
            pricingMode: { editable: false },
            workName: { editable: false },
            // warehouseTypeStr: { editable: false },
            cargoCategoryName: { editable: false },
            cargoSubCategoryName: { editable: false },
            warehouseCategoryStr: { editable: false },
            remark: { editable: false }
          }
        }

      }
    });

    this.customerDatasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.customers);
        }
      }
    });
  }

  parse(index: number, arr: string[]) {
    if (!index) {
      return "无";
    }
    return arr[index - 1];

  }

  edit(e) {
    let mode = e.detail.model.pricingMode;
    if (mode == 1) {
      return;
    }
    let dataGrid = e.detail.sender;
    dataGrid.closeCell();
  }

  async activate() {
    //this.validationController.addObject(this.contractVo, validationRules);
    //this.validationController.addObject(this.contractVo.contract, validationRules);
    this.validationController.addObject(this.contract, contractValidationRules);
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    // this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.warehouses = await this.contractService.getWarehouses();
    //装卸单位
    this.handlingCustomers = await this.contractService.getCustomers(2);
    //仓储客户
    this.wareHouseCustomer = await this.contractService.getCustomers(1);
    let rates = await this.contractService.getBaseRate();
    rates.map(res => {
      let unit = this.unit.find(d => res.unit == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
      if (unit) {
        res.unitStr = unit.dictDataName;
      }
      if (warehouseCategory) {
        res.warehouseCategoryStr = warehouseCategory.dictDataName;
      }
      if (rateType) {
        res.rateTypeStr = rateType.text;
      }
      return res;
    });
    this.baseRateAndSteps = rates;
    this.filterBaseRateSteps = [];
    this.baseRateStep = await this.contractService.getBaseRateStep();
    this.baseRateStep.map(res => {
      if (res.stepUnit) {
        res.stepUnitStr = this.unit.find(r => r.dictDataCode == res.stepUnit).dictDataName;
      }
      return res;
    });
  }

  validateProperty(propertyName: string) {
    this.validationController.validate({ object: this.contract, propertyName });
  }

  validateVoProperty(propertyName: string) {
    this.validationController.validate({ object: this.contractVo, propertyName });
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

  contractTypeChanged() {
    // let contractType = this.contractVo.contract.contractType;
    this.search = {} as ContractSearch;
    let contractType = this.contract.contractType;
    
    //1 :
    this.filterBaseRateSteps = [];    
    if (contractType == 2) {
      this.customers = this.handlingCustomers;
      this.contract.customerId = '';
      this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: 2 });
      this.filterBaseRateSteps = this.baseRateAndSteps.filter(res => res.customerCategory == contractType);
    } else {
      this.customers = this.wareHouseCustomer;
      this.contract.customerId = '';
      this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: 1 });
    }

    if (contractType == 3) {
      this.customers = this.wareHouseCustomer;
      this.contract.customerId = '';
      this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: 1 });
      this.validationController.addObject(this.contractVo, warehouseIdRules);
    } else {
      this.validationController.removeObject(this.contractVo);
    }
    this.customerDatasource.read();
    this.datasource.read();
  }

  select() {
    this.source = [];
    Object.assign(this.source, this.baseRateAndSteps);
    //按条件搜索
    for (let e in this.search) {
      if (this.search[e]) {
        //let rate = this.baseRateAndSteps;
        this.source = this.source.filter(x => x[e] == this.search[e]);
        //this.datasource.filter({ field: e, operator: 'eq', value: this.search[e]});
      }
    }
    // this.filterBaseRateSteps = source;
    //过滤掉已经选择的费率
    this.source = this.source.filter(r => {
      return this.filterBaseRateSteps.every(e => r.id != e.id);
    });
    //合并费率
    this.filterBaseRateSteps = this.filterBaseRateSteps.concat(this.source);
    this.datasource.read();
    if (this.contract.contractType == 2) {
      this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: 2 });
    } else {
      this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: 1 });
    }
  }

  async save() {
    await this.datasource.sync();

    let { valid } = await this.validationController.validate();
    if (!valid) return;
    
    let rateList = [];
    if (this.contract.contractType == 2) {
      rateList = this.filterBaseRateSteps.filter(x => x.customerCategory == 2);
    } else {
      rateList = this.filterBaseRateSteps.filter(x => x.customerCategory == 1);
    }
    rateList.forEach(r => {
      let id = r.id;
      let rateSteps = this.baseRateStep.filter(res => res.rateId == id);
      r.rateStep = rateSteps;
    });
    if (!rateList || rateList.length == 0) {
      await this.messageDialogService.alert({ title: "新增失败", message: "请选择费率", icon: 'error' });
      return;
    }
    this.contractVo.rateVos = rateList;
    this.contract.customerName = this.customerInfo.text();
    this.contractVo.contract = this.contract;
    this.disabled = true;
    try {
      await this.contractService.saveContract(this.contractVo);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  updateProp(item, property) {
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

  delete(e) {
    this.filterBaseRateSteps = this.filterBaseRateSteps.filter(r => r.id != e.id);
    this.datasource.remove(e);
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.baseRateStep);
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
              stepPrice: {
                editable: true,
                notify: true,
                type: 'number',
                validation: { required: true, min: 0, max: 1000000000000000 },
                title: '阶梯价'
              },
              stepUnit: { editable: false },
              remark: { editable: false }
            }
          }
        },
        filter: { field: 'rateId', operator: 'eq', value: e.data.id }
      },

      editable: true,
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        {
          field: 'stepPrice',
          title: '阶梯价'
          //template: '<input type="text" value.bind=" stepPrice & validate & notify">'

        },
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
      save: function (e) {
        e.sender.saveChanges();
      }
    });
  }

  async selectCargoCategory() {
    let result = await this.dialogService
      .open({ viewModel: CargoCategoryTree, model: this.search.cargoCategoryId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let cargoCategory = result.output;
    this.search.cargoCategoryName = cargoCategory.categoryName;
    this.search.cargoCategoryId = cargoCategory.id;
  }

  async selectWorkInfo() {
    let result = await this.dialogService.open({ viewModel: WorkInfoTree, model: this.search.workId, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let workInfo = result.output;
    this.search.workName = workInfo.name;
    this.search.workId = workInfo.id;
  }

}



