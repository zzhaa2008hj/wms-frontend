import { autoinject } from "aurelia-dependency-injection";
import { ChargeAuditItemService, ChargeAuditListService } from "@app/fee/services/charge-audit";
import { OrganizationService } from "@app/base/services/organization";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { Organization } from "@app/base/models/organization";
import { ChargeInfoService } from "@app/fee/services/charge";
import { DialogService } from "ui";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import * as moment from 'moment';

@autoinject
export class Note {
  chargeInfo: ChargeInfo;
  chargeAuditLists: ChargeAuditList[];
  organization: Organization;
  units = [] as DictionaryData[];

  constructor(private chargeInfoService: ChargeInfoService,
              private chargeAuditListService: ChargeAuditListService,
              private chargeAuditItemService: ChargeAuditItemService,
              private dictionaryDataService: DictionaryDataService,
              private dialogService: DialogService,
              private organizationService: OrganizationService) {
  }

  async activate(params) {
    this.chargeInfo = await this.chargeInfoService.getById(params.id);
    this.chargeAuditLists = await this.chargeAuditListService.getListByChargeInfoId(params.id);
    this.organization = await this.organizationService.getOrganization(this.chargeInfo.orgId);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.chargeInfo.chargeStartDateStr = moment(this.chargeInfo.chargeStartDate).format("YYYY-MM-DD");
    this.chargeInfo.chargeEndDateStr = moment(this.chargeInfo.chargeEndDate).format("YYYY-MM-DD");

    if (this.chargeAuditLists) {
      for (let i in this.chargeAuditLists) {
        let cal = this.chargeAuditLists[i];
        cal.index = parseInt(i) + 1;
        cal.chargeAuditItems = await this.chargeAuditItemService.getListByChargeAuditId(cal.id);
        if (cal.chargeAuditItems) {
          cal.chargeAuditItems.map(cai => {
            cai.unitStr = this.units.find(r => r.dictDataCode == cai.unit).dictDataName;
            cai.startDateStr = moment(cai.startDate).format("YYYY-MM-DD");
            cai.endDateStr = moment(cai.endDate).format("YYYY-MM-DD");
          });
        }
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
    console.log(this.chargeAuditLists);
  }

  async print() {
    await this.dialogService.alert({ title: "提示", message: "打印成功！" });
  }

}