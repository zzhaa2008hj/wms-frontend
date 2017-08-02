import { autoinject } from 'aurelia-dependency-injection';
import { DialogController } from 'ui';

@autoinject
export class AttachmentDetail {

  imgSrc: string;

  constructor(private dialogController: DialogController) {
  }

  async activate(url: string) {
    this.imgSrc = url;
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}