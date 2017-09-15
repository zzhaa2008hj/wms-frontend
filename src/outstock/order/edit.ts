import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { OrderService } from "@app/outstock/services/order";
import { MessageDialogService, DialogService } from "ui";
import { observable } from 'aurelia-framework';
import { Order, OrderItem, orderValidationRules, vehicleValidationRules } from "@app/outstock/models/order";
import { CargoInfo } from "@app/base/models/cargo-info";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { copy, uuid } from "@app/utils";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentDetail } from "@app/common/attachment/detail";
import * as moment from 'moment';

/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class EditOrder {
  @observable disabled: boolean = false;
  units = [] as DictionaryData[];
  order = {} as Order;
  outstockOrderItems = [] as OrderItem[];

  baseCargoInfo: Array<CargoInfo>;
  selectedCargoInfo: any;

  file: File;
  files: File[];
  dir: string = "";
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  orderItems = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = new kendo.data.DataSource({
    schema: {
      model: {
        fields: {
          plateNumber: { validation: { required: true } },
          driverName: { validation: { required: true } },
          driverIdentityNumber: { validation: { required: true } },
          phoneNumber: { validation: { required: true } }
        }
      }
    }
  });

  validationController: ValidationController;

  constructor(private router: Router,
              private orderService: OrderService,
              private dictionaryDataService: DictionaryDataService,
              private messageDialogService: MessageDialogService,
              private attachmentService: AttachmentService,
              private uploader: Uploader,
              private dialogService: DialogService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {

    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.order = await this.orderService.getOrderById(params.id);
    this.order.outstockDateStr = moment(this.order.outstockDate).format("YYYY-MM-DD");
    let canDeliveries = await this.orderService.getValidOutstockNum(this.order.cargoInfoId);
    if (this.order.outstockOrderItems) {
      this.outstockOrderItems = this.order.outstockOrderItems;
      this.outstockOrderItems.forEach(ooi => {
        ooi.unitStr = this.units.find(r => r.dictDataCode == ooi.unit).dictDataName;
        let canDelivery = canDeliveries.find(cd => cd.cargoItemId == ooi.cargoItemId);
        ooi.canQuantity = ooi.orderQuantity + canDelivery.quantity;
        ooi.canNumber = ooi.orderNumber + canDelivery.number;
      });
      this.orderItems.data(this.outstockOrderItems);
    }
    this.vehicles.data(this.order.outstockVehicles);

    this.validationController.addObject(this.order, orderValidationRules);

    let arr = await this.attachmentService.listAttachments({ businessType: 2, businessId: this.order.id });
    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        attachment.status = 2;
        this.attachments.push(attachment);
      });
    }
  }

  async editOrder() {
    let orderItems = [];
    Object.assign(orderItems, this.orderItems.data());
    if (orderItems) {
      let oois = [] as OrderItem[];
      this.outstockOrderItems.forEach(ooi => {
        oois.push(copy(ooi));
      });
      for (let oi of orderItems) {
        let ci: OrderItem = oois.find(ooi => ooi.id == oi.id);
        if (ci.canQuantity) {
          ci.canQuantity -= oi.orderQuantity;
          if (ci.canQuantity < 0) {
            return this.messageDialogService.alert({
              title: "新增失败",
              message: `货物:${ci.cargoName}    累计出库数量超出可出库数量,请检查后重新提交`,
              icon: 'error'
            });
          }
        } else {
          ci.canNumber -= oi.orderNumber;
          if (ci.canNumber < 0) {
            return this.messageDialogService.alert({
              title: "新增失败",
              message: `货物:${ci.cargoName}    累计出库件数超出可出库件数,请检查后重新提交`,
              icon: 'error'
            });
          }
        }
      }

      let quantitySum = 0;
      let numberSum = 0;
      orderItems.forEach(ci => {
        quantitySum += ci.orderQuantity;
        numberSum += ci.orderNumber;
      });
      this.order.quantitySum = quantitySum;
      this.order.numberSum = numberSum;
      Object.assign(this.order, { outstockOrderItems: orderItems });
    }

    if (this.order.outstockVehicles.length == 0) {
      return this.messageDialogService.alert({ title: "新增失败", message: "请填写出库车辆信息", icon: 'error' });
    }
    let vehicles = [];
    Object.assign(vehicles, this.vehicles.data());
    if (vehicles) {
      for (let v of vehicles) {
        this.validationController.addObject(v, vehicleValidationRules);
        let { valid } = await this.validationController.validate();
        if (!valid) return;
      }
      Object.assign(this.order, { outstockVehicles: vehicles });
    }

    this.disabled = true;
    try {
      this.order.attachments = this.attachments;
      await this.orderService.updateOrder(this.order);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

  async chooseFiles() {
    let fileArr = await this.dialogService.chooseFiles();
    this.files = fileArr;
    this.files.forEach(res => {
      this.dir += res.name + ";";
    });
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.order.cargoInfoId);
    console.log("this.order.cargoInfoId", this.order.cargoInfoId);
    let index = 0;
    for (let file of this.files) {
      let fileName = uuid();
      let suffix = file.name.split(".")[1];
      let uuidName = fileName + "." + suffix;
      let path = '/' + keyRes.key + '/' + uuidName;
      this.currentUpload = this.uploader.upload(file, { path: path });
      let result = await this.currentUpload.result;
      if (result.status == 'success') {
        this.attachments.push({ uuidName: uuidName, realName: file.name, status: 1 });
        index++;
      }
    }
    this.currentUpload = null;
    this.dir = '';
    await this.dialogService.alert({ title: "上传完成", message: "上传完成，成功上传" + index + "条数据" });
    return;
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

  delete(data) {
    // let item: AttachmentMap = data.item;
    // let res = await this.attachmentService.getDirKey(this.order.cargoInfoId);
    // let path = '/'+ res.key+'/'+item.uuidName;
    // try{
    //   await this.attachmentService
    //   .deleteAttachments({baseId: this.order.cargoInfoId, url: path, uuidName: item.uuidName});
    //   this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    // }catch(err){
    //   await this.dialogService.alert({title: "删除失败", message: err.message, icon: "error"});
    // }
    let item: AttachmentMap = data.item;
    item.status = 0;
  }

}
