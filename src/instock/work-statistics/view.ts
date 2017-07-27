import { autoinject } from "aurelia-dependency-injection";
import { WorkOrder, WorkStatistics } from "@app/instock/models/work";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { ConstantValues } from '@app/common/models/constant-values';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import * as moment from 'moment';
import { Order } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";

@autoinject
export class ViewWorkStatistics {
  workStatistics: WorkStatistics;
  datasource: kendo.data.DataSource;
  listWorkOrders: WorkOrder[];
  cargoFlow: CargoFlow;
  categories = ConstantValues.BusinessTypes;
  outstockOrder: Order;

  units = [] as DictionaryData[];

  constructor(private workStatisticsService: WorkStatisticsService,
              private workOrderItemService: WorkOrderItemService,
              private cargoFlowService: CargoFlowService,
              private dictionaryDataService: DictionaryDataService,
              private orderService: OrderService) {

  }


  async activate({ id, workOrderCategory, businessId }) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.workStatistics = await this.workStatisticsService.getWorkStatisticsById(id);
    this.workStatistics.workOrderCategoryStr = this.categories
      .find(r => r.type == this.workStatistics.workOrderCategory).name;
    if (workOrderCategory == 1) {
      /*通过统计表的业务主键查询 流水信息*/
      this.cargoFlow = await this.cargoFlowService.getCargoFlowById(this.workStatistics.businessId);
      this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
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
    if (workOrderCategory == 2) {
      this.outstockOrder = await this.orderService.getOrderById(businessId);
      this.outstockOrder.outstockDateStr = moment(this.outstockOrder.outstockDate).format("YYYY-MM-DD");
      this.datasource = new kendo.data.DataSource({
        transport: {
          read: options => {
            this.workOrderItemService.getOutstockWorkDetails(this.outstockOrder.id)
              .then(res => {
                res.map(info => {
                  if (info.unit) {
                    info.unit = this.units.find(r => r.dictDataCode == info.unit).dictDataName;
                  }
                });
                options.success(res);
              })
              .catch(err => options.error("", "", err));
          }
        }
      });
    }
    if (this.workStatistics.unit) {
      this.workStatistics.unit = this.units.find(r => r.dictDataCode == this.workStatistics.unit).dictDataName;
    }
  }

  // formatCategory(category: number) {
  //   return this.categories.find(res => res.type == category).name;
  // }
}