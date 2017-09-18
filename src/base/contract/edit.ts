import { Router } from "aurelia-router";
import { MessageDialogService, DialogService } from "ui";
import { newInstance, inject } from 'aurelia-dependency-injection';
import { ContractVo } from "@app/base/models/contractVo";
import { ContractService } from "@app/base/services/contract";
import { Rate, RateStep } from "@app/base/models/rate";
import { WorkInfo } from "@app/base/models/work-info";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { Contract, ContractSearch } from '@app/base/models/contract';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import { CargoCategoryTree } from "@app/base/rate/cargo-category-tree";
import { WorkInfoTree } from "@app/base/rate/work-info-tree";
import { uuid } from '@app/utils';

export class EditContract {
  disabled: boolean = false;
  contractVo = {} as ContractVo;
  contract = {} as Contract;

  unit = [] as DictionaryData[];
  // warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

  contractTypes = ConstantValues.ContractTypes;
  warehouses: WorkInfo[];
  customerInfo: kendo.ui.DropDownList;
  datasource: kendo.data.DataSource;
  startDatePicker: kendo.ui.DatePicker;
  endDatePicker: kendo.ui.DatePicker;
  initTime = false;

  /**
   * 客户合同费率
   */
  baseRateAndSteps: Rate[];
  /**
   * 客户合同阶梯费率
   */
  baseRateStep: RateStep[];
  /**
   * 基础费率
   */
  allBaseRateAndSteps: Rate[];
  /**
   * 基础阶梯费率
   */
  allBaseRateStep: RateStep[];

  search = {} as ContractSearch;
  chargeCategory = ConstantValues.ChargeCategory;
  pricingMode = ConstantValues.PricingMode;

  constructor(@inject private router: Router,
              @inject private contractService: ContractService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.baseRateAndSteps);
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
            price: { type: 'number', validation: { required: true, min: 0, max: 1000000000000000 }, editable: true },
            rateCategory: { editable: false },
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
    validationController.addRenderer(formValidationRenderer);
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    // this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.contractVo = await this.contractService.getContract(id);
    this.contract = this.contractVo.contract;
    this.contract.contractTypeStr = this.contractTypes[this.contract.contractType - 1].name;
    if (this.contract.contractType == 3) {
      //库区信息
      this.warehouses = await this.contractService.getWarehouses();
      this.validationController.addObject(this.contractVo, warehouseIdRules);
    } else {
      let rates = this.contractVo.rateVos;
      rates.map(res => {
        let unit = this.unit.find(d => res.unit == d.dictDataCode);
        // let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
        let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
        let rateType = this.rateTypes.find(d => res.rateType == d.value);
        if (unit) {
          res.unitStr = unit.dictDataName;
        }
        // if (warehouseType) {
        //   res.warehouseTypeStr = warehouseType.dictDataName;
        // }
        if (warehouseCategory) {
          res.warehouseCategoryStr = warehouseCategory.dictDataName;
        }
        if (rateType) {
          res.rateTypeStr = rateType.text;
        }
        return res;
      });
      this.baseRateAndSteps = rates;
      this.baseRateStep = this.contractVo.rateStepVos;
      this.baseRateStep.map(res => {
        if (res.stepUnit) {
          res.stepUnitStr = this.unit.find(r => r.dictDataCode == res.stepUnit).dictDataName;
        }
        return res;
      });
    }
    //获取所有的费率
    let allRates = await this.contractService.getBaseRate();
    allRates.map(res => {
      let unit = this.unit.find(d => res.unit == d.dictDataCode);
      //let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
      if (unit) {
        res.unitStr = unit.dictDataName;
      }
      // if (warehouseType) {
      //   res.warehouseTypeStr = warehouseType.dictDataName;
      // }
      if (warehouseCategory) {
        res.warehouseCategoryStr = warehouseCategory.dictDataName;
      }
      if (rateType) {
        res.rateTypeStr = rateType.text;
      }
      return res;
    });
    this.allBaseRateAndSteps = allRates;

    //获得基础费率的阶梯费率
    this.allBaseRateStep = await this.contractService.getBaseRateStep();
    this.allBaseRateStep.map(res => {
      if (res.stepUnit) {
        res.stepUnitStr = this.unit.find(r => r.dictDataCode == res.stepUnit).dictDataName;
      }
      return res;
    });

