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
import { CargoFlowSeparate } from '@app/instock/models/cargo-flow-separate';
import { CargoFlowSeparateService } from '@app/instock/services/cargo-flow-seperate';

@autoinject
export class SeparateOrder {

  separate: CargoFlowSeparate;
  cargoFlow: CargoFlow;
  cargoItems: InstockCargoItem[];
  organization: Organization;
  units = [] as DictionaryData[];

  constructor(private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private cargoFlowSeparateService: CargoFlowSeparateService,
              private dictionaryDataService: DictionaryDataService,
              private organizationService: OrganizationService) {

  }

  async activate(params) {
    this.separate = await this.cargoFlowSeparateService.getCargoFlowSeparateById(params.id);
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.cargoFlow = await this.cargoFlowService.getCargoFlowByFlowNumber(this.separate.secondNumberAfterSeparate);
    this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
    this.cargoFlow.createTimeStr = moment(this.cargoFlow.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.cargoFlow.unit = this.units.find(r => r.dictDataCode == this.cargoFlow.unit).dictDataName;
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(this.cargoFlow.id);
    let index = 1;
    this.cargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      res.index = index++;
      return res;
    });
    this.organization = await this.organizationService.getOrganization(this.cargoFlow.orgId);
  }

  async printOrder() {
    let title = "拆单指令单";
    let strHTML = $('#order').html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}