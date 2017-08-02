import { autoinject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { UploadDemo } from "@app/dev/upload";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditListService } from "@app/fee/services/charge-audit";
import { ChargeInfoService } from "@app/fee/services/charge";

@autoinject
export class CustomerConfirm {
  disabled: boolean = false;
  chargeInfo: ChargeInfo;
  chargeAuditLists: ChargeAuditList[];

  constructor(private chargeInfoService: ChargeInfoService,
              private chargeAuditListService: ChargeAuditListService,
              private dialogService: DialogService,
              private router: Router) {
  }

  async activate(params) {
    this.chargeInfo = await this.chargeInfoService.getById(params.id);
    this.chargeAuditLists = await this.chargeAuditListService.getByChargeInfoId(params.id);
    let totalReceivableAmount = 0;
    let totalReceivedAmount = 0;
    this.chargeAuditLists.forEach(cal => {
      totalReceivableAmount += cal.receivableAmount;
      if (cal.receivedAmount) totalReceivedAmount += cal.receivedAmount;
    });
    this.chargeInfo.totalReceivableAmount = totalReceivableAmount;
    this.chargeInfo.totalReceivedAmount = totalReceivedAmount;
  }

// 打印对账单
  async print() {
    await this.dialogService.alert({ title: "提示", message: "打印成功！" });
  }


  async customerConfirm() {
    //上传客户确认信息
    let result = await this.dialogService.open({ viewModel: UploadDemo, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;

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