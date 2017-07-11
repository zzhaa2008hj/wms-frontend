import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { WorkOderItemService, WorkOrderService } from "@app/instock/services/work-order";
import { DialogService } from "ui";
import { NewWorkOrderItem } from "@app/base/work-order/new-item";
import { RouterParams } from '@app/common/models/router-params';
export class WorkOrders {
  dataSource: kendo.data.DataSource;
  test: kendo.ui.Grid;

  constructor(@inject('routerParams') private routerParams: RouterParams,
              @inject private workOrderService: WorkOrderService,
              @inject private workOrderItemService: WorkOderItemService,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.workOrderService.queryWorkOders({ businessId: this.routerParams.businessId }),
      pageSize: 10
    });   
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.workItems').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            this.workOrderItemService.getWorkOrderItems(e.data.id)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        },
        filter: { field: 'workOrderId', operator: 'eq', value: e.data.id }
      },
      columns: [
        { field: 'workName', title: '作业过程名称' },
        { field: 'quantity', title: '数量' },
        { field: 'number', title: '件数' },
        { field: 'unit', title: '计量单位' },
        { field: 'containerType', title: '集装箱类型' },
        { field: 'containerNumber', title: '集装箱号' },
        { field: 'customerName', title: '作业单位名称' },
        { field: 'warehouseName', title: '库区名称' }
      ]
    });
  }

  /* async add() {
   let data = this.cargoFlow;
   let res = await this.dialogService.open({ viewModel: NewWorkOrder, model: data, lock: true }).whenClosed();
   if (res.wasCancelled) return;
   try {
   await this.workOrderService.saveWorkOrder(res.output);
   await this.dialogService.alert({ title: "新增成功", message: "新增成功!" });
   this.dataSource.read();
   } catch (err) {
   await this.dialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
   }
   }*/

  async addItem(id: string, e) {
    let res = await this.dialogService.open({
      viewModel: NewWorkOrderItem,
      model: { batchNumber: this.cargoFlow.batchNumber, workOrderId: id, businessId: e.businessId },
      lock: true
    }).whenClosed();
    if (res.wasCancelled) return;
    try {
      await this.workOrderItemService.saveWorkOrderItem(res.output);
      await this.dialogService.alert({ title: "新增成功", message: "新增成功!" });

      let child = this.test.element.find(`[data-uid='${e.uid}']`).next().find(".k-grid").eq(0);
      if (child.data("kendoGrid")) {
        child.data("kendoGrid").dataSource.read();
      }
    } catch (err) {
      await this.dialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }
}