import { inject } from "aurelia-dependency-injection";
import { WorkOrderItemService, WorkOrderService } from "@app/instock/services/work-order";
import { DataSourceFactory } from "@app/utils";

export class ViewWorkOrder {

  datasource: kendo.data.DataSource;
  id;

  constructor(@inject private workOrderItemService: WorkOrderItemService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private workOrderService: WorkOrderService) {
    this.datasource = this.dataSourceFactory.create({
      query: () => this.workOrderService.queryWorkOrdersByCargo({ businessId: this.id }),
      pageSize: 10
    });
  }

  activate(params) {
    this.id = params.id;
    this.datasource.read();
  }


  detailInit(e) {
    let detailRow = e.detailRow;

    detailRow.find('.workOrderItems').kendoGrid({
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
        { field: 'workName', title: '作业内容' },
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