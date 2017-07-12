import { autoinject } from 'aurelia-dependency-injection';
import { VerifyRecordService, VerifyRecordCriteria } from '@app/common/services/verify-record';
import { DataSourceFactory } from '@app/utils';
import { DialogController } from 'ui';
import { ConstantValues } from '@app/common/models/constant-values';
import DataSource = kendo.data.DataSource;

@autoinject
export class VerifyRecordDialogList {

  dataSource: DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  businessTypes: any[] = ConstantValues.BusinessTypes;

  constructor(private service: VerifyRecordService,
              private dialogController: DialogController,
              private dataSourceFactory: DataSourceFactory) {

  }

  activate(criteria: VerifyRecordCriteria) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.service.queryVerifyRecord(criteria)
        .map(res => {
          res.businessTypeStr = this.businessTypes.find(r => r.type == res.businessType).name;
          return res;
        }),
      pageSize: 10
    });
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}