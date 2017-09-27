import { inject } from "aurelia-dependency-injection";
import { PositionTransferItemService } from "@app/cargo-position/services/transfer-info";
import { PositionTransferInfo, PositionTransferItem } from "@app/cargo-position/models/transfer-info";
import { print, addHeader } from "@app/common/services/print-tool";
import * as moment from 'moment';
export class ClientConfirm {
  positionTransferInfo: PositionTransferInfo;

  positionTransferItems: PositionTransferItem[];

  nowDateTime: string = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  constructor(@inject private positionTransferItemService: PositionTransferItemService) {
  }

  async activate(e) {
    this.positionTransferInfo = e;
    await this.positionTransferItemService.getItems(this.positionTransferInfo.id);
  }

  print() {
    let title = "汇款申请单";
    let strHTML = $("#confirm").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }
}