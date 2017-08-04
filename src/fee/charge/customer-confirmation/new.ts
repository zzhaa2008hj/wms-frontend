import { autoinject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditListService } from "@app/fee/services/charge-audit";
import { ChargeInfoService } from "@app/fee/services/charge";
import { Organization } from "@app/base/models/organization";
import { OrganizationService } from "@app/base/services/organization";
import * as moment from 'moment';
import { NewUpload } from "@app/fee/charge/customer-confirmation/upload";

@autoinject
export class CustomerConfirm {
  disabled: boolean = true;
  chargeInfo: ChargeInfo;
  chargeAuditLists: ChargeAuditList[];
  organization: Organization;

  constructor(private chargeInfoService: ChargeInfoService,
              private chargeAuditListService: ChargeAuditListService,
              private organizationService: OrganizationService,
              private dialogService: DialogService,
              private router: Router) {
  }

  async activate(params) {
    this.chargeInfo = await this.chargeInfoService.getById(params.id);
    this.chargeAuditLists = await this.chargeAuditListService.getListByChargeInfoId(params.id);
    this.organization = await this.organizationService.getOrganization(this.chargeInfo.orgId);

    this.chargeInfo.chargeStartDateStr = moment(this.chargeInfo.chargeStartDate).format("YYYY-MM-DD");
    this.chargeInfo.chargeEndDateStr = moment(this.chargeInfo.chargeEndDate).format("YYYY-MM-DD");

    if (this.chargeAuditLists) {
      for (let i in this.chargeAuditLists) {
        this.chargeAuditLists[i].index = parseInt(i) + 1;
      }

      let totalReceivableAmount = 0;
      let totalReceivedAmount = 0;
      this.chargeAuditLists.forEach(cal => {
        totalReceivableAmount += cal.receivableAmount;
        if (cal.receivedAmount) totalReceivedAmount += cal.receivedAmount;
      });
      this.chargeInfo.totalReceivableAmount = totalReceivableAmount;
      this.chargeInfo.totalReceivedAmount = totalReceivedAmount;
    }
  }

  // 打印对账单
  async print() {
    await this.dialogService.alert({ title: "提示", message: "打印成功！" });
  }

  //上传客户确认信息
  async newUpdate() {
    let result = await this.dialogService.open({ viewModel: NewUpload, model: this.chargeInfo.id, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    this.disabled = false;
  }

  async customerConfirm() {
    this.disabled = true;
    try {
      await this.chargeInfoService.customerConfirm(this.chargeInfo.id);
      await this.dialogService.alert({ title: "提示", message: "客户确认成功！" });
      this.router.navigateToRoute('list');
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute('list');
  }
}