    this.validationController.addObject(this.contract, validationRules);
  }


  async update() {
    await this.datasource.sync();

    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.contractVo.contract = this.contract;

    let rateList = this.baseRateAndSteps;
    let allRateStep = [];
    //  .filter(x => x.customerCategory == this.contract.contractType);

    rateList.forEach(r => {
      let id = r.id;
      let rateSteps: RateStep[];
      if (r.customerCategory) {
        rateSteps = this.allBaseRateStep.filter(res => res.rateId == id);
        r.id = uuid();
        rateSteps.map(e => {
          e.rateId = r.id;
          e.id = uuid();
          return e;
        });
      } else {
        rateSteps = this.baseRateStep.filter(res => res.rateId == id);
        r.id = uuid();
        rateSteps.map(e => {
          e.rateId = r.id;
          e.id = uuid();
          return e;
        });
      }
      allRateStep = allRateStep.concat(rateSteps);
    });
    this.contractVo.rateVos = rateList;
    this.contractVo.rateStepVos = allRateStep;
    this.disabled = true;
    try {
      await this.contractService.updateContract(this.contractVo);
      await this.messageDialogService.alert({ title: "编辑成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "发生错误", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  onOpen() {
    if (!this.initTime) {
      let startDate = this.contract.startTime;
      let endDate = this.contract.endTime;

      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate());
      this.endDatePicker.min(startDate);

      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate());
      this.startDatePicker.max(endDate);
      this.initTime = true;
    }
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

  updateProp(item, property) {
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

  validateVoProperty(propertyName: string) {
    this.validationController.validate({ object: this.contractVo, propertyName });
  }

  detailInit(e) {
    let detailRow = e.detailRow;

    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            if (e.data.customerCategory) {
              options.success(this.allBaseRateStep);
            } else {
              options.success(this.baseRateStep);
            }
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

  select() {
    let source = [];
    Object.assign(source, this.allBaseRateAndSteps);
    //按条件搜索
    for (let e in this.search) {
      if (this.search[e]) {
        source = source.filter(x => x[e] == this.search[e]);
      }
    }
    //过滤不同合同类型的费率
    source = source.filter(r => r.customerCategory == this.contract.contractType);
    //过滤已经选择的合同费率
    source = source.filter(r => {
      return this.baseRateAndSteps.every(e => {
        let res1 = true;
        let res2 = true;
        let res3 = true;
        let res4 = true;
        let res5 = true;
        let res6 = true;
        if (e.chargeType) {
          res1 = e.chargeType == r.chargeType
        }
        if (e.chargeCategory) {
          res2 = e.chargeCategory == r.rateCategory
        }
        if (e.rateType) {
          res3 = e.rateType == r.rateType
        }
        if (e.workId) {
          res4 = e.workId == r.workId
        }
        if (e.warehouseCategory) {
          res5 = e.warehouseCategory == r.warehouseCategory
        }
        if (e.pricingMode) {
          res6 = e.pricingMode == r.pricingMode
        }
        return !(res1 && res2 && res3 && res4 && res5 && res6);
      });
    });
    //合并费率
    this.baseRateAndSteps = this.baseRateAndSteps.concat(source);
    this.datasource.read();
  }

  delete(e) {
    this.baseRateAndSteps = this.baseRateAndSteps.filter(r => r.id != e.id);
    this.datasource.remove(e);
  }

}

const validationRules = ValidationRules
  .ensure((contract: Contract) => contract.contractType)
  .displayName('合同类型')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.customerId)
  .displayName('客户名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.contractNumber)
  .displayName('合同编号')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((contract: Contract) => contract.contractName)
  .displayName('合同名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((contract: Contract) => contract.contractAmount)
  .displayName('合同金额')
  .required().withMessage(`\${$displayName} 不能为空`)
  // .maxLength(17).withMessage(`\${$displayName} 过长`)
  .satisfies(x => !x || (x <= 1000000000000000 && x >= 0))
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)

  .ensure((contract: Contract) => contract.startTime)
  .displayName('合同开始日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.endTime)
  .displayName('合同结束日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.signDate)
  .displayName('合同签订日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.signer)
  .displayName('签订人')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((contract: Contract) => contract.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;

const warehouseIdRules = ValidationRules
  .ensure((contractVo: ContractVo) => contractVo.warehouseId)
  .displayName('存放库区')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;
