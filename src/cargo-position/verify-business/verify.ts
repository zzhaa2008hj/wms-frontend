import { inject } from 'aurelia-dependency-injection';
import { PositionTransferItemService, PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { Router } from "aurelia-router";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";
import { AttachmentMap } from "@app/common/models/attachment";
import { AttachmentService } from "@app/common/services/attachment";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DialogService } from "ui";


export class NewPositionTransferInfo {
  attachments = [] as AttachmentMap[];

  dataSourceStorage: kendo.data.DataSource;

  dataSourceCargoRate: kendo.data.DataSource;

  units = [] as DictionaryData[];

  constructor(@inject private router: Router,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private attachmentService: AttachmentService,
              @inject private positionTransferItemService: PositionTransferItemService,
              @inject private positionTransferInfoService: PositionTransferInfoService,
              @inject private dialogService: DialogService,
              @inject('positionTransferInfo') private positionTransferInfo: PositionTransferInfo) {
  }

  async activate() {
    //this.positionTransferInfo = e;  
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    let arr = await this.attachmentService.listAttachments({
      businessType: 4,
      businessId: this.positionTransferInfo.id
    });
    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        attachment.path = this.getPath(res.attachmentUrl);
        this.attachments.push(attachment);
      });
    }

    this.dataSourceStorage = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          this.positionTransferItemService.getItems(this.positionTransferInfo.id)
            .then(options.success)
            .catch(err => options.error("", "", err));
        }
      }
    });


  }

  getPath(uuidName) {
    let path = '/' + this.positionTransferInfo.cargoInfoId + '/' + uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    return attachmentUrl;
  }

  async confirm(param) {
    try {
      await this.positionTransferInfoService.updateBusinessVerify(this.positionTransferInfo.id, param);
      await this.dialogService.alert({ title: "提示", message: "操作成功" });
    } catch (e) {
      await this.dialogService.alert({ title: "错误", message: e.message });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}