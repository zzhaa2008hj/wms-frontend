import { autoinject } from "aurelia-dependency-injection";
import { InvoiceEntry } from "@app/fee/charge/invoice";
import { DialogService } from "ui";
import { ChargeInfoService, ChargeInfoCriteria } from "@app/fee/services/charge";
import { Audit } from "@app/fee/charge/audit/new";
import { DataSourceFactory } from '@app/utils';
import { ConstantValues } from "@app/common/models/constant-values";
import * as moment from 'moment';
import { ChargeAuditListService } from "@app/fee/services/charge-audit";

@autoinject
export class ChargeInfoList {
  dataSource: kendo.data.DataSource;
  chargeInfoCriteria: ChargeInfoCriteria;
  startDatePicker: any;
  endDatePicker: any;
  
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  constructor(private dialogService: DialogService,
              private chargeInfoService: ChargeInfoService,
              private dataSourceFactory: DataSourceFactory,
              private chargeAuditListService: ChargeAuditListService) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.chargeInfoService.pageChargeInfo(this.chargeInfoCriteria).map(res => {
        let stage = ConstantValues.ChargeStage.find(r => r.stage == res.stage);
        if (stage) {
          res.stageName = stage.title;
        }
        let lastStage = ConstantValues.ChargeStage.find(r => r.stage == res.lastStage);
        if (lastStage) {
          res.lastStageName = lastStage.title;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  /**
   * 费收2审核
   */
  async auditSecondFee(id) {
    let result = await this.dialogService.open({ viewModel: Audit, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.chargeInfoService.auditSecondFee(id, result.output);
      await this.dialogService.alert({ title: "提示", message: "审核通过！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 发票录入
   */
  async invoiceEntry(id: string) {
    let result = await this.dialogService.open({ viewModel: InvoiceEntry, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.chargeInfoService.issueChargeInvoice(id, result.output);
      await this.dialogService.alert({ title: "提示", message: "发票录入成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

  /**
   * 核销
   */
  async auditCancel(id: string) {
    try {
      let result = await this.dialogService.confirm({ title: "提示", message: "是否确定要核销当前结算需求！" });
      if (!result) return;
      await this.chargeInfoService.auditCancel(id);
      await this.dialogService.alert({ title: "提示", message: "核销成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
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

  select() {
    if (this.chargeInfoCriteria.beginDate) {
      this.chargeInfoCriteria.beginDate = moment(this.chargeInfoCriteria.beginDate).format("YYYY-MM-DD");
    }
    if (this.chargeInfoCriteria.endDate) {
      this.chargeInfoCriteria.endDate = moment(this.chargeInfoCriteria.endDate).format("YYYY-MM-DD");
    }
    this.dataSource.read();
  }

  reset() {
    this.chargeInfoCriteria = {} as ChargeInfoCriteria;
    this.dataSource.read();
  }

  /**
   * 生成对账清单
   */
  async createChargeAuditList(id: string) {
    try {
      await this.chargeAuditListService.createChargeAuditList(id);
      await this.dialogService.alert({ title: "提示", message: "生成对账清单成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
  }

}