import { inject, Container } from 'aurelia-dependency-injection';
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from "@app/base/models/cargo-info";
import { Router } from "aurelia-router";
import {
  PositionTransferInfo, positionTransferInfoValidationRules, PositionTransferItem,
  PositionTransferSearch
} from "@app/cargo-position/models/transfer-info";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentService } from "@app/common/services/attachment";
import { DialogService, MessageDialogService } from "ui";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { uuid } from "@app/utils";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { StorageService } from "@app/base/services/storage";
import { StorageInfo, StorageItem } from "@app/base/models/storage";
import { EditRate } from "@app/cargo-position/info/edit-rate";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { WarehouseTree } from "@app/base/warehouse/tree";

export class NewPositionTransferInfo {
  selectedDemandFrom: any;
  storageItems: StorageItem[];
  disabled = false;
  baseCargoInfos: CargoInfo[];
  selectedCargoInfo: any;
  positionTransferInfo = {} as PositionTransferInfo;
  attachments = [] as AttachmentMap[];
  files: File[];
  dir: string = '';
  currentUpload: Upload;
  dropDownListCargoItem: any;
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceStorage = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceStorageItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  cargoItems = [] as CargoItem[];
  units = [] as DictionaryData[];
  baseCargoItems: CargoItem[];
  search = {} as PositionTransferSearch;
  demandFrom = [{ text: "内部", value: 1 }, { text: "客户", value: 2 }];
  validationController: ValidationController;

  constructor(@inject private router: Router,
              @inject private uploader: Uploader,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private attachmentService: AttachmentService,
              @inject private storageService: StorageService,
              @inject private messageDialogService: MessageDialogService,
              @inject private positionTransferInfoService: PositionTransferInfoService,
              @inject private cargoInfoService: CargoInfoService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.baseCargoInfos = await  this.cargoInfoService.listBaseCargoInfos({ instockStatus: 1, outstockStatus: 0 });
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
  }

  async addNewPositionTransferInfo() {
    let transferItems = [];
    let storageItems: any = this.dataSourceStorage.data();
    if (storageItems.length == 0) {
      await this.messageDialogService.alert({ title: "新增失败", message: `请补充货位转移货物信息`, icon: 'warning' });
      return;
    }
    for (let si of storageItems) {
      let wrongItems = storageItems.filter(sii => sii.id == si.id && sii.newWarehouseId == si.newWarehouseId);
      if (wrongItems.length > 1) {
        await this.messageDialogService.alert({
          title: "新增失败",
          message: `请检查数据,货物:${si.cargoName}多次向同一库区多次转移,请合并`,
          icon: 'warning'
        });
        return;
      }
      let transferItem = {} as  PositionTransferItem;
      let cargoItem = this.baseCargoItems.find(bci => bci.cargoName == si.cargoName);
      transferItem.cargoItemId = cargoItem.id;
      transferItem.cargoName = cargoItem.cargoName;
      transferItem.cargoCategoryId = cargoItem.cargoCategoryId;
      transferItem.cargoCategoryName = cargoItem.cargoCategoryName;
      transferItem.cargoSubCategoryName = cargoItem.cargoSubCatergoryName;
      transferItem.unit = cargoItem.unit;
      transferItem.warehouseId = si.warehouseId;
      transferItem.warehouseName = si.warehouseName;
      transferItem.storageQuantity = si.storageQuantity;
      transferItem.storageNumber = si.storageNumber;
      transferItem.newWarehouseId = si.newWarehouseId;
      transferItem.newWarehouseName = si.newWarehouseName;
      transferItem.transferQuantity = si.transferQuantity;
      transferItem.transferNumber = si.transferNumber;
      transferItem.remark = si.remark;
      transferItem.containerNumber = si.containerNumber;
      transferItem.containerType = si.containerType;
      //费率
      if (si.cargoRates.length > 0) {
        Object.assign(transferItem, { cargoRates: si.cargoRates });
      } else {
        await this.messageDialogService.alert({
          title: "新增失败",
          message: `请检查数据,货物:${si.cargoName}未设置费率`,
          icon: 'warning'
        });
        return;
      }
      transferItems.push(transferItem);
    }
    this.positionTransferInfo.positionTransferItems = transferItems;

    this.validationController.addObject(this.positionTransferInfo, positionTransferInfoValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      await this.positionTransferInfoService.savePositionTransferInfo(this.positionTransferInfo);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }

  }

