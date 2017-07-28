import { CargoInfoService } from '@app/base/services/cargo-info';
import { Router } from "aurelia-router";
import { inject } from "aurelia-dependency-injection";
import { OutstockInventoryVo } from "@app/outstock/models/inventory";
import { OutstockInventoryService } from "@app/outstock/services/inventory";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { OrganizationService } from '@app/base/services/organization';
import { Organization } from '@app/base/models/organization';
import * as moment from 'moment';
import { CargoInfo } from '@app/base/models/cargo-info';

export class OutstockInventoryView {
  outstockInventoryVo: OutstockInventoryVo;
  units = [] as DictionaryData[];
  organization: Organization;
  nowDateTime: string = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  cargoInfo: CargoInfo;
  drivers: string;

  constructor( @inject private router: Router,
    @inject private outstockInventoryService: OutstockInventoryService,
    @inject private dictionaryDataService: DictionaryDataService,
    @inject private organizationService: OrganizationService,
    @inject private cargoInfoService: CargoInfoService) {
  }

  async activate({ id }) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.outstockInventoryVo = await this.outstockInventoryService.getOutstockInventory(id);
    this.organization = await this.organizationService.getOrganization(this.outstockInventoryVo.orgId);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.outstockInventoryVo.cargoInfoId);
    this.outstockInventoryVo.outstockDateStr = moment(this.outstockInventoryVo.outstockInventoryItems[0].outstockDate)
    .format("YYYY-MM-DD");
    let driverArr: string[] = [];
    this.outstockInventoryVo.outstockInventoryItems.map(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        // 只是查看
        item.unit = unit.dictDataName;
      }
      item.outstockDate = new Date(item.outstockDate);
      driverArr.push(item.driver);
    });
    this.drivers = driverArr.join(',');
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
