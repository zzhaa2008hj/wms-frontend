import { Router } from "aurelia-router";
import { inject } from 'aurelia-dependency-injection';
import { ChargeInfo } from '@app/fee/models/charge';
import { ChargeInfoService } from "@app/fee/services/charge";
import { ConstantValues } from "@app/common/models/constant-values";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

export class ViewChargeInfo {
  chargeInfo = {} as ChargeInfo;

  chargeItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.chargeInfo.chargeAuditItemList);
      }
    }
  });
  units = [] as DictionaryData[];

  constructor(@inject private router: Router,
              @inject private chargeInfoService: ChargeInfoService,
              @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate({id}) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.chargeInfo = await this.chargeInfoService.getChargeInfoAndItems(id);
    if (this.chargeInfo && this.chargeInfo.chargeAuditItemList && this.chargeInfo.chargeAuditItemList.length > 0) {
      this.chargeInfo.chargeAuditItemList.map(item => {
        item.startDate = new Date(item.startDate);
        item.endDate = new Date(item.endDate);
        let unit = this.units.find(r => r.dictDataCode == item.unit);
        if (unit) {
          item.unitStr = unit.dictDataName;
        }
        let rateType = ConstantValues.WorkInfoCategory.find(r => r.value == item.rateType);
        if (rateType) {
          item.rateTypeName = rateType.text;
        }
        let chargeCategory = ConstantValues.ChargeCategory.find(r => r.value == item.chargeCategory);
        if (chargeCategory) {
          item.chargeCategoryName = chargeCategory.text;
        }
        if (item.cargoRateStepList && item.cargoRateStepList.length > 0) {
          item.cargoRateStepList.map(rate => {
            let unit = this.units.find(r => r.dictDataCode == rate.stepUnit);
            if (unit) {
              rate.stepUnitName = unit.dictDataName;
            }
          });
        }
      });
    }
  }
  cancel() {
    this.router.navigateToRoute("list");
  }

}
