import { inject, Container } from 'aurelia-dependency-injection';
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import { Router } from "aurelia-router";
import {
  PositionTransferInfo, positionTransferInfoValidationRules, PositionTransferItem,
} from "@app/cargo-position/models/transfer-info";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentService } from "@app/common/services/attachment";
import { DialogService, MessageDialogService } from "ui";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { uuid } from "@app/utils";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { WarehouseTree } from "@app/base/storage/items/warehouse-tree";
import { EditRate } from "@app/cargo-position/info/edit-rate";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

export class NewPositionTransferInfo {
  disabled = false;
  positionTransferInfo = {} as PositionTransferInfo;
  attachments = [] as AttachmentMap[];
  files: File[];
  dir: string = '';
  currentUpload: Upload;
  dataSourceStorage = new kendo.data.HierarchicalDataSource({
    data: []
  });
  positionTransferItems: PositionTransferItem[];
  units = [] as DictionaryData[];
  demandFrom = [{ text: "内部", value: 1 }, { text: "客户", value: 2 }];
  validationController: ValidationController;
  private cargoRates: any;

  constructor(@inject private router: Router,
              @inject private uploader: Uploader,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private attachmentService: AttachmentService,
              @inject private messageDialogService: MessageDialogService,
              @inject private positionTransferInfoService: PositionTransferInfoService,
              @inject private cargoInfoService: CargoInfoService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.positionTransferInfo = await this.positionTransferInfoService.getById(params.id);
    this.positionTransferItems = this.positionTransferInfo.positionTransferItems;
    this.positionTransferItems.forEach(pti => {
      let unit = this.units.find(u => pti.unit == u.dictDataCode);
      if (unit) {
        pti.unitName = unit.dictDataName;
      }
      if (pti.cargoRates) {
        pti.cargoRates.forEach(cr => {
          let rateUunit = this.units.find(u => cr.unit == u.dictDataCode);
          if (rateUunit) {
            cr.unitStr = rateUunit.dictDataName;
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
      }

    });
    this.dataSourceStorage.data(this.positionTransferItems);
  }

  async updatePositionTransferInfo() {
    let storageItems: any = this.dataSourceStorage.data();
    console.log(storageItems);
    if (storageItems.length == 0) {
      await this.messageDialogService.alert({ title: "修改失败", message: `请补充货位转移货物信息`, icon: 'warning' });
      return;
    }
    for (let si of storageItems) {
      let wrongItems = storageItems.filter(sii => sii.id == si.id && sii.newWarehouseId == si.newWarehouseId);
      if (wrongItems.length > 1) {
        await this.messageDialogService.alert({
          title: "修改失败",
          message: `请检查数据,货物:${si.cargoName}多次向同一库区转移,请合并`,
          icon: 'warning'
        });
        return;
      }
    }
    this.positionTransferInfo.positionTransferItems = storageItems;
    console.log(this.positionTransferInfo);
    this.validationController.addObject(this.positionTransferInfo, positionTransferInfoValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      await this.positionTransferInfoService.updatePositionTransferInfo(this.positionTransferInfo);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }

  }

  async editRate(storageItem) {
    let cargoInfo: CargoInfo = await this.cargoInfoService.getByBatchNumber(this.positionTransferInfo.batchNumber);
    let cargoRates = this.cargoRates;
    if (storageItem.cargoRates) {
      cargoRates = storageItem.cargoRates;
    }
    let result = await this.dialogService.open({
      viewModel: EditRate,
      model: { id: cargoInfo.contractId, cargoRates: cargoRates },
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

  cancel() {
    this.router.navigateToRoute("list");
  }
}