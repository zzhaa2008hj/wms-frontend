import { inject, Container } from 'aurelia-dependency-injection';
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from "@app/base/models/cargo-info";
import { Router } from "aurelia-router";
import {
  PositionTransferInfo, positionTransferInfoValidationRules, PositionTransferItem,
} from "@app/cargo-position/models/transfer-info";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentService } from "@app/common/services/attachment";
import { DialogService, MessageDialogService } from "ui";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { uuid } from "@app/utils";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { CargoItemStorageInfoVo } from "@app/outstock/models/cargo-distrain";
import { WarehouseTree } from "@app/base/storage/items/warehouse-tree";
import { EditRate } from "@app/cargo-position/info/edit-rate";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

export class NewPositionTransferInfo {
  positionTransferInfo = {} as PositionTransferInfo;
  dataSourceStorage = new kendo.data.HierarchicalDataSource({
    data: []
  });
  positionTransferItems: PositionTransferItem[];
  units = [] as DictionaryData[];
  private cargoRates: any;

  constructor(@inject private router: Router,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private positionTransferInfoService: PositionTransferInfoService) {
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.positionTransferInfo = await this.positionTransferInfoService.getById(params.id);
    this.positionTransferItems = this.positionTransferInfo.positionTransferItems;
    this.positionTransferItems.forEach(pti => {
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
    this.dataSourceStorage.data(this.positionTransferItems);
  }


  cancel() {
    this.router.navigateToRoute("list");
  }
}