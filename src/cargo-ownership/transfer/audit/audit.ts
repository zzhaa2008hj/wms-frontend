import { CargoownershipTransfer, CargoownershipTransferItem } from "@app/cargo-ownership/models/cargo-ownership";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";
import { inject } from "aurelia-dependency-injection";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { DialogService } from "ui";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { ViewCargoTransferRate } from "@app/cargo-ownership/transfer/audit/view";
import { Router } from "aurelia-router";

export class Audit {
  id: string;
  type;
  //货物信息
  cargoInfo = [] as CargoownershipTransferItem[];
  //费率信息

  //附件信息
  attachments = [] as AttachmentMap[];


  constructor(@inject private  cargoownershipTransferService: CargoownershipTransferService,
              @inject('transferInfo') private transfer: CargoownershipTransfer,
              @inject private attachmentService: AttachmentService,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private router: Router) {
  }

  async activate(params) {
    this.id = this.transfer.id;
    this.type = params.type ;
    let arr = await this.attachmentService.listAttachments({ businessType: 3, businessId: this.transfer.id });
    this.cargoInfo = await this.cargoownershipTransferService.getCargoItemsById(params.id);
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.cargoInfo.map(res => {
      let dict = units.find(r => r.dictDataCode == res.unit);
      if (dict) {
        res.unitStr = dict.dictDataName;
      }
      return res;
    });


    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        attachment.status = 2;
        attachment.path = this.getPath(res.attachmentUrl);
        this.attachments.push(attachment);
      });}


  }

  getPath(uuidName) {
    let path = '/' + this.transfer.id + '/' + uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    return attachmentUrl;
  }

  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.transfer.id + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
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

  async showRate(transferId) {
    let result = await this.dialogService
      .open({ viewModel: ViewCargoTransferRate, model: { id: transferId }, lock: true }).whenClosed();
    if (result.wasCancelled) return;
  }

  goBack(){
    this.router.navigateToRoute("list");
  }


}



