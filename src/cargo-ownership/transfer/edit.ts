import { Router } from "aurelia-router";
import { Container, inject } from 'aurelia-dependency-injection';
import { CargoInfo } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DialogService } from "ui";
import { observable } from 'aurelia-framework';
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { copy, uuid } from "@app/utils";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { transferValidationRules, TransferCargoItemVo, CargoownershipTransfer } from '@app/cargo-ownership/models/cargo-ownership';
import { CargoownershipTransferService } from '@app/cargo-ownership/services/cargo-ownership';
import { RateView } from '@app/cargo-ownership/transfer/edit-rate';
import { StorageItemView } from '@app/cargo-ownership/transfer/edit-storage';
import * as moment from 'moment';
export class NewTransfer {
  @observable disabled: boolean = false;
  units = [] as DictionaryData[];
  @observable
  hasInfoId: boolean = false;

  baseCargoInfo = [] as CargoInfo[];
  selectedAgent: any;
  selectedCustomer: any;
  selectedNewAgent: any;
  selectedNewCustomer: any;
  selectedBatchNumber: any;
  selectedOutFeeCustomer: any;
  baseAgent = [];
  baseCustomer = [];
  baseNewAgent = [];
  baseNewCustomer = [];
  baseBatchNumber = new kendo.data.HierarchicalDataSource({
    data: []
  });
  baseOutFeeCustomer  = new kendo.data.HierarchicalDataSource({
    data: []
  });
  // 总
  transfer = {} as CargoownershipTransfer;
  cargoInfoId: string;

