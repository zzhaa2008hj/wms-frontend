import { inject } from "aurelia-dependency-injection";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { PositionTransferItemService } from "@app/cargo-position/services/transfer-info";

export class VerifyWarehouse {
  datasource: kendo.data.DataSource;

  units = [] as DictionaryData[];

  constructor(@inject private dictionaryDataService: DictionaryDataService,
              @inject private positionTransferItemService: PositionTransferItemService) {
  }

  async activate(param) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');

    this.datasource = new kendo.data.DataSource({
      transport: {
        read: options => {
          this.positionTransferItemService.getItems(param.id)
            .then(res => {
              res.map(e => {
                if (e.unit) {
                  e.unit = this.units.find(r => r.dictDataCode == e.unit).dictDataName;
                }
              });
              options.success(res);
            })
            .catch(err => options.error("", "", err));
        }
      }
    });
  }
}