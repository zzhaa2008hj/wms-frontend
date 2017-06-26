import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecordService } from '@app/common/services/verify-record';
import { DataSourceFactory } from '@app/utils';
import { DialogService, MessageDialogService } from 'ui';
import { EditVerifyRecord } from '@app/common/verify-record/edit';
import { VerifyRecord } from '@app/common/models/verify-record';
import { NewVerifyRecord } from '@app/common/verify-record/new';
import { VerifyRecordDialogList } from '@app/common/verify-record/dialog';
import DataSource = kendo.data.DataSource;

@autoinject
export class VerifyRecordList {

  dataSource: DataSource;
  batchNumber: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  businessTypes: string[] = ["入库", "出库", "货权转移", "货位转移", "货物质押", "合同"];

  constructor(private service: VerifyRecordService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryVerifyRecord({batchNumber: this.batchNumber})
        .map(res => {
          res.businessTypeStr = this.businessTypes[res.businessType - 1];
          return res;
        }),
      pageSize: 10
    });
  }

  async edit(id) {
    let selectedItem = await this.service.getVerifyRecord(id);
    let result = await this.dialogService.open({ viewModel: EditVerifyRecord, model: selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let verifyRecord = result.output;
    try {
      await this.service.updateVerifyRecord(verifyRecord);
      await this.messageDialogService.alert({ title: "审批成功", message: "审批成功" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "审批失败", message: err.message, icon: "error" });
    }
  }


  async list() {
    let result = await this.dialogService.open({ viewModel: VerifyRecordDialogList, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async add() {
    let verifyRecord: VerifyRecord = {} as VerifyRecord;
    verifyRecord.batchNumber = "123";
    verifyRecord.businessId = "321";
    verifyRecord.businessName = "234";
    verifyRecord.businessType = 1;
    verifyRecord.stageBeforeVerify = 1;
    let result = await this.dialogService
      .open({ viewModel: NewVerifyRecord, model: verifyRecord, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let res = result.output;
    try {
      await this.service.addVerifyRecord(res);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  search() {
    return this.dataSource.read();
  }
}