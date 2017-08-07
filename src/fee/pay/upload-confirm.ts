import { DialogService, DialogController } from "ui";
import { autoinject } from "aurelia-framework";
import { Uploader, Upload } from "@app/upload";
import { AttachmentService } from "@app/common/services/attachment";
import { AttachmentMap } from "@app/common/models/attachment";
import { uuid } from "@app/utils";
import { AttachmentDetail } from "@app/common/attachment/detail";

@autoinject
export class UploadConfirm {

  file: File;

  dir: string;

  currentUpload: Upload;

  files: File[];

  id: string;

  attachments = [] as AttachmentMap[];

  disabled: boolean = false;


  constructor(private uploader: Uploader,
              private dialogService: DialogService,
              private dialogController: DialogController,
              private attachmentService: AttachmentService) {
  }

  activate(id) {
    this.id = id;
  }

  async chooseFiles() {
    let fileArr = await this.dialogService.chooseFiles();
    this.files = fileArr;
    this.files.forEach(res => {
      this.dir += res.name + ';';
    });
  }

  async upload() {
    let keyRes = await this.attachmentService.getDirKey(this.id);

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
    let path = '/' + this.id + '/' + item.uuidName;
    let attachmentUrl = this.attachmentService.view(path);
    let result = await this.dialogService
      .open({ viewModel: AttachmentDetail, model: attachmentUrl, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  async delete(data) {
    let item: AttachmentMap = data.item;
    let res = await this.attachmentService.getDirKey(this.id);
    let path = '/' + res.key + '/' + item.uuidName;
    try {
      await this.attachmentService
        .deleteAttachments({ baseId: this.id, url: path, uuidName: item.uuidName });
      this.attachments = this.attachments.filter(res => res.uuidName != item.uuidName);
    } catch (err) {
      await this.dialogService.alert({ title: "删除失败", message: err.message, icon: "error" });
    }
  }

  async finish() {
    this.disabled = true;
    if (this.attachments.length == 0) {
      this.disabled = false;
      await this.dialogService.alert({ title: "提示", message: "上传内容不可为空" });
      return;
    }
    await this.dialogController.ok(this.attachments);
  }

  async cancle() {
    await this.dialogController.cancel();
  }

}