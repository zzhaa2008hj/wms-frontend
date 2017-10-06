import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { Router } from "aurelia-router";
import {
  PositionTransferInfo, PositionTransferItem
} from "@app/cargo-position/models/transfer-info";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { inject } from "aurelia-dependency-injection";

export class PositionTransferInfoDetail {
  positionTransferInfo = {} as PositionTransferInfo;
  dataSourceStorage = new kendo.data.HierarchicalDataSource({
    data: []
  });
  positionTransferItems: PositionTransferItem[];
  units = [] as DictionaryData[];

  constructor(@inject private router: Router,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private positionTransferInfoService: PositionTransferInfoService) {
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.positionTransferInfo = await this.positionTransferInfoService.getInfoById(params.id);
    this.positionTransferItems = this.positionTransferInfo.positionTransferItems;
    this.positionTransferItems.forEach(pti => {
      let unit = this.units.find(u => pti.unit == u.dictDataCode);
      if (unit) {
        pti.unitName = unit.dictDataName;
      }
      if (pti.cargoRates) {
        pti.cargoRates.forEach(cr => {
          let rateUnit = this.units.find(u => cr.unit == u.dictDataCode);
          if (rateUnit) {
            cr.unitStr = rateUnit.dictDataName;
          }
          if (cr.cargoRateSteps) {
            cr.cargoRateSteps.forEach(crs => {
              let stepUunit = this.units.find(u => crs.stepUnit == u.dictDataCode);
              if (stepUunit) {
                crs.stepUnitStr = stepUunit.dictDataName;
              }
            });
          }
        });
      }

    });
    this.dataSourceStorage.data(this.positionTransferItems);
  }


  cancel() {
    this.router.navigateToRoute("list");
  }
}