  file: File;
  files: File[];
  dir: string = "";
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  validationController: ValidationController;
  transferDateDatePicker: kendo.ui.DatePicker;
  storageEndDatePicker: kendo.ui.DatePicker;
  // private dropDownListCargoItem: any;
  // 货物信息
  cargoItems: TransferCargoItemVo[] = [];
  cargoItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoItems);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    },
    autoSync: true,
    schema: {
      model: {
        id: 'id',
        fields: {
          batchNumber: { editable: false },
          chargeCategory: { editable: false },
          chargeCategoryName: { editable: false },
          cargoCategoryName: { editable: false },
          quantity: { editable: false },
          number: { editable: false },
          storageQuantity: { editable: false },
          storageNumber: { editable: false },
          distrainQuantity: { editable: false },
          distrainNumber: { editable: false },
          outstockQuantity: { editable: false },
          outstockNumber: { editable: false },
          unitName: { editable: false },
          freeDays: {editable: false},
          transferQuantity: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 }},
          transferNumber: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 } },
          transferFreeDays: {editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 }},
          remark: { editable: true },
        }
      }
    }
  });

  constructor(@inject private router: Router,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject validationControllerFactory: ValidationControllerFactory,
              @inject container: Container,
              @inject private attachmentService: AttachmentService,
              @inject private uploader: Uploader,
              @inject private cargoownershipTransferService: CargoownershipTransferService) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate({id}) {
    this.transfer = await this.cargoownershipTransferService.getEditDetail(id);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.transfer.storageEndDateStr = moment(this.transfer.storageEndDate).format("YYYY-MM-DD");
    this.transfer.transferDateStr = moment(this.transfer.transferDate).format("YYYY-MM-DD");
    this.cargoInfoId = this.transfer.cargoInfoId;
    this.cargoItems = this.transfer.transferItems;
    if (this.cargoItems.length > 0) {
      this.cargoItems.forEach(item => {
        let unit = this.units.find(u => u.dictDataCode == item.unit);
        if (unit) {
          item.unitName = unit.dictDataName;
        }
      });
    }
    console.log('this.cargoItems', this.cargoItems);

    let arr = await this.attachmentService.listAttachments({ businessType: 3, businessId: this.transfer.id });
    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        // attachment.path = this.getPath(res.attachmentUrl);
        attachment.status = 2;
        this.attachments.push(attachment);
      });
    }
  }
  
  cancel() {
    this.router.navigateToRoute("list");
  }
  // =====================================上传文件 > ================================
  async chooseFiles() {
    let fileArr = await this.dialogService.chooseFiles();
    this.files = fileArr;
    this.files.forEach(res => {
      this.dir += res.name + ";";
    });
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.cargoInfoId);
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
    await this.dialogService.alert({ title: "上传完成", message: "上传完成，成功上传" + index + "条数据" });
    return;
  }

  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.cargoInfoId + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async delete(data) {
    // let item: AttachmentMap = data.item;
    // let res = await this.attachmentService.getDirKey(this.cargoInfoId);
    // let path = '/' + res.key + '/' + item.uuidName;
    // try {
    //   await this.attachmentService
    //     .deleteAttachments({ baseId: this.cargoInfoId, url: path, uuidName: item.uuidName });
    //   this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    // } catch (err) {
    //   await this.dialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    // }
    let item: AttachmentMap = data.item;
    item.status = 0;
  }
  getPath(uuidName) {
    let path = '/' + this.transfer.cargoInfoId + '/' + uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    return attachmentUrl;
  }
  // ===================================== < 上传文件 ======================================

  /**
   * 新增
   */
  async editTransfer() {
    this.transfer.transferItems = this.cargoItems;
    this.transfer.attachments = this.attachments;
    this.validationController.addObject(this.transfer, transferValidationRules);
    let {results, valid} = await this.validationController.validate();
    console.log('validate', results);
    if (!valid) return;
    for (let item of this.cargoItems) {
      if (item.transferNumber > item.number) {
        this.dialogService.alert({ title: "提示", message: '件数不能大于可转件数', icon: 'error' });
        return;
      }
      if (item.transferQuantity > item.quantity) {
        this.dialogService.alert({ title: "提示", message: '数量不能大于可转数量', icon: 'error' });
        return;
      }
    }
    try {
      console.log('editTransfer', this.transfer);
      await this.cargoownershipTransferService.edit(this.transfer.id, this.transfer);
      await this.dialogService.alert({ title: "提示", message: "修改成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  /**
   * 查看费率 并 添加费率
   */
  async showRate(cargoItem) {
    let cargoRates = [];
    cargoItem.cargoRates.forEach(rate => cargoRates.push(copy(rate)));
    let result = await this.dialogService.open({viewModel: RateView, model: cargoRates, lock: true}).whenClosed();
    if (result.wasCancelled) return;
    let output = result.output;
    
    console.log('old-cargoRates', cargoItem.cargoRates);
    console.log('new-cargoRates', output);
    // 去除临时加的ID 用于删除。 此对象中 orgId为空 
    if (output && output.length > 0) {
      output.forEach(element => {
        if (!element.orgId) {
          element.id = null;
        }
      });
    }
    // 保存变更
    this.cargoItems.forEach(item => {
      if (item.id == cargoItem.id) {
        item.cargoRates = output;
      }
    });
    console.log('new-cargoItems', this.cargoItems);
    this.cargoItemDataSource.read();
  }

  /**
   * 库存信息
   */
  async showStorage(cargoItem) {
    let storageItems = [];
    cargoItem.storageItems.forEach(storage => storageItems.push(copy(storage)));
    let result = await this.dialogService.open({viewModel: StorageItemView, model: {storageItems:storageItems, title: cargoItem.cargoCategoryName}, lock: true}).whenClosed();
    if (result.wasCancelled) return;
    let output = result.output;
    
    console.log('old-storageItems', cargoItem.storageItems);
    console.log('new-storageItems', output);

    // 保存变更
    this.cargoItems.forEach(item => {
      if (item.id == cargoItem.id) {
        item.storageItems = output;
      }
    });
    console.log('new-cargoItems', this.cargoItems);
    this.cargoItemDataSource.read();
  }
}

