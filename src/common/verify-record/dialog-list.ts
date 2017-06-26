import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecordService, VerifyRecordCriteria } from '@app/common/services/verify-record';
import { DataSourceFactory } from '@app/utils';
import { DialogController } from 'ui';
import DataSource = kendo.data.DataSource;

@autoinject
export class VerifyRecordDialogList {

  dataSource: DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  businessTypes: string[] = ["入库", "出库", "货权转移", "货位转移", "货物质押", "合同"];

  constructor(private service: VerifyRecordService,
              private dialogController: DialogController,
              private dataSourceFactory: DataSourceFactory) {

  }

  activate(criteria: VerifyRecordCriteria) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryVerifyRecord(criteria)
        .map(res => {
          res.businessTypeStr = this.businessTypes[res.businessType - 1];
          return res;
        }),
      pageSize: 10
    });
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}