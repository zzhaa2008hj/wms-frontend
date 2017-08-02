import { DialogService } from 'ui';
import { autoinject } from 'aurelia-dependency-injection';
import { ConstantValues } from '@app/common/models/constant-values';
import { DataSourceFactory } from '@app/utils';
import { AttachmentService } from '@app/common/services/attachment';
import { AttachmentDetail } from '@app/common/attachment/detail';
import DataSource = kendo.data.DataSource;

@autoinject
export class AttachmentList {

  dataSource: DataSource;
  businessNumber: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  businessTypes: any[] = ConstantValues.BusinessTypes;

  constructor(private dataSourceFactory: DataSourceFactory,
              private dialogService: DialogService,
              private attachmentService: AttachmentService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.attachmentService.queryAttachments({ businessNumber: this.businessNumber })
        .map(res => {
          res.businessTypeStr = this.businessTypes.find(r => r.type == res.businessType).name;
          let path = '/' + res.baseId + '/' + res.attachmentUrl;
          res.attachmentUrl = this.attachmentService.view(path);
          return res;
        }),
      pageSize: 10
    });
  }

  search() {
    this.dataSource.read();
  }

  async showDetail(attachmentUrl: string) {
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }
}