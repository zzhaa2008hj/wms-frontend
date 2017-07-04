import { inject } from 'aurelia-dependency-injection';
import { DialogService } from 'ui';
import { ChangeHistoryService } from '@app/common/services/change-history';
import { fixDate, DataSourceFactory } from '@app/utils';
import { ChangeHistory } from '@app/common/models/change-history';
import { CargoFlowService } from '@app/instock/services/cargo-flow';
import { CargoFlowChangeHistoryDetail } from '@app/instock/cargo-flow/change-history/detail';

export class ChangeHistoryList {

  dataSource: kendo.data.DataSource;

  constructor(@inject private cargoFlowService: CargoFlowService,
              @inject private changeHistoryService: ChangeHistoryService,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject("changeHistory") private changeHistory: ChangeHistory<any>) {
                
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.changeHistoryService.queryChangeHistory(this.changeHistory.businessId)
        .map(res => fixDate(res, 'createTime')),
      pageSize: 10
    });
  }

  async detail(id) {
    let changeHistory = await this.cargoFlowService.getChangeHistory(this.changeHistory.businessId, id);
    let result = await this.dialogService
      .open({ viewModel: CargoFlowChangeHistoryDetail, model: changeHistory, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }
}