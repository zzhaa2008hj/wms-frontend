import { inject } from "aurelia-dependency-injection";
import { PositionTransferItemService, PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { PositionTransferInfo, PositionTransferItem } from "@app/cargo-position/models/transfer-info";
import { print, addHeader } from "@app/common/services/print-tool";
import * as moment from 'moment';
export class PrintWorkOrder {
  positionTransferInfo: PositionTransferInfo;

  positionTransferItems: PositionTransferItem[];

  nowDateTime: string = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  constructor( @inject private positionTransferItemService: PositionTransferItemService,
    @inject private positionTransferInfoService: PositionTransferInfoService) {
  }

  async activate(params) {
    this.positionTransferInfo = await this.positionTransferInfoService.getById(params.id);
    this.positionTransferItems = await this.positionTransferItemService.getItems(this.positionTransferInfo.id);
    //alert(this.positionTransferInfo.demandFrom);
    if(this.positionTransferInfo.stage == 4) {
        this.positionTransferInfoService.updateGenerateWorkOrder(params.id);
    }
  }

  print() {
    let title = "汇款申请单";
    let strHTML = $("#confirm").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }
}