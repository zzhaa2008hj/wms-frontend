import { inject } from 'aurelia-dependency-injection';
import { DialogService } from 'ui';
import { ChangeHistoryService } from '@app/common/services/change-history';
import { DataSourceFactory } from '@app/utils';
import { ChangeHistory } from '@app/common/models/change-history';
import { OrderService } from "@app/outstock/services/order";
import { OrderChangeHistoryDetail } from "@app/outstock/order/change-history/detail";

export class ChangeHistoryList {

  dataSource: kendo.data.DataSource;

  constructor(@inject private orderService: OrderService,
              @inject private changeHistoryService: ChangeHistoryService,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject("changeHistory") private changeHistory: ChangeHistory<any>) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.changeHistoryService.queryChangeHistory(this.changeHistory.businessId),
      pageSize: 10
    });
  }

  async detail(id) {
    let changeHistory = await this.orderService.getChangeHistory(id);
      let result = await this.dialogService
        .open({ viewModel: OrderChangeHistoryDetail, model: changeHistory, lock: true })
        .whenClosed();
      if (result.wasCancelled) return;
  }
}