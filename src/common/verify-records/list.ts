import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecordService } from '@app/common/services/verify-record';
import { DataSourceFactory } from '@app/utils';
import { DialogService, MessageDialogService } from 'ui';
import { EditVerifyRecord } from '@app/common/verify-records/edit';
import { ConstantValues } from '@app/common/models/constant-values';
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
  businessTypes: any[] = ConstantValues.BusinessTypes;

  constructor(private service: VerifyRecordService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryVerifyRecord({batchNumber: this.batchNumber})
        .map(res => {
          res.businessTypeStr = this.businessTypes.find(r => r.type == res.businessType).name;
          return res;
        }),
      pageSize: 10
    });
  }

  async edit(id) {
    let selectedItem = await this.service.getVerifyRecord(id);
    let result = await this.dialogService
      .open({ viewModel: EditVerifyRecord, model: selectedItem, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let verifyRecord = result.output;
    try {
      await this.service.updateVerifyRecord(verifyRecord);
      await this.messageDialogService.alert({ title: "审批成功", message: "审批成功" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "审批失败", message: err.message, icon: "error" });
    }
  }

  search() {
    return this.dataSource.read();
  }
}