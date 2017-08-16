import { Router } from "aurelia-router";
import { inject, newInstance } from 'aurelia-dependency-injection';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { Organization } from '@app/base/models/organization';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { ChargeInfo } from '@app/fee/models/charge';
import { ChargeAuditListService } from "@app/fee/services/charge-audit";
import { ConstantValues } from "@app/common/models/constant-values";
import { DialogService } from "ui";
import { auditListValidationRules, ChargeAuditList } from '@app/fee/models/charge-audit';
import { ChargeInfoService } from "@app/fee/services/charge";
import * as moment from 'moment';

export class NewChargeInfo {
  disabled: boolean = false;
  agents: Organization[];
  agentWidget: any;
  customers: Organization[];
  customerWidget: any;
  chargeInfo = {} as ChargeInfo;

  workInfoCategorys = ConstantValues.WorkInfoCategory;
  chargeCategorys = ConstantValues.ChargeCategory;

  chargeAuditDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.chargeInfo);
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
          batchNumber: { validation: { required: true }},
          billLadingNumber: { validation: { required: true }},
          warehousingAmount: { type: 'number'},
          loadingAmount: { type: 'number' },
          otherAmount: { type: 'number'},
          sumAmount: { type: 'number', editable: false }
        }
      }
    }
  });

  startDatePicker: any;
  endDatePicker: any;

  batchNumbers = new kendo.data.HierarchicalDataSource({
    data: []
  });

  constructor(@inject private router: Router,
              @inject private cargoInfoService: CargoInfoService,
              @newInstance() private validationController: ValidationController,
              @inject private chargeAuditListService: ChargeAuditListService,
              @inject private dialogService: DialogService,
              @inject private chargeInfoService: ChargeInfoService,) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate() {
    this.validationController.addObject(this.chargeInfo, validationRules);

    //仓储代理商
    this.agents = await this.cargoInfoService.getCustomers(1);
    //仓储客户
    this.customers = await this.cargoInfoService.getCustomers(1);
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
  }

  async batchNumberChange(itemLine) {
    let cargoInfo = await this.cargoInfoService.getByBatchNumber(itemLine.batchNumber);
    itemLine.billLadingNumber = cargoInfo.billLadingNumber;
  }

  validateProperty(propertyName: string) {
    this.validationController.validate({ object: this.chargeInfo, propertyName });
  }
  cancel() {
    this.router.navigateToRoute("list");
  }

  /**
   * 保存
   */
  async save() {
    let chargeAuditList: ChargeAuditList[] = [];
    Object.assign(chargeAuditList, this.chargeAuditDataSource.data());
    if (chargeAuditList) {
      for (let c of chargeAuditList) {
        this.validationController.addObject(c, auditListValidationRules);
        let { valid } = await this.validationController.validate();
        if (!valid) return;
        c.sumAmount = c.loadingAmount + c.otherAmount + c.warehousingAmount;
      }
      Object.assign(this.chargeInfo, { chargeAuditList: chargeAuditList });
    }
    if (this.chargeInfo.chargeAuditList.length == 0) {
      return this.dialogService.alert({ title: "提示", message: "请填写账单信息", icon: 'error' });
    }
    this.chargeInfo.chargeEndDate = moment(this.chargeInfo.chargeEndDate).hour(23).minute(59).second(59).toDate();
    console.log(this.chargeInfo);
    
    this.disabled = true;
    try {
      await this.chargeAuditListService.saveChargeInfoAndAuditList(this.chargeInfo);
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
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

}

const validationRules = ValidationRules
  .ensure((info: ChargeInfo) => info.agentId)
  .displayName('代理商名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.customerId)
  .displayName('客户名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.chargeStartDate)
  .displayName('开始时间')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.chargeEndDate)
  .displayName('结束时间')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;

