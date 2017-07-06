import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow, InstockCargoItem } from '@app/instock/models/cargo-flow';
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";
import * as moment from 'moment';

@autoinject
export class Order {
  cargoFlow: CargoFlow;
  cargoItems: InstockCargoItem[];
  organization: Organization;

  constructor(private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private organizationService: OrganizationService) {
  }
  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoFlow.instockDateStr = moment(this.cargoFlow.instockDate).format("YYYY-MM-DD");
    this.cargoFlow.createTimeStr = moment(this.cargoFlow.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    this.organization = await this.organizationService.getOrganization(this.cargoFlow.orgId);
    if (this.cargoFlow.stage == 3) {
      this.cargoFlowService.updateFlowStage(params.id, 4);
    }
  }
}