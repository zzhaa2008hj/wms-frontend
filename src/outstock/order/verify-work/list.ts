import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { Router } from "aurelia-router";
import { OrderService, OrderItemService } from "@app/outstock/services/order";
import { Order } from "@app/outstock/models/order";
import * as moment from 'moment';
import { ConstantValues } from "@app/common/models/constant-values";

export class VerifyWarehouse {
  datasource: kendo.data.DataSource;
  outstockStages: any[] = ConstantValues.OutstockStages;
  constructor(@inject private orderItemService: OrderItemService,
              @inject private dataSourceFactory: DataSourceFactory, 
              @inject private orderService: OrderService,
              @inject private router: Router,
              @inject("outstockOrder") private outstockOrder: Order) {
  }

  async activate() {
    this.outstockOrder.outstockDateStr = moment(this.outstockOrder.outstockDate).format("YYYY-MM-DD");
    this.outstockOrder.stageTitle = this.outstockStages.find(r => r.stage == this.outstockOrder.stage).title;

    this.datasource = this.dataSourceFactory.create({
      readAll: () => this.orderItemService.getItemsByOrderId(this.outstockOrder.id)
    });
  }

  async check(status) {
    // 生成作业统计 修改审核状态
    await this.orderService.auditBusiness(this.outstockOrder.id, status);
    this.router.navigateBack();
  }
}