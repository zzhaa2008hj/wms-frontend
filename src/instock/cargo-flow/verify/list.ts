import { inject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkStatistics } from "@app/instock/models/work";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { Router } from "aurelia-router";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { ConstantValues } from "@app/common/models/constant-values";
import * as moment from 'moment';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class VerifyWarehouse {
  datasource: kendo.data.DataSource;
  workStatistics = {} as WorkStatistics;

  status: any[] = ConstantValues.WorkInfoCategory;
  units = [] as DictionaryData[];

  constructor(@inject private cargoFlowService: CargoFlowService,
              @inject private workStatisticsService: WorkStatisticsService,
              @inject private router: Router,
              @inject("cargoFlow") private cargoFlow: CargoFlow,
              @inject private workOrderItemService: WorkOrderItemService,
              @inject private dictionaryDataService: DictionaryDataService) {
    // this.datasource = this.dataSourceFactory.create({
    //   query: () => this.cargoItemService.queryCargoItems({ flowId: this.cargoFlow.id }),
    //   pageSize: 10
    // });""
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: options => {
          this.workOrderItemService.getWorkDetails(this.cargoFlow.id)
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

    this.workStatistics = await this.workStatisticsService.getStatistics(this.cargoFlow.id);
    this.workStatistics.batchNumber = this.cargoFlow.batchNumber;
    this.workStatistics.unit = this.cargoFlow.unit;
    this.workStatistics.workOrderCategory = this.cargoFlow.status;
    this.workStatistics.businessId = this.cargoFlow.id;

    this.cargoFlow.statusStr = this.status.find(r => r.value == this.cargoFlow.status).text;
    this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
    this.cargoFlow.unitStr = this.units.find(r => r.dictDataCode == this.cargoFlow.unit).dictDataName;
  }

  async check(params) {
    if (params == 1) {
      await this.workStatisticsService.saveStatistics(this.workStatistics);
    }
    await this.cargoFlowService.audit(this.cargoFlow.id, params);
    this.router.navigateBack();
  }

}