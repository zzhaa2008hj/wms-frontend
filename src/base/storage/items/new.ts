import { DialogService } from "ui";
import { Router } from "aurelia-router";
import { inject, newInstance } from "aurelia-dependency-injection";
import { StorageItemHistory, StorageInfo } from '@app/base/models/storage';
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
  storageInfo: StorageInfo;
  // 1：正常业务流程；2：库存调整；3：溢短抹平
  types = [{id: 2, name: '库存调整'}, {id: 3, name: '溢短抹平'}];
  businessTypes = [{id: 1, name: '入库业务'}, {id: 2, name: '出库业务'}];

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
    this.storageItem.type = 2;
    this.storageItem.businessType = 1;
    this.storageItem.storageQuantity = 0.00;
    this.storageItem.storageNumber = 0;
    this.storageItem.storageInfoId = this.storageInfoId;
    this.storageInfo = await this.storageService.getStorageInfoById(this.storageInfoId);
    this.storageItem.unit = this.storageInfo.unit;
  }

  typeChanged() {
    this.storageItem.warehouseId = '';
    this.storageItem.warehouseName = '';
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.disabled = true;
    try {
      await this.storageService.saveItem(this.storageInfoId, this.storageItem);
      await this.dialogService.alert({ title: "提示", message: "保存成功"});
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
    let result = await this.dialogService
      .open({ viewModel: WarehouseTree, model: this.storageItem, lock: true })
      .whenClosed();
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
  // .ensure((item: StorageItemHistory)  => item.instockDate)
  // .displayName('日期')
  // .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((item: StorageItemHistory)  => item.containerNumber)
  .displayName('集装箱号')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((item: StorageItemHistory)  => item.storageQuantity)
  .displayName('数量')
  .required().withMessage(`\${$displayName} 不能为空`)  
  .satisfies(x => !(x < 0))
  .withMessage(`\${$displayName} 为无效值`)

  .ensure((item: StorageItemHistory)  => item.storageNumber)
  .displayName('件数')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies(x => !(x < 0))
  .withMessage(`\${$displayName} 为无效值`)
  .rules;