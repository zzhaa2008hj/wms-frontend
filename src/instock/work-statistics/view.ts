import { autoinject } from "aurelia-dependency-injection";
import { WorkOrder, WorkStatistics } from "@app/instock/models/work";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkOrderItemService, WorkOrderService } from "@app/instock/services/work-order";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { ConstantValues } from '@app/common/models/constant-values';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { WorkOrderDetail } from '@app/instock/models/work'

@autoinject
export class ViewWorkStatistics {
  workStatistics: WorkStatistics;
  datasource: kendo.data.DataSource;
  listWorkOrders: WorkOrder[];
  cargoFlow: CargoFlow;
  categories = ConstantValues.BusinessTypes;

  units = [] as DictionaryData[];

  constructor(private workStatisticsService: WorkStatisticsService,
              private workOrderService: WorkOrderService,
              private workOrderItemService: WorkOrderItemService,
              private cargoFlowService: CargoFlowService,
              private dictionaryDataService: DictionaryDataService) {
    // this.datasource = new kendo.data.DataSource({
    //   transport: {
    //     read: (options) => {
    //       options.success(this.listWorkOrders);
    //     }
    //   },
    //   schema: {
    //     model: {
    //       id: 'id'
    //     }
    //   }
    // });
     
  }

  

  async activate({ id }) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.workStatistics = await this.workStatisticsService.getWorkStatisticsById(id);
    if(this.workStatistics.unit){
      this.workStatistics.unit = this.units.find(r => r.dictDataCode == this.workStatistics.unit).dictDataName;
    }
    /*通过统计表的业务主键查询 流水信息*/
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(this.workStatistics.businessId);

    this.datasource = new kendo.data.DataSource({
          transport: {
            read: options => {
              this.workOrderItemService.getWorkDetails(this.cargoFlow.id)
                .then(res =>{
                  res.map(e =>{
                    if(e.unit){
                      e.unit = this.units.find(r => r.dictDataCode == e.unit).dictDataName;
                    };
                  })
                  options.success(res);
                })
                .catch(err => options.error("", "", err));
            }
          }
      });
  }

  formatCategory(category: number) {
    return this.categories.find(res => res.type == category).name;
  }
}