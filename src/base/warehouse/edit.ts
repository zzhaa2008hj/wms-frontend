import { observable } from 'aurelia-binding';
import { autoinject, Container } from "aurelia-dependency-injection";
import { Warehouse, wareHouseValidationRules } from "@app/base/models/warehouse";
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { Upload, Uploader } from '@app/upload';
import { AttachmentService } from '@app/common/services/attachment';
import { AttachmentMap } from '@app/common/models/attachment';
import { AttachmentDetail } from '@app/common/attachment/detail';
import { uuid } from '@app/utils';
import { DialogController, DialogService } from "ui";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWarehouse {
  warehouse: Warehouse = {} as Warehouse;
  @observable
  hasParentId: boolean = false;
  type = [] as DictionaryData[];
  category = [] as DictionaryData[];
  validationController: ValidationController;

  file: File;
  dir: string = "";
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];

  constructor(private dialogController: DialogController,
    private dictionaryDataService: DictionaryDataService,
    validationControllerFactory: ValidationControllerFactory,
    private uploader: Uploader,
    private dialogService: DialogService,
    private attachmentService: AttachmentService,
    container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

  }

  async activate(warehouse: Warehouse) {
    this.type = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.category = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    this.warehouse = warehouse;
    if (this.warehouse.parentId) {
      this.hasParentId = true;
    }
    this.validationController.addObject(this.warehouse, wareHouseValidationRules);

    this.warehouse.num = 0;
    let arr = await this.attachmentService.listAttachments({ businessType: 10, businessId: this.warehouse.id });
    if (arr != null && arr.length > 0) {
      arr.forEach(res => {
        let attachment = {} as AttachmentMap;
        attachment.realName = res.attachmentName;
        attachment.uuidName = res.attachmentUrl;
        attachment.status = 2;
        this.attachments.push(attachment);
      });
      this.warehouse.num = this.attachments.length;
    }
  }

  async save() {
    if (this.warehouse.parentId) {
      this.warehouse.attachments = this.attachments;
      this.warehouse.num = this.warehouse.attachments.filter(x => x.status ==1).length;
    }
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.warehouse);
  }

  async chooseFile() {
    this.file = await this.dialogService.chooseFile();
    if (this.file) this.dir = this.file.name + ";";
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.warehouse.parentId);
    let fileName = uuid();
    let suffix = this.file.name.split(".")[1];
    let uuidName = fileName + "." + suffix;
    let path = '/' + keyRes.key + '/' + uuidName;
    this.currentUpload = this.uploader.upload(this.file, { path: path });
    let result = await this.currentUpload.result;
    if (result.status == 'success') {
      this.attachments.push({ uuidName: uuidName, realName: this.file.name, status: 1 });
      this.warehouse.num ++;
    }
    this.currentUpload = null;
    this.dir = '';
    await this.dialogService.alert({ title: "上传完成", message: "上传完成" });
    return;
  }

  async showDetail(data) {
    let item: AttachmentMap = data.item;
    let path = '/' + this.warehouse.parentId + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  delete(data) {
    let item: AttachmentMap = data.item;
    item.status = 0;
    this.warehouse.num--;
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
