import { DialogService, DialogController } from "ui";
import { autoinject } from "aurelia-framework";
import { Uploader, Upload } from "@app/upload";

@autoinject
export class UploadConfirm {

  file: File;

  dir: string = '/';

  currentUpload: Upload;

  constructor(private uploader: Uploader,
              private dialogService: DialogService,
              private dialogController: DialogController) {

  }

  async chooseFile() {
    console.log('chooseFile');
    let file = await this.dialogService.chooseFile();
    this.file = file;
  }

  async upload() {
    this.currentUpload = this.uploader.upload(this.file, { path: this.dir + '/' + this.file.name });
    let result = await this.currentUpload.result;
    console.log('result', result);
    this.currentUpload = null;
    //判断上传是否成功
    await this.dialogController.ok(result);
  }

}