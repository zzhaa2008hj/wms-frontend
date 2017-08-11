import { HttpClient } from "aurelia-http-client";
import { DialogService } from "ui";
import { autoinject } from "aurelia-framework";
import { Uploader, Upload } from "@app/upload";

@autoinject
export class UploadDemo {

  file: File;

  dir: string = '';

  currentUpload: Upload;

  private http: HttpClient;

  constructor(private uploader: Uploader, private dialogService: DialogService) {
    this.http = new HttpClient();
    this.http.configure(builder => builder
      .withBaseUrl(uploader['options'].baseUrl)
    );
  }

  async chooseFile() {
    console.log('chooseFile');
    let file = await this.dialogService.chooseFile();
    this.file = file;
  }

  async upload() {
    let { key: dirKey } = await this.reserveDir(this.dir);

    this.currentUpload = this.uploader.upload(this.file, { path: '/' + dirKey + '/' + this.file.name });
    let result = await this.currentUpload.result;
    console.log('result', result);
    this.currentUpload = null;
  }

  reserveDir(path: string): Promise<{key: string}> {
    return this.http.put(path, {}).then(res => res.content);
  }

}