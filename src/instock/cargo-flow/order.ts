import { DictionaryData } from '../../base/models/dictionary';
import { DictionaryDataService } from '../../base/services/dictionary';

import { autoinject } from "aurelia-dependency-injection";
import { Organization } from '@app/base/models/organization';
import { OrganizationService } from '@app/base/services/organization';
import { CargoFlow, InstockCargoItem } from '@app/instock/models/cargo-flow';
import { CargoFlowService } from '@app/instock/services/cargo-flow';
import { CargoItemService } from '@app/instock/services/cargo-item';
import * as moment from 'moment';
import { MessageDialogService } from 'ui';

@autoinject
export class Order {
  cargoFlow: CargoFlow;
  cargoItems: InstockCargoItem[];
  organization: Organization;
  units = [] as DictionaryData[];

  constructor(private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              private organizationService: OrganizationService) {
  }
  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
    this.cargoFlow.createTimeStr = moment(this.cargoFlow.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.cargoFlow.unit = this.units.find(r => r.dictDataCode == this.cargoFlow.unit).dictDataName;
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    let index = 1;
    this.cargoItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      res.index = index++;
      return res;
    });
    this.organization = await this.organizationService.getOrganization(this.cargoFlow.orgId);
    if (this.cargoFlow.stage == 3) {
      this.cargoFlowService.updateFlowStage(params.id, 4);
    }
  }

  async print() {
    this.messageDialogService.alert({ title: "打印成功", message: "打印成功" });
  }
}