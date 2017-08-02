import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { newInstance, inject } from 'aurelia-dependency-injection';
import { ContractVo } from "@app/base/models/contractVo";
import { ContractService } from "@app/base/services/contract";
import { Rate, RateStep } from "@app/base/models/rate";
import { WorkInfo } from "@app/base/models/work-info";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { Contract } from '@app/base/models/contract';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';

export class EditContract {
  disabled: boolean = false;
  contractVo = {} as ContractVo;
  contract = {} as Contract;

  unit = [] as DictionaryData[];
  warehouseType = [] as DictionaryData[];
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

  constructor(@inject private router: Router,
              @inject private contractService: ContractService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dictionaryDataService: DictionaryDataService,
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
            chargeCategory: { editable: false },
            chargeType: { editable: false },
            unitStr: { editable: false },
            rateTypeStr: { editable: false },
            pricingMode: { editable: false },
            workName: { editable: false },
            warehouseTypeStr: { editable: false },
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
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
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
        let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
        let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
        let rateType = this.rateTypes.find(d => res.rateType == d.value);
        if (unit) {
          res.unitStr = unit.dictDataName;
        }
        if (warehouseType) {
          res.warehouseTypeStr = warehouseType.dictDataName;
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
      this.baseRateStep = this.contractVo.rateStepVos;
    }
    this.validationController.addObject(this.contract, validationRules);
  }


  async update() {
    await this.datasource.sync();

    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.contractVo.contract = this.contract;
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
              stepPrice: { editable: true, notify: true, type: 'number', validation: { required: true, min: 0, max: 1000000000000000 }, title: '阶梯价' },
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
        { field: 'stepUnit', title: '单位' },
        { field: 'remark', title: '备注' }
      ],
      save: function (e) {
        e.sender.saveChanges();
      }
    });
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
