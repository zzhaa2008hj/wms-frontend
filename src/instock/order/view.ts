import {Router} from "aurelia-router";
import {inject} from "aurelia-dependency-injection";
import {InstockOrderVo} from "@app/instock/models/instock-order";
import {InstockOrderService} from "@app/instock/services/instock-order";

export class InstockOrderView {
    instockOrderVo: InstockOrderVo;
    datasource: kendo.data.DataSource;

    constructor(@inject private router: Router,
                @inject private instockOrderService: InstockOrderService) {
    }

    /**
     * 路由跳转执行
     */
    async activate({id}) {
        this.instockOrderVo = await this.instockOrderService.getInstockOrder(id);
        this.datasource = new kendo.data.DataSource({
            transport: {
                read: (options) => {
                    options.success(this.instockOrderVo.orderItems);
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
