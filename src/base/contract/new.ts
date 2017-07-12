import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { MessageDialogService } from "ui";
import { ContractService } from "@app/base/services/contract";
import { ContractVo } from "@app/base/models/contractVo";
import { Rate, RateStep } from "@app/base/models/rate";
import { WorkInfo } from "@app/base/models/work-info";
import { Organization } from "@app/base/models/organization";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { Contract } from '@app/base/models/contract';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class NewContract {
  validationController: ValidationController;

  contractVo = {} as ContractVo;
  contract = {} as Contract;
  unit = [] as DictionaryData[];
  warehouseType = [] as DictionaryData[];
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

  /**
   * 基础阶梯费率
   */
  baseRateStep: RateStep[];

  constructor(private router: Router,
    private contractService: ContractService,
    private messageDialogService: MessageDialogService,
    private dictionaryDataService: DictionaryDataService,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

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
            price: {
              type: 'number',
              validation: { required: true, min: 0, max: 1000000000000000 },
              editable: true,
              nullable: false
            },
            chargeCategory: { editable: false },
            chargeType: { editable: false },
            unit: { editable: false },
            pricingMode: { editable: false },
            workName: { editable: false },
            warehouseType: { editable: false },
            cargoCategoryName: { editable: false },
            cargoSubCategoryName: { editable: false },
            warehouseCategory: { editable: false },
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

  async activate() {
    //this.validationController.addObject(this.contractVo, validationRules);
    //this.validationController.addObject(this.contractVo.contract, validationRules);
    this.validationController.addObject(this.contract, validationRules);
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.warehouses = await this.contractService.getWarehouses();
    //装卸单位
    this.handlingCustomers = await this.contractService.getCustomers(2);
    //仓储客户
    this.wareHouseCustomer = await this.contractService.getCustomers(1);
    let rates = await this.contractService.getBaseRate();
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
    this.baseRateStep = await this.contractService.getBaseRateStep();
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
    let contractType = this.contract.contractType;
    this.datasource.filter({ field: 'customerCategory', operator: 'eq', value: contractType });
    //1 :
    if (contractType == 2) {
      this.customers = this.handlingCustomers;
    } else {
      this.customers = this.wareHouseCustomer;
    }

    if (contractType == 3) {
      this.validationController.addObject(this.contractVo, warehouseIdRules);
    } else {
      this.validationController.removeObject(this.contractVo);
    }
    this.customerDatasource.read();
  }


  async save() {
    await this.datasource.sync();

    let { valid } = await this.validationController.validate();
    if (!valid) return;
    let rateList = this.baseRateAndSteps
      .filter(x => x.customerCategory == this.contract.contractType);
    rateList.forEach(r => {
      let id = r.id;
      let rateSteps = this.baseRateStep.filter(res => res.rateId == id);
      r.rateStep = rateSteps;

    });
    this.contractVo.rateVos = rateList;
    // this.contractVo.contract.customerName = this.customerInfo.text();
    this.contract.customerName = this.customerInfo.text();
    this.contractVo.contract = this.contract;
    try {
      await this.contractService.saveContract(this.contractVo);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  updateProp(item, property) {
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  cancel() {
    this.router.navigateToRoute("list");
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
  .satisfies(x => !x || (x <= 1000000000000000 && x >= 0))
  .withMessage(`\${$displayName} 为无效值(过大或过小)`)
  //.maxLength(17).withMessage(`\${$displayName} 过长`)

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
