import { autoinject } from "aurelia-dependency-injection";
import { OrganizationService } from "@app/base/services/organization";
import { ChargeInfo } from "@app/fee/models/charge";
import { ChargeAuditList } from "@app/fee/models/charge-audit";
import { Organization } from "@app/base/models/organization";
import { ChargeInfoService } from "@app/fee/services/charge";
import * as moment from 'moment';
import { addHeader, print } from "@app/common/services/print-tool";
import { ChargeAuditListService } from "@app/fee/services/charge-audit";

@autoinject
export class Note {
  chargeInfo: ChargeInfo;
  chargeAuditLists: ChargeAuditList[];
  organization: Organization;

  constructor(private chargeInfoService: ChargeInfoService,
              private chargeAuditListService: ChargeAuditListService,
              private organizationService: OrganizationService) {
  }

  async activate(params) {
    this.chargeInfo = await this.chargeInfoService.getById(params.id);
    this.chargeAuditLists = await this.chargeAuditListService.getListByChargeInfoId(params.id);
    this.organization = await this.organizationService.getOrganization(this.chargeInfo.orgId);

    this.chargeInfo.chargeStartDateStr = this.chargeInfo.chargeStartDate ? moment(this.chargeInfo.chargeStartDate).format("YYYY-MM-DD") : '';
    this.chargeInfo.chargeEndDateStr = this.chargeInfo.chargeEndDate ? moment(this.chargeInfo.chargeEndDate).format("YYYY-MM-DD") : '';

    if (this.chargeAuditLists) {
      let totalAmount = 0;
      this.chargeAuditLists.forEach(cal => {
        totalAmount += cal.sumAmount;
        Object.assign(cal, { index: this.chargeAuditLists.indexOf(cal) + 1 });
      });
      Object.assign(this.chargeInfo, { totalAmount: totalAmount });
    }
  }

  printNote() {
    let title = "收费单";
    let strHTML = $("#note").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }

}