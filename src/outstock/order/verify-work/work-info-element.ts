import { DataSourceFactory } from "@app/utils";
import { observable, inject} from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { WorkOrderService } from "@app/instock/services/work-order";
import { DialogService } from "ui";
import { ViewWorkOrder } from "@app/outstock/order/verify-work/view";

@customElement('work-infos')
export class WorkInfos {

  @bindable
  @observable
  itemId: string;
  dataSource: kendo.data.DataSource;

  constructor(@inject private workOrderService: WorkOrderService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private dialogService: DialogService) {
  }
  /**
   * 加载数据
   */
  async bind() {
    this.dataSource = this.dataSourceFactory.create({
      readAll: () => this.workOrderService.getWorkOders(this.itemId)
    });
  }

  /**
   * 弹出作业内容窗口，仅查看
   */
  async workItem(id) {
    let result = await this.dialogService.open({ viewModel: ViewWorkOrder, model: {id: id}, lock: true }).whenClosed();
    if (result.wasCancelled) return;
  }
}