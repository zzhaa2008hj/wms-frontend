import { DataSourceFactory } from "@app/utils";
import { observable, inject} from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { WorkOrderItemService } from '@app/instock/services/work-order';

@customElement('work-items')
export class WorkItems {

  @bindable
  @observable
  areaId: string;
  dataSource: kendo.data.DataSource;

  constructor(@inject private workOrderItemService: WorkOrderItemService,
              @inject private dataSourceFactory: DataSourceFactory) {
  }
  /**
   * 加载数据
   */
  async bind() {
    this.dataSource = this.dataSourceFactory.create({
      readAll: () => this.workOrderItemService.getWorkOrderItemList(this.areaId)
    });
  }
}