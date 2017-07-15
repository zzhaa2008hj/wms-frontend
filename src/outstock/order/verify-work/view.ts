import { inject } from "aurelia-dependency-injection";
import { WorkOrderAreaService } from "@app/instock/services/work-order";
import { DataSourceFactory } from "@app/utils";

export class ViewWorkOrder {

  datasource: kendo.data.DataSource;
  workOrderId: string;

  constructor(@inject private workOrderAreaService: WorkOrderAreaService,
              @inject private dataSourceFactory: DataSourceFactory) {
  }

  async activate({id}) {
    this.datasource = this.dataSourceFactory.create({
      readAll: () => this.workOrderAreaService.getWorkOrderAreas(id),
    });
  }
}