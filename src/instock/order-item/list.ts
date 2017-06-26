import { autoinject } from "aurelia-dependency-injection";
import { HeapInfoService, OrderItemService } from "@app/instock/services/order-item";
import { DataSourceFactory } from "@app/utils";

@autoinject
export class OrderItemList {
  batchNumber: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private orderItemService: OrderItemService,
              private heapInfoService: HeapInfoService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orderItemService.queryOrderItems({ batchNumber: this.batchNumber }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            this.heapInfoService.listHeapInfoes(e.data.id)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        },
        filter: { field: 'instockOrderItemId', operator: 'eq', value: e.data.id }
      },
      columns: [
        { field: 'instockDate', title: '入库时间', format : "{0:yyyy-MM-dd}" },
        { field: 'warehouseName', title: '库区名称' },
        { field: 'storageQuantity', title: '堆存数量' },
        { field: 'storageNumber', title: '堆存件数' },
        { field: 'containerNumber', title: '集装箱号' },
        { field: 'unit', title: '计量单位' }
      ]
    });
  }
}