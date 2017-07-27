import { autoinject } from "aurelia-dependency-injection";
import { WorkAreaService } from "@app/base/services/work";
import { DataSourceFactory } from "@app/utils";
import { WorkOrderItemService } from "@app/instock/services/work-order";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';


@autoinject
export class VeiwWorkItem {

  datasource: kendo.data.DataSource;

  unit = [] as DictionaryData[];

  constructor(private dataSourceFactory: DataSourceFactory,
              private workAreaService: WorkAreaService,
              private workOrderItemService: WorkOrderItemService,
              private dictionaryDataService: DictionaryDataService) {

  }

  async activate(model) {
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.datasource = this.dataSourceFactory.create({
      query: () => this.workAreaService.queryWorkAreaPage(model.id)
        .map(res => {
          if (res.unit) {
            res.unit = this.unit.find(r => r.dictDataCode == res.unit).dictDataName;
          }
          return res;
        }),
      pageSize: 10
    });
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.workItem').kendoGrid({
      dataSource: {
        transport: {
          read: options => {
            this.workOrderItemService.getWorkOrderItems(e.data.id)
              .then(options.success)
              .catch(err => options.error("", "", err));
          }
        }
      },
      columns: [
        { field: 'workName', title: '作业内容' },
        { field: 'workNumber', title: '作业数量' },
        { field: 'customerName', title: '作业单位' },
        { field: 'remark', title: '备注' }
      ]
    });
  }

}
