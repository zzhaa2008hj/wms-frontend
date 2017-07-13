import { autoinject } from "aurelia-dependency-injection";
import { WorkAreaService } from "@app/base/services/work";
import { DataSourceFactory } from "@app/utils";
import { WorkOderItemService } from "@app/instock/services/work-order";
import { DictionaryDataService } from "@app/base/services/dictionary";


@autoinject
export class VeiwWorkItem {

  datasource: kendo.data.DataSource;  

  constructor(private dataSourceFactory: DataSourceFactory,
              private workAreaService: WorkAreaService,
              private workOrderItemService: WorkOderItemService,
              private dictionaryDataService: DictionaryDataService) {

  }

  activate(model) {
    this.datasource = this.dataSourceFactory.create({
        query: () => this.workAreaService.queryWorkAreaPage(model.id),
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

 getDictDataName(dataCode: string){
   return this.dictionaryDataService.getDictionaryDataByCodes("UNIT",dataCode).then(res => res.dictDataName);
   // console.log(aa.dictDataName);
  }
}
