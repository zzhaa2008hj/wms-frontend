import {Router} from "aurelia-router";
import {inject} from "aurelia-dependency-injection";
import {OutstockInventoryVo} from "@app/outstock/models/inventory";
import {OutstockInventoryService} from "@app/outstock/services/inventory";
import {fixDate} from "@app/utils";

export class OutstockInventoryView {
    outstockInventoryVo: OutstockInventoryVo;
    datasource: kendo.data.DataSource;

    constructor(@inject private router: Router,
                @inject private outstockInventoryService: OutstockInventoryService) {
    }

    async activate({id}) {
        this.outstockInventoryVo = await this.outstockInventoryService.getOutstockInventory(id);
        this.datasource = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    options.success(this.outstockInventoryVo.outstockInventoryItems.map(item => fixDate(item, "outstockDate")));
                }
            },
            schema: {
                model: {
                    id: 'id'
                }
            }
        });
    }

    cancel() {
        this.router.navigateToRoute("list");
    }
}
