import { autoinject } from "aurelia-dependency-injection";
import { Organization } from '@app/base/models/organization';
import { OrganizationService } from '@app/base/services/organization';
import { CargoFlow, InstockCargoItem } from '@app/instock/models/cargo-flow';
import { CargoFlowService } from '@app/instock/services/cargo-flow';
import { CargoItemService } from '@app/instock/services/cargo-item';
import * as moment from 'moment';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { print, addHeader } from '@app/common/services/print-tool';
import { InstockVehicle } from "@app/instock/models/instock-vehicle";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle"

@autoinject
export class Order {
  cargoFlow: CargoFlow;
  cargoItems: InstockCargoItem[];
  instockVehicles: InstockVehicle[];
  organization: Organization;
  units = [] as DictionaryData[];

  constructor(private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private dictionaryDataService: DictionaryDataService,
              private organizationService: OrganizationService,
              private instockVehicleService: InstockVehicleService) {
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
    this.cargoFlow.createTimeStr = moment(this.cargoFlow.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.cargoFlow.unit = this.units.find(r => r.dictDataCode == this.cargoFlow.unit).dictDataName;
    this.instockVehicles = await this.instockVehicleService.getVehiclesByFlowId(params.id);
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    let index = 1;
    this.cargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      res.index = index++;
      return res;
    });
    this.organization = await this.organizationService.getOrganization(this.cargoFlow.orgId);
  }

  async printOrder() {
    let title = "入库作业指令单";
    let strHTML = $('#order').html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}