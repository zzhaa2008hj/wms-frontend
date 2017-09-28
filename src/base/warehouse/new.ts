import { autoinject, Container } from "aurelia-dependency-injection";
import { DialogController, MessageDialogService, DialogService } from "ui";
import { Warehouse, wareHouseValidationRules } from "@app/base/models/warehouse";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";
import { Upload, Uploader } from '@app/upload';
import { AttachmentService } from '@app/common/services/attachment';
import { AttachmentMap } from '@app/common/models/attachment';
import { AttachmentDetail } from '@app/common/attachment/detail';
import { uuid } from '@app/utils';

/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewWarehouse {
  selectedType: any;
  warehouse: Warehouse = {} as Warehouse;
  pWarehouse: Warehouse = {} as Warehouse;
  type = [] as DictionaryData[];
  category = [] as DictionaryData[];
  validationController: ValidationController;

  file: File;
  dir: string = '';
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  constructor(private dialogController: DialogController,
    private dictionaryDataService: DictionaryDataService,
    private dialogService: DialogService,
    private attachmentService: AttachmentService,
    private messageDialogService: MessageDialogService,
    private uploader: Uploader,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(warehouse: Warehouse) {
    this.pWarehouse = warehouse;
    this.type = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.category = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.validationController.addObject(this.warehouse, wareHouseValidationRules);
    this.warehouse.num = 0;
  }

  onSelect(e) {
    let dataItem: DictionaryData = this.selectedType.dataItem(e.item);
    this.warehouse.type = dataItem.dictDataName;
  }
  async chooseFile() {
    this.file = await this.dialogService.chooseFile();
    if (this.file) this.dir = this.file.name + ";";
  }

  async upload() {
    if (!this.warehouse.id) this.warehouse.id = uuid();
    let dir = this.warehouse.id;
    if(this.pWarehouse){
      dir = this.pWarehouse.id;
    }
    let keyRes = await this.attachmentService.getDirKey(dir);
    let fileName = uuid();
    let suffix = this.file.name.split(".")[1];
    let uuidName = fileName + "." + suffix;
    let path = '/' + keyRes.key + '/' + uuidName;
    this.currentUpload = this.uploader.upload(this.file, { path: path });
    let result = await this.currentUpload.result;
    if (result.status == 'success') {
      this.attachments.push({ uuidName: uuidName, realName: this.file.name });
      this.warehouse.num++;
    }
    this.currentUpload = null;
    this.dir = '';
    await this.dialogService.alert({ title: '上传完成', message: '上传完成，成功上传' });
    return;
  }

  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.pWarehouse.id + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async delete(data) {
    let item: AttachmentMap = data.item;
    let res = await this.attachmentService.getDirKey(this.pWarehouse.id);
    let path = '/' + res.key + '/' + item.uuidName;
    try {
      await this.attachmentService
        .deleteAttachments({ baseId: this.pWarehouse.id, url: path, uuidName: item.uuidName });
      this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
      this.warehouse.num--;
    } catch (err) {
      await this.messageDialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    }
  }

  async save() {
    if (this.pWarehouse) {
      this.warehouse.parentId = this.pWarehouse.id;
      this.warehouse.category = this.pWarehouse.category;
    }
    this.warehouse.attachments = this.attachments;
    if (!this.warehouse.type) {
      this.warehouse.type = this.pWarehouse.type;
    }
    this.validationController.addObject(this.warehouse, wareHouseValidationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    await this.dialogController.ok(this.warehouse);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
