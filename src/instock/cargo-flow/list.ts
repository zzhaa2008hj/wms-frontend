import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { DataSourceFactory } from "@app/utils";
import { VerifyRecordCriteria, VerifyRecordService } from '@app/common/services/verify-record';
import { DialogService, MessageDialogService } from 'ui';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-records/new';
import { ConstantValues } from '@app/common/models/constant-values';
@autoinject
export class CargoFlow {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  instockStages: string[] = ConstantValues.InstockStages;  
  private dataSource: kendo.data.DataSource;

  constructor(private cargoFlowService: CargoFlowService,
              private dialogService: DialogService,
              private verifyRecordService: VerifyRecordService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoFlowService.queryCargoFlows({ keywords: this.searchName })
        .map(res => {
          res.instockStageName = this.instockStages[res.stage + 1];
          return res;
        }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  async rollBack(item) {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.businessId = item.id;
    verifyRecord.businessName = item.instockFlowNumber;
    verifyRecord.businessType = 1;
    verifyRecord.stageBeforeVerify = item.stage;
    verifyRecord.batchNumber = item.batchNumber;
    let result = await this.dialogService
      .open({ viewModel: NewVerifyRecord, model: verifyRecord, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let res = result.output;
    try {
      let conformed = await this.messageDialogService.confirm({ title: "撤回成功", message: "确认提交撤回的审批请求？" });
      if (!conformed) {
        return;
      }
      await this.verifyRecordService.addVerifyRecord(res);
      await this.messageDialogService.alert({ title: "撤回成功", message: "撤回成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "撤回失败", message: err.message, icon: "error" });
    }
  }

  async verifyHistory(id) {
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = id;
    criteria.businessType = 1;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }
}