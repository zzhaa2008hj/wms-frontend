import { autoinject } from "aurelia-dependency-injection";
import { WorkOrder, WorkStatistics } from "@app/instock/models/work";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkOderItemService, WorkOrderService } from "@app/instock/services/work-order";

@autoinject
export class ViewWorkStatistics {
  workStatistics: WorkStatistics;
  datasource: kendo.data.DataSource;
  listWorkOrders: WorkOrder[];

  constructor(private workStatisticsService: WorkStatisticsService,
              private workOrderService: WorkOrderService,
              private workOrderItemService: WorkOderItemService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.listWorkOrders);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
  }

  async activate({ id }) {
    this.workStatistics = await this.workStatisticsService.getWorkStatisticsById(id);
    console.log(this.workStatistics.businessId);
    this.listWorkOrders = await this.workOrderService.getWorkOders(this.workStatistics.businessId);
    /*通过统计表的业务主键查询 流水信息*/
  }

  detailInit(e) {
    let detailRow = e.detailRow;

    detailRow.find('.workOrderItem').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            this.workOrderItemService.getWorkOrderItems(e.data.id)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        }
      },
      columns: [
        { field: 'workName', title: '作业内容1' },
        { field: 'containerType', title: '集装箱类型' },
        { field: 'containerNumber', title: '集装箱号' },
        { field: 'quantity', title: '数量' },
        { field: 'number', title: '件数' },
        { field: 'unit', title: '单位' },
        { field: 'warehouseName', title: '库区名称' },
        { field: 'customerName', title: '作业单位名称' },
      ]
    });
  }
}