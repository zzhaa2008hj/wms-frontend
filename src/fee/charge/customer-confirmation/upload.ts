import { autoinject } from "aurelia-dependency-injection";
import { DialogController, DialogService, MessageDialogService } from "ui";
import { AttachmentService } from "@app/common/services/attachment";
import { uuid } from "@app/utils";
import { AttachmentMap } from "@app/common/models/attachment";
import { Upload, Uploader } from "@app/upload";
@autoinject
export class NewUpload {
  files: File[];
  dir: string = '';
  currentUpload: Upload;
  attachments = [] as AttachmentMap[];
  chargeInfoId: string;

  constructor(private dialogController: DialogController,
              private dialogService: DialogService,
              private uploader: Uploader,
              private messageDialogService: MessageDialogService,
              private attachmentService: AttachmentService) {
  }

  async activate(chargeInfoId: string) {
    this.chargeInfoId = chargeInfoId;
  }

  async chooseFiles() {
    let fileArr = await this.dialogService.chooseFiles();
    this.files = fileArr;
    this.files.forEach(res => {
      this.dir += res.name + ';';
    });
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.chargeInfoId);

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

  async delete(data) {
    let item: AttachmentMap = data.item;
    let res = await this.attachmentService.getDirKey(this.chargeInfoId);
    let path = '/' + res.key + '/' + item.uuidName;
    try {
      await this.attachmentService.deleteAttachments({ baseId: this.chargeInfoId, url: path, uuidName: item.uuidName });
      this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    } catch (err) {
      await this.messageDialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    }
  }

  async save() {
    await this.dialogController.ok();
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}