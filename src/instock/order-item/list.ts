import { autoinject } from "aurelia-dependency-injection";
import { OrderItemService, TallyItemService } from "@app/instock/services/order-item";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

@autoinject
export class OrderItemList {
  batchNumber: string;
  dataSource: kendo.data.DataSource;
  units = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private orderItemService: OrderItemService,
              private tallyItemService: TallyItemService,
              private dataSourceFactory: DataSourceFactory,
              private dictionaryDataService: DictionaryDataService,) {
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orderItemService.queryOrderItems({ batchNumber: this.batchNumber }).map(res => {
        if(res.unit){
          res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            this.tallyItemService.listOrderItems(e.data.id)
              .then(res =>{
                res.map(
                  e =>{
                    if(e.unit){
                    e.unit = this.units.find(r => r.dictDataCode == e.unit).dictDataName;
                    }
                  }
                );
                options.success(res);
              })
              .catch(err => options.error("", "", err));
          }
        },
        filter: { field: 'instockOrderItemId', operator: 'eq', value: e.data.id }
      },
      columns: [
        { field: 'instockDate', title: '入库时间', format: "{0:yyyy-MM-dd}" },
        { field: 'cargoCategoryName', title: '货类' },
        { field: 'cargoSubCategoryName', title: '品牌' },
        { field: 'tallyQuantity', title: '理货数量' },
        { field: 'tallyNumber', title: '理货件数' },
        { field: 'unit', title: '计量单位' }
      ]
    });
  }
}