import { inject } from 'aurelia-dependency-injection';
import { DialogService } from 'ui';
import { ChangeHistoryService } from '@app/common/services/change-history';
import { DataSourceFactory } from '@app/utils';
import { ChangeHistory } from '@app/common/models/change-history';
import { PositionTransferChangeHistoryDetail } from "@app/cargo-position/info/change-history/detail";
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";

export class ChangeHistoryList {

  dataSource: kendo.data.DataSource;

  constructor(@inject private changeHistoryService: ChangeHistoryService,
              @inject private dialogService: DialogService,
              @inject private positionTransferInfoService: PositionTransferInfoService,
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
    let changeHistory = await this.positionTransferInfoService.getChangeHistory(id);
      let result = await this.dialogService
        .open({ viewModel: PositionTransferChangeHistoryDetail, model: changeHistory, lock: true })
        .whenClosed();
      if (result.wasCancelled) return;
  }
}