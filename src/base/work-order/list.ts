import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { WorkOrderService } from "@app/instock/services/work-order";
import { DialogService, MessageDialogService } from "ui";
import { VeiwWorkItem } from "@app/base/work-order/view";
import { RouterParams } from '@app/common/models/router-params';
import { ConstantValues } from '@app/common/models/constant-values';

export class WorkOrders {
  dataSource: kendo.data.DataSource;
  type: number;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  wrokCategories = ConstantValues.WorkInfoCategory;

  constructor(@inject('routerParams') private routerParams: RouterParams,
              @inject private workOrderService: WorkOrderService,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private messageDialogService: MessageDialogService) {
  }

  async activate() {
    this.type = this.routerParams.type;
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.workOrderService.queryWorkOders({
        businessId: this.routerParams.businessId,
        type: this.routerParams.type
      }).map(res => {
        res.workOrderCategoryName = this.wrokCategories.find(r => r.value == res.workOrderCategory).text;
        return res;
      }),
      pageSize: 10
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

  // async addItem(id: string, e) {
  //   let res = await this.dialogService.open({
  //     viewModel: NewWorkOrderItem,
  //     model: { batchNumber: e.batchNumber, workOrderId: id, businessId: e.businessId ,type: this.type},
  //     lock: true
  //   }).whenClosed();
  //   if (res.wasCancelled) return;
  //   try {
  //     await this.workOrderItemService.saveWorkOrderItem(res.output);
  //     await this.dialogService.alert({ title: "新增成功", message: "新增成功!" });

  //     let child = this.test.element.find(`[data-uid='${e.uid}']`).next().find(".k-grid").eq(0);
  //     if (child.data("kendoGrid")) {
  //       child.data("kendoGrid").dataSource.read();
  //     }
  //   } catch (err) {
  //     await this.dialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
  //   }
  // }

  view(id: string) {
    this.dialogService.open({
      viewModel: VeiwWorkItem,
      model: { id: id },
      lock: true
    });
  }

  async remove(id: string) {
    let confirmed = await this.messageDialogService.confirm({ title: "删除", message: "删除后不可恢复" });
    if (confirmed) {
      try {
        await this.workOrderService.removeWorkOrder(id);
        await this.messageDialogService.confirm({ title: "删除", message: "删除成功" });
        this.dataSource.read();
      } catch (e) {
        await this.messageDialogService.alert({ title: "错误", message: e.message, icon: "error" });
      }
    }
  }

}