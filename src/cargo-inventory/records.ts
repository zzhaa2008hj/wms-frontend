import { autoinject, Container } from 'aurelia-dependency-injection';
import { 
  CargoInventoryVO, CargoInventory, CargoInventoryItem, cargoItemsValidationRules 
} from '@app/cargo-inventory/models/cargo-inventoty';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { CargoInventoryService } from '@app/cargo-inventory/services/cargo-inventory';
import { fixDate } from '@app/utils';
import * as moment from 'moment';
import { MessageDialogService } from 'ui';
import { Router } from 'aurelia-router';
import { observable } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

@autoinject
export class Records {

  @observable disabled = false;
  dataSource: kendo.data.DataSource;
  cargoInventoryVO = {} as CargoInventoryVO;
  cargoInventory = {} as CargoInventory;
  inventoryItemList = new Array<CargoInventoryItem>();
  units = [] as DictionaryData[];
  validationController: ValidationController;

  constructor(private cargoInventoryService: CargoInventoryService,
              private router: Router,
              private messageDialogService: MessageDialogService,
              private dictionaryDataService: DictionaryDataService,
              validationControllerFactory: ValidationControllerFactory,              
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);

    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.inventoryItemList);
        },
        update: (options) => {
          options.success();
        }
      },
      schema: {
        model: {
          id: 'id',
          fields: {
            actualNumber: {
              type: 'number',
              validation: { required: true, max: 1000000000 },
              editable: true,
              nullable: false
            },
            actualQuantity: {
              type: 'number',
              validation: { required: true, max: 1000000000 },
              editable: true,
              nullable: false
            },
            cargoName: { editable: false },
            cargoCategoryName: { editable: false },
            instockDate: { editable: false },
            warehouseName: { editable: false },
            inventoryNumber: { editable: false },
            inventoryQuantity: { editable: false },
            unitStr: { editable: false },
            profitLossNumber: { editable: false },
            profitLossQuantity: { editable: false },
            remark: {
              type: 'string',
              validation: { required: false},
              editable: true
            }
          }
        }
      }
    });
  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    if (params.id) {
      this.cargoInventoryVO = await this.cargoInventoryService.getCargoInventory(params.id);
      this.cargoInventory = this.cargoInventoryVO.cargoInventory;
      this.cargoInventory.startTimeStr = moment(this.cargoInventory.startTime).format('YYYY-MM-DD');
      this.cargoInventory.endTimeStr = moment(this.cargoInventory.endTime).format('YYYY-MM-DD');
      if (this.cargoInventory.inventoryCheckDate) {
        this.cargoInventory.inventoryCheckDateStr = moment(this.cargoInventory.inventoryCheckDate).format('YYYY-MM-DD');
        this.cargoInventory.actualCheckDate = new Date(this.cargoInventory.inventoryCheckDateStr);
      }
      this.inventoryItemList = this.cargoInventoryVO.inventoryItemList;
      this.inventoryItemList.map(res => {
        fixDate(res, 'instockDate');
        if (res.unit) {
          res.unitStr = this.units.find(d => d.dictDataCode == res.unit).dictDataName;
        }
        return res;
      });
      this.dataSource.read();
    }
  }

  async save() {
    await this.dataSource.sync();
    this.cargoInventoryVO.cargoInventory = this.cargoInventory;
    this.cargoInventoryVO.inventoryItemList = this.inventoryItemList;

    this.validationController.addObject(this.cargoInventoryVO.cargoInventory, cargoItemsValidationRules);    
    
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      await this.cargoInventoryService.saveItems(this.cargoInventoryVO);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }
}