import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoItem } from "@app/instock/models/cargo-item";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { OrganizationService } from "@app/base/services/organization";
import { Organization } from "@app/base/models/organization";

@autoinject
export class Order {
  cargoFlow: CargoFlow;
  cargoItems: CargoItem[];
  organization: Organization;

  constructor(private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private organizationService: OrganizationService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowsById(params.id);
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    this.organization = await this.organizationService.getOrganization(this.cargoFlow.orgId);
    console.log(this.organization);
    console.log(this.cargoItems);
    for (let i = 0; i < this.cargoItems.length; i++) {
      this.cargoItems[i].sequence = i + 1;
    }
  }
}