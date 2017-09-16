import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { OrderItemService } from "@app/instock/services/order-item";
import { OrderItem } from "@app/instock/models/order-item";

@autoinject
export class OrderItems {
  dataSource: kendo.data.DataSource;
  orderItems: OrderItem[];

  constructor(private dialogController: DialogController,
              private orderItemService: OrderItemService) {
  }

  async activate(params) {
    this.orderItems = await this.orderItemService.getOrderItems(params);
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.orderItems);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
  }

  async save() {
    await this.orderItems.map(e => {
      for (let i = 0; i < this.dataSource.data().length; i++) {
        if (e.id == this.dataSource.data()[i].id) {
          e.remark = this.dataSource.data()[i].remark;
          break;
        }
      }
    });
    await this.dialogController.ok(this.orderItems);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}