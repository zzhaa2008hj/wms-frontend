import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { inject, newInstance } from "aurelia-dependency-injection";
import { StorageItemHistory } from "@app/base/models/storage-item";
import { StorageService } from "@app/base/services/storage";
import { WarehouseService } from "@app/base/services/warehouse";
import { Warehouse } from "@app/base/models/warehouse";
import { ValidationController , ValidationRules } from "aurelia-validation";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";

/**
 * Created by shun on 2017/6/29.
 */
export class NewStorageItem {
  storageItem = {} as StorageItemHistory;
  keywords: string;
  warehouses: Warehouse[] = [];
  warehouse: any;
  storageInfoId: string;
  // 1：正常业务流程；2：库存调整；3：溢短抹平
  types = [{id: 2, name: '库存调整'}, {id: 3, name: '溢短抹平'}];
  businessTypes = [{id: 1, name: '入库'}, {id: 2, name: '出库'}, {id: 3, name: '货权转移'}, 
                    {id: 4, name: '货位转移'}, {id: 5, name: '货物质押'}, {id: 6, name: '合同'}];

  units: DictionaryData[] = [];

  constructor(@inject private router: Router,
              @inject private storageService: StorageService,
              @inject private warehouseService: WarehouseService,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate(params) {
    this.validationController.addObject(this.storageItem, validationRules);
    // 库存表ID
    this.storageInfoId = params.id;
    // 仓库
    this.warehouses = await this.warehouseService.listWarehouse();
    // 单位
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
  }

  async save() {
    this.storageItem.warehouseId = this.warehouse.value();
    this.storageItem.warehouseName = this.warehouse.text();

    let { valid } = await this.validationController.validate();
    if (!valid) return;
    
    try {
      await this.storageService.saveItem(this.storageInfoId, this.storageItem);
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

const validationRules = ValidationRules
 .ensure((item: StorageItemHistory)  => item.type)
  .displayName('类型')
  .required().withMessage(`\${$displayName} 不能为空`)
   .ensure((item: StorageItemHistory)  => item.businessType)
  .displayName('业务类型')
  .required().withMessage(`\${$displayName} 不能为空`)
 .ensure((item: StorageItemHistory)  => item.warehouseId)
  .displayName('库区')
  .required().withMessage(`\${$displayName} 不能为空`)
 .ensure((item: StorageItemHistory)  => item.unit)
  .displayName('单位')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((item: StorageItemHistory)  => item.instockDate)
  .displayName('入库日期')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;