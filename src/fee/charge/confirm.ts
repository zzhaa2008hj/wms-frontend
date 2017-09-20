import { autoinject } from "aurelia-dependency-injection";
import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditItemService, ChargeAuditListService } from "@app/fee/services/charge-audit";
import { ChargeInfoService } from "@app/fee/services/charge";
import { Organization } from "@app/base/models/organization";
import { OrganizationService } from "@app/base/services/organization";
import * as moment from "moment";
import { NewUpload } from "@app/fee/charge/upload";
import { addHeader, print } from "@app/common/services/print-tool";
import { ConstantValues } from "@app/common/models/constant-values";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";
import { exportPDF } from '@app/utils';
@autoinject
export class CustomerConfirm {
  disabled: boolean = true;
  chargeInfo: ChargeInfo;
  chargeAuditLists: ChargeAuditList[];
  organization: Organization;
  units = [] as DictionaryData[];

  constructor(private chargeInfoService: ChargeInfoService,
              private chargeAuditListService: ChargeAuditListService,
              private chargeAuditItemService: ChargeAuditItemService,
              private dictionaryDataService: DictionaryDataService,
              private organizationService: OrganizationService,
              private dialogService: DialogService,
              private router: Router) {
  }

  async activate(params) {
    this.chargeInfo = await this.chargeInfoService.getById(params.id);
    this.chargeAuditLists = await this.chargeAuditListService.getListByChargeInfoId(params.id);
    this.organization = await this.organizationService.getOrganization(this.chargeInfo.orgId);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.chargeInfo.chargeStartDateStr = this.chargeInfo.chargeStartDate ? moment(this.chargeInfo.chargeStartDate).format("YYYY-MM-DD") : '';
    this.chargeInfo.chargeEndDateStr = this.chargeInfo.chargeEndDate ? moment(this.chargeInfo.chargeEndDate)
      .format("YYYY-MM-DD") : '';
    this.chargeInfo.createTimeStr = moment(this.chargeInfo.createTime).format("YYYY-MM-DD");

    let containerTypes = await this.dictionaryDataService.getDictionaryDatas("containerType");

    if (this.chargeAuditLists) {
      let totalAmount = 0, warehousingAmounts = 0, loadingAmounts = 0, otherAmounts = 0;
      this.chargeAuditLists.forEach(cal => {
        totalAmount += cal.sumAmount;
        warehousingAmounts += cal.warehousingAmount;
        loadingAmounts += cal.loadingAmount;
        otherAmounts += cal.otherAmount;
        Object.assign(cal, { index: this.chargeAuditLists.indexOf(cal) + 1 });
      });
      Object.assign(this.chargeInfo, { totalAmount, warehousingAmounts, loadingAmounts, otherAmounts});
      for (let cal of this.chargeAuditLists) {
        cal.chargeAuditItems = await this.chargeAuditItemService.getListByChargeAuditId(cal.id);
        if (cal.chargeAuditItems.length <= 0) {
        } else {
          cal.chargeAuditItems.map(cai => {
            let unit = this.units.find(r => r.dictDataCode == cai.unit);
            if (unit) {
              cai.unitStr = unit.dictDataName;
            }
            cai.startDateStr = cai.startDate ? moment(cai.startDate).format("YYYY-MM-DD") : '';
            cai.endDateStr = cai.startDate ? moment(cai.endDate).format("YYYY-MM-DD") : '';

            let containerType = containerTypes.find(r => r.dictDataCode == cai.containerType);
            if (containerType) {
              cai.containerTypeStr = containerType.dictDataName;
            }
            let rateType = ConstantValues.WorkInfoCategory.find(r => r.value == cai.rateType);
            if (rateType) {
              cai.rateTypeName = rateType.text;
            }
            let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == cai.chargeCategory);
            if (chargeCategory) {
              cai.chargeCategoryName = chargeCategory.text;
            }

          });
        }
      }
    }
  }

  // 打印对账单
  async printTotal() {
    let title = "对账单统计";
    let strHTML = $("#total").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
    //await this.dialogService.alert({ title: "提示", message: "打印成功！" });
  }

  printDetail() {
    let title = "对账单明细";
    let strHTML = $("#detail").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
    //await this.dialogService.alert({ title: "提示", message: "打印成功！" });
  }

  exportTotal() {
    exportPDF('total', '对账清单统计');
  }

  exportDetail() {
    exportPDF('detail', '对账清单明细');
  } 

  async customerConfirm(num: number) {
    this.disabled = true;
    try {
      if (num == 0) {
        await this.chargeInfoService.customerConfirm(this.chargeInfo.id, 2, []);
      }
      if (num == 1) {
        //上传客户确认信息
        let result = await this.dialogService.open({ viewModel: NewUpload, model: this.chargeInfo.id, lock: true })
          .whenClosed();
        if (result.wasCancelled) return;

        await this.chargeInfoService.customerConfirm(this.chargeInfo.id, 3, result.output);
      }
      await this.dialogService.alert({ title: "提示", message: "操作成功！" });
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