  async editRate(storageItem) {
    let cargoInfo: CargoInfo = await this.cargoInfoService.getByBatchNumber(this.positionTransferInfo.batchNumber);
    let result = await this.dialogService.open({
      viewModel: EditRate,
      model: { id: cargoInfo.contractId, cargoRates: storageItem.cargoRates },
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    let newCargoRates = result.output;
    console.log(newCargoRates);
    let storageItems: any = this.dataSourceStorage.data();
    storageItems.forEach(si => {
      if (si.uid == storageItem.uid) {
        Object.assign(si, { cargoRates: newCargoRates });
      }
    });
    this.dataSourceStorage.data(storageItems);
  }

  deleteStorageItem(e) {
    let storageItems: any = this.dataSourceStorage.data();
    let storageItem = storageItems.find(si => si.uid == e.uid);
    storageItems.remove(storageItem);
    this.dataSourceStorage.data(storageItems);
  }

  async selectWarehourse(uid: string) {
    let result = await this.dialogService.open({ viewModel: WarehouseTree, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let warehouse = result.output;
    console.log(warehouse);
    let storageItems: any = this.dataSourceStorage.data();
    storageItems.forEach(si => {
      if (si.uid == uid) {
        Object.assign(si, { newWarehouseId: warehouse.id });
        Object.assign(si, { newWarehouseName: warehouse.name });
      }
    });
    this.dataSourceStorage.data(storageItems);
  }

  async addStorageItem() {
    if (!this.positionTransferInfo.batchNumber) {
      await this.messageDialogService.alert({ title: "", message: "请先选择批次号", icon: "warning" });
      return;
    }
    if (!this.positionTransferInfo.demandFrom) {
      await this.messageDialogService.alert({ title: "", message: "请先选择需求来源", icon: "warning" });
      return;
    }
    let oldStorageItems = this.dataSourceStorage.data();
    let storageItems: any = this.dataSourceStorageItem.data();
    if (this.search.warehouseName) {
      storageItems = storageItems.filter(si => si.warehouseId == this.search.warehouseId);
    }
    storageItems.forEach(si => {
      si.cargoRates = this.baseCargoItems.find(bci => bci.cargoName == si.cargoName).cargoRates;
      if (this.positionTransferInfo.demandFrom == 1) {
        let deletedCargoRates = si.cargoRates.filter(cr => cr.chargeType == 1);
        for (let dcr of deletedCargoRates) {
          let index = si.cargoRates.indexOf(dcr);
          si.cargoRates.splice(index, 1);
        }
      }
      si.cargoRates.forEach(cr => {
        let rateUnit = this.units.find(u => cr.unit == u.dictDataCode);
        if (rateUnit) {
          cr.unitStr = rateUnit.dictDataName;
        }
        if (cr.cargoRateSteps) {
          cr.cargoRateSteps.forEach(crs => {
            let stepUunit = this.units.find(u => crs.stepUnit == u.dictDataCode);
            if (stepUunit) {
              crs.stepUnitStr = stepUunit.dictDataName;
            }
          });
        }
      });
    });
    oldStorageItems.push(...storageItems);
    this.dataSourceStorage.data(oldStorageItems);
    console.log(this.dataSourceStorage.data());
  }

  async onSelectCargoItem(e) {
    let dataItem = this.dropDownListCargoItem.dataItem(e.item);
    if (dataItem.id) {
      let storageItems = await this.storageService.getItemsByCargoItemId(dataItem.id);
      for (let si of storageItems) {
        let storageInfo: StorageInfo = await this.storageService.getStorageInfoById(si.storageInfoId);
        let baseCargoItem = this.baseCargoItems.find(bci => bci.id == storageInfo.cargoItemId);
        Object.assign(si, { cargoName: baseCargoItem.cargoName });
      }
      this.dataSourceStorageItem.data(storageItems);
    }
  }

  async delete(data) {
    let item: AttachmentMap = data.item;
    let res = await this.attachmentService.getDirKey(this.positionTransferInfo.cargoInfoId);
    let path = '/' + res.key + '/' + item.uuidName;
    try {
      await this.attachmentService
        .deleteAttachments({ baseId: this.positionTransferInfo.cargoInfoId, url: path, uuidName: item.uuidName });
      this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    } catch (err) {
      await this.messageDialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    }
  }

  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.positionTransferInfo.cargoInfoId + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.positionTransferInfo.cargoInfoId);

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

  async chooseFiles() {
    let fileArr = await this.dialogService.chooseFiles();
    this.files = fileArr;
    this.files.forEach(res => {
      this.dir += res.name + ';';
    });
  }

  async onSelectCargoInfo(e) {
    //初始化数据
    this.search = {};
    this.positionTransferInfo = {} as PositionTransferInfo;

    let dataItem: CargoInfo = this.selectedCargoInfo.dataItem(e.item);
    this.positionTransferInfo.cargoInfoId = dataItem.id;
    this.positionTransferInfo.batchNumber = dataItem.batchNumber;
    this.positionTransferInfo.agentId = dataItem.agentId;
    this.positionTransferInfo.agentName = dataItem.agentName;
    this.positionTransferInfo.customerId = dataItem.customerId;
    this.positionTransferInfo.customerName = dataItem.customerName;

    this.baseCargoItems = await this.cargoInfoService.getCargoItems(dataItem.id);
    this.dataSourceCargoItem.data(this.baseCargoItems);

    this.storageItems = await this.storageService.getItemsByBatchNumber(dataItem.batchNumber);
    for (let si of this.storageItems) {
      let storageInfo: StorageInfo = await this.storageService.getStorageInfoById(si.storageInfoId);
      let baseCargoItem = this.baseCargoItems.find(bci => bci.id == storageInfo.cargoItemId);
      Object.assign(si, { cargoName: baseCargoItem.cargoName });
      let unit = this.units.find(u => si.unit == u.dictDataCode);
      if (unit) {
        si.unitName = unit.dictDataName;
      }
    }
    this.dataSourceStorageItem.data(this.storageItems);
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}