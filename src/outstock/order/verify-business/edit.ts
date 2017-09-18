import { inject } from "aurelia-dependency-injection";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Order, OrderItem, Vehicle } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import * as moment from 'moment';
import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { AttachmentMap } from "@app/common/models/attachment";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentDetail } from "@app/common/attachment/detail";

export class VerifyBusinessDialogEdit {
  disabled: boolean = false;
  cargoInfo: CargoInfo;
  orderItems = [] as OrderItem[];
  vehicles = [] as Vehicle[];

  //warehouseTypes = [] as DictionaryData[];
  verifyStatus: number;
  order: Order;

  attachments = [] as AttachmentMap[];

  constructor(@inject private orderService: OrderService,
              @inject private cargoInfoService: CargoInfoService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              @inject private attachmentService: AttachmentService,
              @inject('outstockOrderId') private outstockOrder: Order) {
  }

  async activate() {
    this.order = await this.orderService.getOrderById(this.outstockOrder.id);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.order.cargoInfoId);
    //this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.orderItems = this.order.outstockOrderItems.map(res => {
      let dict = units.find(r => r.dictDataCode == res.unit);
      if (dict) {
        res.unitStr = dict.dictDataName;
      }
      return res;
    });
    this.vehicles = this.order.outstockVehicles;
    this.order.outstockDateStr = moment(this.order.outstockDate).format("YYYY-MM-DD");
    // this.cargoInfo.warehouseTypeStr = this.warehouseTypes
    //   .find(res => res.dictDataCode == this.cargoInfo.warehouseType).dictDataName;

    let arr = await this.attachmentService.listAttachments({ businessType: 2, businessId: this.outstockOrder.id });
    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        attachment.status = 2;
        attachment.path = this.getPath(res.attachmentUrl);
        this.attachments.push(attachment);
      });
    }
  }

  /**
   * 商务审核
   */
  async verifyBusiness(verifyStatus: number) {
    let status = verifyStatus == 1 ? '通过' : '不通过';
    let confirm = await this.dialogService.confirm({ title: "提示", message: `确定${status}商务审核？` });
    if (!confirm) return;
    this.disabled = true;
    try {
      await this.orderService.auditBusiness(this.order.id, verifyStatus);
      await this.dialogService.alert({ title: "提示", message: "审核成功！" });
      this.router.navigateToRoute('list');
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: "error" });
      this.disabled = false;
    }
  }

  getPath(uuidName) {
    let path = '/' + this.order.cargoInfoId + '/' + uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    return attachmentUrl;
  }

  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.order.cargoInfoId + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  goBack() {
    this.router.navigateToRoute("outstockOrder");
  }
}