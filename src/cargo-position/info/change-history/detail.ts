import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from 'ui';
import { ChangeHistory } from '@app/common/models/change-history';
import { DictionaryData } from '@app/base/models/dictionary';
import { PositionTransferInfo, PositionTransferItem } from "@app/cargo-position/models/transfer-info";
import { DictionaryDataService } from "@app/base/services/dictionary";

@autoinject
export class PositionTransferChangeHistoryDetail {

  units = [] as DictionaryData[];
  warehouseTypes = [] as DictionaryData[];
  oldPositionTransferInfo: PositionTransferInfo;
  newPositionTransferInfo: PositionTransferInfo;
  oldPositionTransferItems: PositionTransferItem[];
  newPositionTransferItems: PositionTransferItem[];

  constructor(private dialogController: DialogController,
               private dictionaryDataService: DictionaryDataService) {
  }

  async activate(changeHistory: ChangeHistory<PositionTransferInfo>) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.oldPositionTransferInfo = changeHistory.oldObj;
    this.newPositionTransferInfo = changeHistory.newObj;
    this.oldPositionTransferItems = this.oldPositionTransferInfo.positionTransferItems;
    this.newPositionTransferItems = this.newPositionTransferInfo.positionTransferItems;

    this.oldPositionTransferItems.forEach(pti => {
      let unit = this.units.find(u => pti.unit == u.dictDataCode);
      if (unit) {
        pti.unitName = unit.dictDataName;
      }
      if (pti.cargoRates) {
        pti.cargoRates.forEach(cr => {
          let rateUunit = this.units.find(u => cr.unit == u.dictDataCode);
          if (rateUunit) {
            cr.unitStr = rateUunit.dictDataName;
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
    this.newPositionTransferItems.forEach(pti => {
      let unit = this.units.find(u => pti.unit == u.dictDataCode);
      if (unit) {
        pti.unitName = unit.dictDataName;
      }
      if (pti.cargoRates) {
        pti.cargoRates.forEach(cr => {
          let rateUunit = this.units.find(u => cr.unit == u.dictDataCode);
          if (rateUunit) {
            cr.unitStr = rateUunit.dictDataName;
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
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}