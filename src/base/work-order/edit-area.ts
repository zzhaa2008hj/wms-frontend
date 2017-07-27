import { inject, newInstance } from "aurelia-dependency-injection";
import { bindable, customElement } from "aurelia-templating";
import { observable } from "aurelia-framework";
import { RouterParams } from '@app/common/models/router-params';
import { WarehouseService } from "@app/base/services/warehouse";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { WorkOrderArea } from "@app/instock/models/work";
import { NewWorkItem } from "./items";
import { EditItems } from "./edit-items";
import { EventAggregator, Subscription } from "aurelia-event-aggregator";
import { NewWorkOrder } from "./new";
import { MessageDialogService } from "ui";
import { EditWorkOrder } from "./edit";
import { WorkAreaService } from "@app/base/services/work";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { formValidationRenderer } from "@app/validation/support";

@customElement('work-area-edit')
export class EditWorArea {

  @bindable
  @observable
  workOrderId: string;

  @bindable
  @observable
  businessId: string;

  @bindable
  @observable
  disabled: boolean;

  newWorkItem: NewWorkItem;

  datasource: kendo.data.DataSource;

  itemsDataSources = new Map<string, kendo.data.DataSource>();

  items = new Set<EditItems>();

  resBinds = new Set<Subscription>();

  warehouseSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.warehouseService.getWarehouses(this.businessId, this.routerParams.type)
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  unitSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.dictionaryDataService
          .getDictionaryDatas("unit")
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  containerTypeSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.dictionaryDataService
          .getDictionaryDatas("containerType")
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  constructor(@inject('routerParams') private routerParams: RouterParams,
              @inject private warehouseService: WarehouseService,
              @inject private dictionaryDataService: DictionaryDataService,
              @newInstance() private validationAreaController: ValidationController,
              @inject private eventAggregator: EventAggregator,
              @inject private newWorkOrder: NewWorkOrder,
              @inject private messageDialogService: MessageDialogService,
              @inject private editWorkOrder: EditWorkOrder,
              @inject private workAreaService: WorkAreaService,
              @inject private workOrderItemService: WorkOrderItemService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: options => {
          this.workAreaService.getByWorkOrderId(this.workOrderId)
            .then(options.success)
            .catch(err => options.error("", "", err));
        },
        update: (options) => {
          options.success();
        }
        ,
        destroy: (options) => {
          options.success();
        }
        ,
        create: async options => {
          options.success();
        }
      },
      schema: {
        model: {
          fields: {
            workItemId: {
              editable: false, nullable: true
            },
            workId: {
              type: 'string',
              validation: { required: true }
            },
            quantity: {
              type: 'number',
              validation: { min: 0, max: 1000000000000000 }
            },
            number: {
              type: 'number',
              validation: { min: 0, max: 1000000000000000 }
            },
            containerType: {
              type: 'string'
            },
            containerNumber: {
              type: 'string'
            },
            sign: {
              type: 'string'
            },
            customerId: {
              type: 'string',
              validation: { required: true }
            },
            remark: {
              type: 'string',
              validation: { required: true }
            }
          }
        }
      }
    });


    this.datasource.bind("change", (e) => {
      for (let i = 0; i < e.items.length; i++) {
        let itemDatasource = new kendo.data.DataSource({
          transport: {
            read: options => {
              this.workOrderItemService.getWorkOrderItems(e.items[i].id)
                .then(options.success)
                .catch(err => options.error("", "", err));
            }
          },
          schema: {
            model: {
              fields: {
                workName: { editable: false },
                workNumber: {
                  editable: false,
                  notify: true,
                  type: 'number',
                  validation: { required: true, min: 0, max: 1000000000000000 },
                  title: '作业数量'
                },
                customerName: { editable: false },
                remark: { editable: false },
              }
            }
          }
        });

        this.itemsDataSources.set(e.items[i].uid, itemDatasource);
      }

      if (e.action == "remove") {
        this.datasource.remove(e.items);
        this.itemsDataSources.delete(e.items.uid);
      }

      if (e.action == "add") {
        let itemDataSource = new kendo.data.DataSource({
          schema: {
            model: {
              fields: {
                workName: { editable: false },
                workNumber: {
                  editable: false,
                  notify: true,
                  type: 'number',
                  validation: { required: true, min: 0, max: 1000000000000000 },
                  title: '作业数量'
                },
                customerName: { editable: false },
                remark: { editable: false },
              }
            }
          }
        });

        this.itemsDataSources.set(e.items.uid, itemDataSource);

      }

    });

    this.validationAreaController.addRenderer(formValidationRenderer);

    this.editWorkOrder.getAreaDatasource(this.datasource);

    this.editWorkOrder.getItemsDataSources(this.itemsDataSources);

  }


  instockCargoIdChanged() {
    this.warehouseSource.read();
  }

  async add() {
    let resVerify = await Promise.all([...this.items].map(item => item.verify())).then(arr => arr.every(e => e));
    if (!resVerify) {
      await this.messageDialogService.alert({ title: "提示", message: "输入内容不规范请检查输入内容" });
      return;
    }
    let res = this.datasource.add({});

    let itemDataSource = new kendo.data.DataSource({
      schema: {
        model: {
          fields: {
            workName: { editable: false },
            workNumber: {
              editable: false,
              notify: true,
              type: 'number',
              validation: { required: true, min: 0, max: 1000000000000000 },
              title: '作业数量'
            },
            customerName: { editable: false },
            remark: { editable: false },
          }
        }
      }
    });

    this.itemsDataSources.set(res.uid, itemDataSource);

    this.newWorkOrder.getItemsDataSources(this.itemsDataSources);
  }

  remove(e) {
    this.datasource.remove(e);
    this.itemsDataSources.delete(e.uid);
  }

  getNewDataSourceByUid(uid: string) {
    return this.itemsDataSources.get(uid);
  }

  detailInit() {
  }

  async verify() {
    let len = this.datasource.data().length;
    for (let i = 0; i < len; i++) {
      this.validationAreaController.addObject(this.datasource.data()[i], workOrderAreaRules);
    }

    let { valid } = await this.validationAreaController.validate();

    let res = await Promise.all([...this.items].map(item => item.verify())).then(arr => arr.every(e => e));

    return valid && res;
  }

  onItemAdd(item: EditItems) {
    this.items.add(item);
  }

  onItemRemove(item: EditItems) {
    this.items.delete(item);
  }

  bind() {
    let resBind = this.eventAggregator.subscribe("item:bind", e => this.onItemAdd(e));
    if (!!resBind) {
      this.resBinds.add(resBind);
    }
    let resUnBind = this.eventAggregator.subscribe("item:unbind", e => this.onItemRemove(e));
    if (!!resUnBind) {
      this.resBinds.add(resUnBind);
    }
  }

  unbind() {
    [...this.resBinds].forEach(e => e.dispose());
  }

  workOrderIdChanged() {
    alert(this.workOrderId);
  }

}

const workOrderAreaRules = ValidationRules
  .ensure((workOrderArea: WorkOrderArea) => workOrderArea.warehouseId)
  .displayName("作业区域")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((workOrderArea: WorkOrderArea) => workOrderArea.quantity)
  .displayName("作业数量")
  .required().withMessage(`\${$displayName}不能为空`)
  .satisfies(x => x <= 1000000000000000 && x >= 0)
  .withMessage(`\${$displayName} 为无效值`)

  .ensure((workOrderArea: WorkOrderArea) => workOrderArea.number)
  .displayName("作业件数")
  .required().withMessage(`\${$displayName}不能为空`)
  .satisfies(x => x <= 1000000000000000 && x >= 0)
  .withMessage(`\${$displayName} 为无效值`)
  .rules;  