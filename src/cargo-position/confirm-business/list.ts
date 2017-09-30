import { inject } from "aurelia-dependency-injection";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkStatistics } from "@app/instock/models/work";
import { Router } from "aurelia-router";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { ConstantValues } from "@app/common/models/constant-values";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";

export class VerifyWarehouse {
  datasource: kendo.data.DataSource;
  workStatistics = {} as WorkStatistics;

  status: any[] = ConstantValues.WorkInfoCategory;
  units = [] as DictionaryData[];

  constructor(@inject private workStatisticsService: WorkStatisticsService,
              @inject private router: Router,
              @inject("positionTransferInfo") private positionTransferInfo: PositionTransferInfo,
              @inject private workOrderItemService: WorkOrderItemService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private positionTransferInfoService: PositionTransferInfoService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: options => {
          this.workOrderItemService.getTransferWorkDetails(this.positionTransferInfo.id)
            .then(res => {
              res.map(e => {
                if (e.unit) {
                  e.unit = this.units.find(r => r.dictDataCode == e.unit).dictDataName;
                }
              });
              options.success(res);
            })
            .catch(err => options.error("", "", err));
        }
      }
    });

  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.workStatistics = await this.workStatisticsService.getTransferStatistics(this.positionTransferInfo.id);
    this.workStatistics.batchNumber = this.positionTransferInfo.batchNumber;
    //this.workStatistics.unit = this.positionTransferInfo.unit;
    this.workStatistics.workOrderCategory = 4;
    this.workStatistics.businessId = this.positionTransferInfo.id;
  }

  async check(params) {
    if (params == 1) {
      await this.workStatisticsService.saveStatistics(this.workStatistics);
    }
    await this.positionTransferInfoService.updateBusinessConfirm(this.positionTransferInfo.id, params);
    this.router.navigateBack();
  }

  goBack() {
    this.router.navigateBack();
  }
}