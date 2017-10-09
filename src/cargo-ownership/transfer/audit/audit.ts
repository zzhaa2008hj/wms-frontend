import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";
import { inject } from "aurelia-dependency-injection";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { DialogService } from "ui";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { Router } from "aurelia-router";
import * as moment from 'moment';
import { RateView } from '@app/cargo-ownership/transfer/view-rate';
import { StorageItemView } from '@app/cargo-ownership/transfer/view-storage';
import { CargoInfo } from '@app/base/models/cargo-info';
import {  CargoownershipTransferVo } from '@app/cargo-ownership/models/cargo-ownership';
import { Upload } from "@app/upload";

export class Audit {
  id: string;
  type;
  baseCargoInfo = [] as CargoInfo[];
  cargoInfoId: string;

  file: File;
  files: File[];
  dir: string = "";
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  // 货物信息
  cargoItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.transfer.transferItems);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });

  constructor(@inject private router: Router,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private attachmentService: AttachmentService,
              @inject private cargoownershipTransferService: CargoownershipTransferService,
              @inject('transferInfo') private transfer: CargoownershipTransferVo) {
  }

  async activate(params) {
    this.id = this.transfer.id;
    this.type = params.type ;
    this.transfer.storageEndDateStr = moment(this.transfer.storageEndDate).format("YYYY-MM-DD");
    this.transfer.transferDateStr = moment(this.transfer.transferDate).format("YYYY-MM-DD");
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.transfer.transferItems.forEach(item => {
      let unit = units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        item.unitName = unit.dictDataName;
      }
    });

    let arr = await this.attachmentService.listAttachments({ businessType: 3, businessId: this.transfer.id });
    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        attachment.path = this.getPath(res.attachmentUrl);
        this.attachments.push(attachment);
      });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
  // =====================================文件 > ================================
  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.transfer.cargoInfoId + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }
  getPath(uuidName) {
    let path = '/' + this.transfer.cargoInfoId + '/' + uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    return attachmentUrl;
  }

  // ===================================== < 文件 ======================================

  /**
   * 查看费率
   */
  async showRate(cargoItem) {
    this.dialogService.open({viewModel: RateView, model: cargoItem.cargoRates, lock: true});
  }

  /**
   * 库存信息
   */
  async showStorage(cargoItem) {
    this.dialogService.open({viewModel: StorageItemView, model: {storageItems: cargoItem.storageItems, title: cargoItem.cargoCategoryName}, lock: true});
  }

  async doAudit(status) {
    try {
      await  this.cargoownershipTransferService.doAudit(this.id, status, this.type) ;
      await this.dialogService.alert({ title: "提示", message: "审核成功！" });
      this.router.navigateToRoute('outstockOrder');
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
    }
    this.goBack()
  }


  goBack(){
    this.router.navigateToRoute("list");
  }


}



