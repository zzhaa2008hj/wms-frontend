import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow, cargoFlowValidationRules, InstockCargoItem } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { observable } from 'aurelia-framework';
import { uuid } from "@app/utils";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentDetail } from "@app/common/attachment/detail";

/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class EditCargoFlow {
  @observable disabled: boolean = false;
  cargoItems = [] as InstockCargoItem[];
  cargoFlow = {} as CargoFlow;
  selectedCargoInfo: any;
  units = [] as DictionaryData[];

  file: File;
  files: File[];
  dir: string = "";
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  baseCargoInfo = {
    transport: {
      read: async options => {
        await this.cargoInfoService.listBaseCargoInfos()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  };
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });

  validationController: ValidationController;
  private dropDownListCargoItem: any;

  constructor(private router: Router,
              private cargoInfoService: CargoInfoService,
              private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              private attachmentService: AttachmentService,
              private uploader: Uploader,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    let baseCargoItems = await this.cargoFlowService.listBaseCargoItems(this.cargoFlow.cargoInfoId);
    if (this.cargoItems) {
      for (let ci of this.cargoItems) {
        ci.unitStr = this.units.find(r => r.dictDataCode == ci.unit).dictDataName;
        let vehicles = await this.vehicleService.listInstockVehicles(ci.id);
        vehicles.forEach(v => {
          Object.assign(v, { cargoName: ci.cargoName });
          this.vehicles.push(v);
        });
        baseCargoItems.forEach(bci => {
          if (bci.id == ci.cargoItemId) {
            let index = baseCargoItems.indexOf(bci);
            baseCargoItems.splice(index, 1);
            return;
          }
        });
      }
    }

    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicles);

    let arr = await this.attachmentService.listAttachments({ businessType: 1, businessId: this.cargoFlow.id });
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

  async addVehicle(cargoItem) {
    let result = await this.dialogService.open({
      viewModel: NewVehicle,
      model: cargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      this.vehicles.push(result.output);
      this.dataSourceVehicle.data(this.vehicles);
    }
  }

  deleteCargoItem(e) {
    this.cargoItems.forEach(ci => {
      if (e.id == ci.id) {
        let index = this.cargoItems.indexOf(ci);
        this.cargoItems.splice(index, 1);
        //同时删除车辆信息
        this.vehicles.forEach(v => {
          if (v.instockGoodsId == ci.id) {
            this.deleteVehicle(v);
          }
        });
      }
    });
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
  }

  onSelect(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    this.cargoItems.splice(0, 0, dataItem);
    this.dataSourceCargoItem.data(this.cargoItems);
  }

  deleteVehicle(e) {
    this.vehicles.forEach(v => {
      if (e.id == v.id) {
        let index = this.vehicles.indexOf(v);
        this.vehicles.splice(index, 1);
      }
    });
    this.dataSourceVehicle.data(this.vehicles);
  }

  async updateCargoFlow() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    let orderQuantity = 0;
    let orderNumber = 0;
    if (vehicles || cargoItems) {
      cargoItems.forEach(ci => {
        orderQuantity += ci.orderQuantity;
        orderNumber += ci.orderNumber;
        let vs = [];
        vehicles.forEach(v => {
          if (ci.id == v.instockGoodsId) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }
    this.cargoFlow.orderQuantity = orderQuantity;
    this.cargoFlow.orderNumber = orderNumber;

    this.validationController.addObject(this.cargoFlow, cargoFlowValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      this.cargoFlow.attachments = this.attachments;
      await this.cargoFlowService.updateCargoFlow(this.cargoFlow);
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
    let keyRes = await this.attachmentService.getDirKey(this.cargoFlow.cargoInfoId);
    console.log("this.order.cargoInfoId", this.cargoFlow.cargoInfoId);
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
    let path = '/' + this.cargoFlow.cargoInfoId + '/' + item.uuidName;
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
