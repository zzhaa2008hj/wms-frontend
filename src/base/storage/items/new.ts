import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { inject, newInstance } from "aurelia-dependency-injection";
import { StorageItemHistory } from "@app/base/models/storage";
import { StorageService } from "@app/base/services/storage";
import { ValidationController , ValidationRules } from "aurelia-validation";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { formValidationRenderer } from "@app/validation/support";
import { WarehouseTree } from "@app/base/storage/items/warehouse-tree";
/**
 * Created by shun on 2017/6/29.
 */
export class NewStorageItem {
  disabled: boolean = false;
  storageItem = {} as StorageItemHistory;
  storageInfoId: string;
  // 1：正常业务流程；2：库存调整；3：溢短抹平
  types = [{id: 2, name: '库存调整'}, {id: 3, name: '溢短抹平'}];
  businessTypes = [{id: 1, name: '入库业务'}, {id: 2, name: '出库业务'}, {id: 3, name: '货权转移'}, 
                    {id: 4, name: '货位转移'}, {id: 7, name: '零星作业'}];

  units: DictionaryData[] = [];
  title: string;
  constructor(@inject private router: Router,
              @inject private storageService: StorageService,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController,
              @inject private dictionaryDataService: DictionaryDataService) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    this.validationController.addObject(this.storageItem, validationRules);
    // 库存表ID
    this.storageInfoId = params.id;
    // 单位
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');

    let info = await this.storageService.getStorageInfoById(this.storageInfoId);
    this.title = info.customerName;
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.disabled = true;
    try {
      await this.storageService.saveItem(this.storageInfoId, this.storageItem);
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

  async selected() {
    let result = await this.dialogService.open({ viewModel: WarehouseTree, model: {}, lock: true }).whenClosed();
    if (result.wasCancelled) return;
    this.storageItem.warehouseId = result.output.id;
    this.storageItem.warehouseName = result.output.name;
  }

}

const validationRules = ValidationRules
 .ensure((item: StorageItemHistory)  => item.type)
  .displayName('类型')
  .required().withMessage(`\${$displayName} 不能为空`)
   .ensure((item: StorageItemHistory)  => item.businessType)
  .displayName('业务类型')
  .required().withMessage(`\${$displayName} 不能为空`)
 .ensure((item: StorageItemHistory)  => item.warehouseName)
  .displayName('库区')
  .required().withMessage(`\${$displayName} 不能为空`)
 .ensure((item: StorageItemHistory)  => item.unit)
  .displayName('单位')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((item: StorageItemHistory)  => item.instockDate)
  .displayName('入库日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((item: StorageItemHistory)  => item.containerNumber)
  .displayName('集装箱号')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((item: StorageItemHistory)  => item.storageQuantity)
  .displayName('堆存数量')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((item: StorageItemHistory)  => item.storageNumber)
  .displayName('堆存件数')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((item: StorageItemHistory)  => item.position)
  .displayName('坐标')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)
  .rules;