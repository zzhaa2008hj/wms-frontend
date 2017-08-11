import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { ChargeAuditList } from '@app/fee/models/charge-audit';
import { ChargeAuditListService } from '@app/fee/services/charge-audit';
import { ConstantValues } from "@app/common/models/constant-values";
import * as moment from 'moment';

@autoinject
export class ChargeAuditListView {
  chargeAuditList = {} as ChargeAuditList;
  dataSourceChargeAuditItem = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.chargeAuditList.chargeAuditItems);
      }
    }
  });
  constructor(private router: Router,
              private dictionaryDataService: DictionaryDataService,
              private chargeAuditListService: ChargeAuditListService) {
  }

  /**
   * 路由跳转执行
   */
  async activate({ id }) {
    let units = await this.dictionaryDataService.getDictionaryDatas("unit");
    let containerTypes = await this.dictionaryDataService.getDictionaryDatas("containerType");
    this.chargeAuditList = await this.chargeAuditListService.getChargeAuditListAndItems(id);
    this.chargeAuditList.paymentDateStr = this.chargeAuditList.paymentDate == null ? '' : moment(this.chargeAuditList.paymentDate).format("YYYY-MM-DD hh:mm:ss");

    this.chargeAuditList.chargeAuditItems.map(item => {
      let unit = units.find(r => r.dictDataCode == item.unit);
      if (unit) {
        item.unitStr = unit.dictDataName;
      }
      let containerType = containerTypes.find(r => r.dictDataCode == item.containerType);
      if (containerType) {
        item.containerTypeStr = containerType.dictDataName;
      }
      if (item.startDate) {
        item.startDate = new Date(item.startDate);
      }
      if (item.endDate) {
        item.endDate = new Date(item.endDate);
      }
      let rateType = ConstantValues.WorkInfoCategory.find(r => r.value == item.rateType);
      if (rateType) {
        item.rateTypeName = rateType.text;
      }
      let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == item.chargeCategory);
      if (chargeCategory) {
        item.chargeCategoryName = chargeCategory.text;
      }
      return item;
    });
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
