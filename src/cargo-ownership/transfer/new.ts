import { Router } from "aurelia-router";
import { Container, inject } from 'aurelia-dependency-injection';
import { CargoInfo } from '@app/base/models/cargo-info';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DialogService } from "ui";
import { CargoInfoService } from '@app/base/services/cargo-info';
import { observable } from 'aurelia-framework';
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { copy, uuid, accAdd } from "@app/utils";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { Uploader, Upload } from "@app/upload";
import { AttachmentDetail } from "@app/common/attachment/detail";
import { CargoownershipTransfer, transferValidationRules, TransferCargoItemVo } from '@app/cargo-ownership/models/cargo-ownership';
import { CargoownershipTransferService } from '@app/cargo-ownership/services/cargo-ownership';
import { RateView } from '@app/cargo-ownership/transfer/rate';
import { StorageItemView } from '@app/cargo-ownership/transfer/storage';
import { ContractService } from '@app/base/services/contract';
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
  selectedNewBatchNumber: any;
  selectedOutFeeCustomer: any;
  baseAgent = [];
  baseCustomer = [];
  baseNewAgent = [];
  baseNewCustomer = [];
  baseNewBatchNumber = new kendo.data.HierarchicalDataSource({
    data: []
  });
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
              @inject private cargoInfoService: CargoInfoService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject validationControllerFactory: ValidationControllerFactory,
              @inject container: Container,
              @inject private attachmentService: AttachmentService,
              @inject private uploader: Uploader,
              @inject private cargoownershipTransferService: CargoownershipTransferService,
              @inject private contractService: ContractService) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.cargoInfoId = uuid();
    this.transfer.batchNumberMode = 0;
    this.transfer.cargoInfoId = this.cargoInfoId;
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.baseCargoInfo = await this.cargoInfoService.listBaseCargoInfos({ instockStatus: 1 });
    if (this.baseCargoInfo) {
      let agentIds = Array.from(new Set(this.baseCargoInfo.map(info => info.agentId)));
      agentIds.forEach(id => {
        let agentName = this.baseCargoInfo.find(info => info.agentId == id).agentName;
        this.baseAgent.push({id: id, name: agentName});
      });

      let customerIds = Array.from(new Set(this.baseCargoInfo.map(info => info.customerId)));
      customerIds.forEach(id => {
        let customerName = this.baseCargoInfo.find(info => info.customerId == id).customerName;
        this.baseCustomer.push({id: id, name: customerName});
      });
    }
    // 新客户从合同中取
    let contracts = await this.contractService.contractList(1);
    if (contracts && contracts.length > 0) {
      let customers = contracts.map(t => Object.assign({id: t.customerId, name: t.customerName}));
      this.baseNewAgent = customers;
      this.baseNewCustomer = customers;
    }
  }
  
  async onSelectAgent() {
    let agentId = this.selectedAgent.value();
    if (!this.selectedCustomer.value() || this.selectedCustomer.value() === '') {
      this.selectedCustomer.value(agentId);
      this.onSelectedCustomer();
      this.transfer.originalCustomerId = this.selectedCustomer.value();
    }
  }

  async onSelectedCustomer() {
    let customerId = this.selectedCustomer.value();
    let batchNumbers = this.baseCargoInfo.filter(info => info.customerId == customerId)
    .map(info => Object.assign({id: info.batchNumber, name: info.batchNumber}));
    this.baseBatchNumber.data(batchNumbers);
  }

  /**
   * 批次获取货物
   */
  async onSelectBatchNumber() {
    this.cargoItems = [];
    let batchNumber = this.selectedBatchNumber.value();
    let newCustomer = this.selectedNewCustomer.value();
    if (!batchNumber) {
      this.dialogService.alert({ title: '提示', message: '请先选择批次号', icon: 'error' });
      return;
    }
    if (!newCustomer) {
      this.dialogService.alert({ title: '提示', message: '请先选择新客户', icon: 'error' });
      return;
    }
    this.cargoItems = await this.cargoownershipTransferService.getCargoItems(newCustomer, batchNumber);
    if (this.cargoItems.length == undefined) {
      let errMessage = Object.assign({code: 0, message: '', content: ''}, this.cargoItems);
      this.dialogService.alert({ title: '提示', message: errMessage.message, icon: 'error' });
      this.cargoItems = [];
      this.cargoItemDataSource.read();
      return;
    }
    if (this.cargoItems.length > 0) {
      this.cargoItems.forEach(item => {
        let unit = this.units.find(u => u.dictDataCode == item.unit);
        if (unit) {
          item.unitName = unit.dictDataName;
        }
      });
    }
    console.log('cargoItems', this.cargoItems);
    this.cargoItemDataSource.read();
  }

  async onSelectNewAgent() {
    let agentId = this.selectedNewAgent.value();
    if (!this.selectedNewCustomer.value() || this.selectedNewCustomer.value() === '') {
      this.selectedNewCustomer.value(agentId);
      this.transfer.newCustomerId = this.selectedNewCustomer.value();
    }
  }
  // 出库费用承担方  原 + 旧
  async onSelectOutFeeCustomer() {
    let customerId = this.selectedCustomer.value();
    let customerName = this.selectedCustomer.text();
    let newCustomerId = this.selectedNewCustomer.value();
    let newCustomerName = this.selectedNewCustomer.text();
    this.baseOutFeeCustomer.data([{id: customerId, name: customerName}, {id: newCustomerId, name: newCustomerName}]);
  }

  async onClickNewBatchNumber() {
    if (!this.selectedBatchNumber.value()) {
      this.dialogService.alert({ title: '提示', message: '请先选择批次', icon: 'error' });
      return;
    }
    let customerId = this.selectedNewCustomer.value();
    if (!customerId) {
      this.dialogService.alert({ title: '提示', message: '请先选择新客户', icon: 'error' });
      return;
    }
    this.transfer.transferDateStr = moment(this.transfer.transferDate).format("YYYY-MM-DD");
    let cargoCategoryIds = this.cargoItems.map(item => item.cargoCategoryId).join(',');
    let batchNumbers = await this.cargoownershipTransferService.getNewBatchNumber(customerId, this.transfer.transferDateStr, cargoCategoryIds);
    batchNumbers = batchNumbers.map(batchNumber => Object.assign({id: batchNumber, name: batchNumber}));
    this.baseNewBatchNumber.data(batchNumbers);
  }

  async getBatchNumber(transferDate, customerId) {
    this.transfer.transferDateStr = moment(transferDate).format("YYYY-MM-DD");
    let cargoCategoryIds = this.cargoItems.map(item => item.cargoCategoryId).join(',');
    let batchNumbers = await this.cargoownershipTransferService.getNewBatchNumber(customerId, this.transfer.transferDateStr, cargoCategoryIds);
    batchNumbers = batchNumbers.map(batchNumber => Object.assign({id: batchNumber, name: batchNumber}));
    this.baseNewBatchNumber.data(batchNumbers);
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
    let item: AttachmentMap = data.item;
    let res = await this.attachmentService.getDirKey(this.cargoInfoId);
    let path = '/' + res.key + '/' + item.uuidName;
    try {
      await this.attachmentService
        .deleteAttachments({ baseId: this.cargoInfoId, url: path, uuidName: item.uuidName });
      this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    } catch (err) {
      await this.dialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    }
  }
  // ===================================== < 上传文件 ======================================

  /**
   * 新增
   */
  async addTransfer() {
    this.transfer.originalAgentName = this.selectedAgent.text();
    this.transfer.originalCustomerName = this.selectedCustomer.text();
    this.transfer.originalCustomerId = this.selectedCustomer.value();
    this.transfer.newAgentName = this.selectedNewAgent.text();
    this.transfer.newCustomerName = this.selectedNewCustomer.text();
    this.transfer.newCustomerId = this.selectedNewCustomer.value();
    this.transfer.outstockChargePayerName = this.selectedOutFeeCustomer.text();
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
      let sumN: number = 0, sumQ: number = 0;
      for (let s of item.storageItems) {
        sumN = accAdd(sumN, s.storageNumber);
        sumQ = accAdd(sumQ, s.storageQuantity);
      }
      if (item.transferNumber !== sumN) {
        this.dialogService.alert({ title: "提示", message: '库区总件数与货物件数不一致', icon: 'error' });
        return;
      }
      if (item.transferQuantity !== sumQ) {
        this.dialogService.alert({ title: "提示", message: '库区总数与货物数不一致', icon: 'error' });
        return;
      }
    }
    try {
      console.log('saveTransfer', this.transfer);
      await this.cargoownershipTransferService.createCargoownershipTransfer(this.transfer);
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  /**
   * 移除货物
   */
  async deleteCargoItem(id) {
    let confirm = await this.dialogService.confirm({ title: "提示", message: "确定删除该货物吗？" });
    if (!confirm) return;
    this.cargoItems = this.cargoItems.filter(item => item.id != id);
    this.cargoItemDataSource.read();
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

  onTransferDateChange() {
    let startDate = this.transferDateDatePicker.value();
    if (startDate) {
      let date = new Date(startDate);
      this.storageEndDatePicker.value(date);
      this.storageEndDatePicker.min(date);
      this.transfer.storageEndDate = date;
    }
  }
}

