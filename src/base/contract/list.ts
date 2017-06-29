import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from 'ui';
import { DataSourceFactory } from "@app/utils";
import { ContractService } from "@app/base/services/contract";
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-records/new';
import { VerifyRecordService, VerifyRecordCriteria } from '@app/common/services/verify-record';
import { VerifyRecordDialogList } from '@app/common/verify-records/dialog-list';

@autoinject
export class ContractList {
  searchName: string;

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  contractTypes: string[] = ["客户仓储", "装卸单位", "库区租赁"];

  constructor(private contractService: ContractService,
    private messageDialogService: MessageDialogService,
    private dialogService: DialogService,
    private verifyRecordService: VerifyRecordService,
    private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.contractService.queryContracts({ searchName: this.searchName }).map(res => {
        res.contractTypeStr = this.contractTypes[res.contractType - 1];
        return res;
      }),
      pageSize: 10
    });
  }

  async delete(id) {
    let confirm = await this.messageDialogService.confirm({ title: "提示", message: "确定删除该角色！" });
    if (confirm) {
      try {
        await this.contractService.delete(id);
        await this.messageDialogService.alert({ title: "", message: "删除成功！" });
        this.dataSource.read();
      } catch (err) {
        await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
      }
    }
  }

  select() {
    this.dataSource.read();
  }

  async rollBack(item) {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.batchNumber = "";
    verifyRecord.businessId = item.id;
    verifyRecord.businessName = item.contractNumber;
    verifyRecord.businessType = 6;
    verifyRecord.stageBeforeVerify = 3;
    let result = await this.dialogService
      .open({ viewModel: NewVerifyRecord, model: verifyRecord, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let res = result.output;
    try {
      await this.verifyRecordService.addVerifyRecord(res);
      await this.messageDialogService.alert({ title: "撤回成功", message: "撤回成功！" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "撤回失败", message: err.message, icon: "error" });
    }
  }

  async verifyHistory(id) {
    let criteria: VerifyRecordCriteria = {};
    criteria.businessId = id;
    criteria.businessType = 6;
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: criteria, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }
}