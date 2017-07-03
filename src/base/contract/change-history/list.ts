import { inject } from 'aurelia-dependency-injection';
import { ContractService } from "@app/base/services/contract";
import { Contract } from '@app/base/models/contract';
import { DialogService } from 'ui';
import { ChangeHistoryDetail } from '@app/base/contract/change-history/detail';
import { ChangeHistoryService } from '@app/common/services/change-history';
import { fixDate, DataSourceFactory } from '@app/utils';

export class ChangeHistoryList {

  dataSource: kendo.data.DataSource;

  constructor(@inject private contractService: ContractService,
              @inject private changeHistoryService: ChangeHistoryService,
              @inject private dialogService: DialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject("contract") private contract: Contract) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.changeHistoryService.queryChangeHistory(this.contract.id)
        .map(res => fixDate(res, 'createTime')),
      pageSize: 10
    });
  }

  async detail(id) {
    let changeHistory = await this.contractService.getChangeHistory(this.contract.id, id);
    let result = await this.dialogService
      .open({ viewModel: ChangeHistoryDetail, model: changeHistory, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }
}