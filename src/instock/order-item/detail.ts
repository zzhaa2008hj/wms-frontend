import { autoinject } from 'aurelia-dependency-injection';
import { OrderItemService, TallyItemService } from '@app/instock/services/order-item';
import { OrderItem, TallyItem } from '@app/instock/models/order-item';
import { OrganizationService } from '@app/base/services/organization';
import { Organization } from '@app/base/models/organization';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import * as moment from 'moment';
import { addHeader, print } from "@app/common/services/print-tool";

@autoinject
export class OrderItemDetail {
  orderItem: OrderItem;
  organization: Organization;
  tallyItems: TallyItem[];
  units = [] as DictionaryData[];

  constructor(private orderItemService: OrderItemService,
              private organizationService: OrganizationService,
              private dictionaryDataService: DictionaryDataService,
              private tallyItemService: TallyItemService) {

  }

  async activate(params) {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.orderItem = await this.orderItemService.getOrderItem(params.id);
    this.orderItem.createTimeStr = moment(this.orderItem.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.organization = await this.organizationService.getOrganization(this.orderItem.orgId);
    this.tallyItems = await this.tallyItemService.listTallyItems(params.id);
    let index = 1;
    this.tallyItems.map(res => {
      res.instockDate = moment(res.instockDate).format("YYYY-MM-DD HH:mm:ss");
      if (res.unit) {
        res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      }
      res.index = index++;
      return res;
    });
  }

  async print() {
    let title = "理货报告";
    let strHTML = $("#orderItem").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}