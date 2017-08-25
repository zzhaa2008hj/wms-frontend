import { Router } from 'aurelia-router';
import { DialogService, MessageDialogService } from "ui";
import { Container, inject } from 'aurelia-dependency-injection';
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow, cargoFlowValidationRules, InstockCargoItem } from "@app/instock/models/cargo-flow";
import { RouterParams } from '@app/common/models/router-params';
import { CargoInfoService } from '@app/base/services/cargo-info';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { CodeService } from '@app/common/services/code';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { observable } from 'aurelia-framework';
import { vehicleValidationRules } from "@app/outstock/models/order";
import { Upload, Uploader } from '@app/upload';
import { uuid } from '@app/utils';
import { AttachmentService } from '@app/common/services/attachment';
import { AttachmentMap } from '@app/common/models/attachment';
import { AttachmentDetail } from '@app/common/attachment/detail';

/**
 * Created by Hui on 2017/6/23.
 */
export class NewCargoFlow {
  @observable disabled: boolean = false;
  baseCargoItems: CargoItem[];
  cargoItems = [] as InstockCargoItem[];
  units = [] as DictionaryData[];
  cargoFlow = {} as CargoFlow;
  selectedCargoInfo: any;
  hasInfoId: boolean = false;
  baseCargoInfo: Array<CargoInfo>;

  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceBaseCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicle = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });
  files: File[];
  dir: string = '';
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  validationController: ValidationController;
  private dropDownListCargoItem: any;

  constructor( @inject private router: Router,
    @inject private cargoFlowService: CargoFlowService,
    @inject private dialogService: DialogService,
    @inject private cargoInfoService: CargoInfoService,
    @inject private messageDialogService: MessageDialogService,
    @inject private codeService: CodeService,
    @inject private uploader: Uploader,
    @inject private attachmentService: AttachmentService,
    @inject private dictionaryDataService: DictionaryDataService,
    @inject('routerParams') private routerParams: RouterParams,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.validationController.addObject(this.cargoFlow, cargoFlowValidationRules);

    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.baseCargoInfo = await this.cargoInfoService.getListByBatchValidation();
    this.baseCargoInfo.map(res => res.batchNumberStr = res.batchNumber + "(" + res.customerName + ")");
    if (this.routerParams.infoId) {
      this.hasInfoId = true;
      let cargoInfo: CargoInfo = await this.cargoInfoService.getCargoInfo(this.routerParams.infoId);
      let res = await this.codeService.generateCode("2", cargoInfo.batchNumber);
      this.cargoFlow.instockFlowNumber = res.content;
      this.setCargoFlowInfo(cargoInfo);
      let baseCargoItems = await this.cargoFlowService.listBaseCargoItems(this.cargoFlow.cargoInfoId);
      this.dataSourceBaseCargoItem.data(baseCargoItems);
    }
  }

  async chooseFiles() {
    let fileArr = await this.dialogService.chooseFiles();
    this.files = fileArr;
    this.files.forEach(res => {
      this.dir += res.name + ';';
    });
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.cargoFlow.cargoInfoId);

    let index = 0;
    for (let file of this.files) {
      let fileName = uuid();
      let suffix = file.name.split(".")[1];
      let uuidName = fileName + "." + suffix;
      let path = '/' + keyRes.key + '/' + uuidName;
      this.currentUpload = this.uploader.upload(file, { path: path });
      let result = await this.currentUpload.result;
      if (result.status == 'success') {
        this.attachments.push({ uuidName: uuidName, realName: file.name });
        index++;
      }
    }
    this.currentUpload = null;
    this.dir = '';
    await this.dialogService.alert({ title: '上传完成', message: '上传完成，成功上传' + index + '条数据' });
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

  async delete(data) {
    let item: AttachmentMap = data.item;
    let res = await this.attachmentService.getDirKey(this.cargoFlow.cargoInfoId);
    let path = '/' + res.key + '/' + item.uuidName;
    try {
      await this.attachmentService
        .deleteAttachments({ baseId: this.cargoFlow.cargoInfoId, url: path, uuidName: item.uuidName });
      this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    } catch (err) {
      await this.messageDialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    }
  }

  async onSelectCargoInfo(e) {
    if (this.cargoFlow) {
      this.validationController.removeObject(this.cargoFlow);
    }
    //初始化数据
    this.cargoFlow = {} as CargoFlow;
    this.cargoItems = [];
    this.vehicle = [];
    this.dataSourceCargoItem.data([]);
    this.dataSourceVehicle.data(this.vehicle);

    let dataItem: CargoInfo = this.selectedCargoInfo.dataItem(e.item);
    if (dataItem.id) {
      let res = await this.codeService.generateCode("2", dataItem.batchNumber);
      this.cargoFlow.instockFlowNumber = res.content;
      this.setCargoFlowInfo(dataItem);
      this.baseCargoItems = await this.cargoFlowService.listBaseCargoItems(this.cargoFlow.cargoInfoId);
      this.dataSourceBaseCargoItem.data(this.baseCargoItems);
    }
    this.validationController.addObject(this.cargoFlow, cargoFlowValidationRules);
  }

  setCargoFlowInfo(dataItem: CargoInfo) {
    this.cargoFlow.agentId = dataItem.agentId;
    this.cargoFlow.agentName = dataItem.agentName;
    this.cargoFlow.customerId = dataItem.customerId;
    this.cargoFlow.customerName = dataItem.customerName;
    this.cargoFlow.batchNumber = dataItem.batchNumber;
    this.cargoFlow.unit = dataItem.unit;
    this.cargoFlow.cargoInfoId = dataItem.id;
    this.cargoFlow.id = null;
    this.cargoFlow.lastBatch = 0;
  }


  async addVehicle(cargoItem) {
    let result = await this.dialogService.open({
      viewModel: NewVehicle,
      model: cargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      this.vehicle.push(result.output);
      this.dataSourceVehicle.data(this.vehicle);
    }
  }

  onSelect(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    Object.assign(dataItem, { sign: dataItem.uid });
    dataItem.cargoItemId = dataItem.id;
    dataItem.id = null;
    dataItem.unitStr = this.units.find(r => r.dictDataCode == dataItem.unit).dictDataName;
    this.cargoItems.splice(0, 0, dataItem);
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceBaseCargoItem.data(this.baseCargoItems);
  }

  deleteCargoItem(e) {
    this.cargoItems.forEach(ci => {
      if (e.sign == ci.sign) {
        let index = this.cargoItems.indexOf(ci);
        this.cargoItems.splice(index, 1);
        //同时删除车辆信息
        this.vehicle.forEach(v => {
          if (v.sign == ci.sign) {
            this.deleteVehicle(v);
          }
        });
      }
    });
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicle);
  }

  deleteVehicle(e) {
    this.vehicle.forEach(v => {
      if (e.sign == v.sign) {
        let index = this.vehicle.indexOf(v);
        this.vehicle.splice(index, 1);
      }
    });
    this.dataSourceVehicle.read();
  }

  async addNewCargoFlow() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    if (cargoItems.length == 0) {
      await this.messageDialogService.alert({ title: "新增失败", message: '请选择入库货物', icon: 'warning' });
      return;
    }
    let orderQuantity = 0;
    let orderNumber = 0;
    if (vehicles) {
      for (let v of vehicles) {
        this.validationController.addObject(v, vehicleValidationRules);
        let { valid } = await this.validationController.validate();
        if (!valid) return;
      }
      cargoItems.forEach(ci => {
        orderQuantity += ci.orderQuantity;
        orderNumber += ci.orderNumber;
        let vs = [];
        vehicles.forEach(v => {
          if (ci.sign == v.sign) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
    }
    if (cargoItems) {
      this.cargoFlow.orderQuantity = orderQuantity;
      this.cargoFlow.orderNumber = orderNumber;
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }

    this.validationController.addObject(this.cargoFlow, cargoFlowValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      this.cargoFlow.attachments = this.attachments;
      await this.cargoFlowService.saveCargoFlow(this.cargoFlow);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

