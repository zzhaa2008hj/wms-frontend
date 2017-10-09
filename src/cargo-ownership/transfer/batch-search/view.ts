import { CargoownershipTransfer, CargoownershipTransferItem } from "@app/cargo-ownership/models/cargo-ownership";
import { CargoownershipTransferService } from "@app/cargo-ownership/services/cargo-ownership";
import { inject } from "aurelia-dependency-injection";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DialogController } from "ui";

export class BtnSearchView{
  transfer = {} as CargoownershipTransfer ;
  id: string;
  type;
  //货物信息
  cargoInfo = [] as CargoownershipTransferItem[];


  constructor(@inject private  cargoownershipTransferService: CargoownershipTransferService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private dialogCotroller : DialogController ) {
  }

  async activate(params) {
    this.transfer =  await this.cargoownershipTransferService.queryById(params.id);
    this.cargoInfo = await this.cargoownershipTransferService.getCargoItemsById(params.id);
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.cargoInfo.map(res => {
      let dict = units.find(r => r.dictDataCode == res.unit);
      if (dict) {
        res.unitStr = dict.dictDataName;
      }
      return res;
    });
  }

  async  close(){
    await this.dialogCotroller.cancel();
  }

}



