import { autoinject } from "aurelia-dependency-injection";
import * as echarts from 'echarts';
import * as moment from 'moment';
import { NoticeService } from '@app/base/services/notice';
import { Notice } from '@app/base/models/notice';
import { DialogService } from 'ui';
import { ReadNotification } from '@app/base/notifications/read';
import { print } from '@app/common/services/print-tool';
import { requiredPermissionsAttributeResult } from '@app/utils';
import { UserSession } from '@app/user';
import { BusinessOrder } from '@app/common/models/business-order';
import { IndexService } from '@app/common/services/index';
import { FeeOrder } from '@app/common/models/fee-order';
import { WarehouseOrder } from '@app/common/models/warehouse-order';
import { Warehouse } from '@app/base/models/warehouse';

@autoinject
export class Dashboard {

  notices: Notice[];
  notice: Notice = {} as Notice;
  show: boolean = false;
  businessOrder: BusinessOrder;
  feeOrder: FeeOrder;
  warehouseOrder: WarehouseOrder;

  wc: string = "bar";
  wd: string = "week";
  sc: string = "bar";
  sw: string = "";

  warehouseCategories = [{ value: "bar", text: "柱状图" }, { value: "line", text: "折线图" }];
  warehouseDates = [{ value: "week", text: "本周" }, { value: "month", text: "本月" }, 
    { value: "quarter", text: "本季" }, { value: "year", text: "本年" }];
  storageCategories = [{ value: "bar", text: "柱状图" }, { value: "cake", text: "饼图" }];
  storateWarehouses = [] as Warehouse[];
  warehouse: Warehouse = {} as Warehouse;

  constructor(private dialogService: DialogService,
              private indexService: IndexService,
              private user: UserSession,
              private noticeService: NoticeService) {

  }

  async activate() {
    // todo 公告向上滚动
    this.notices = await this.noticeService.getNotices();
    if (this.notices && this.notices.length > 0) {
      this.show = true;
      this.notice = this.notices[0];
      this.notice.createTimeStr = this.notice.createTime ? moment(this.notice.createTime).format("YYYY-MM-DD") : '';
    }

    this.businessOrder = await this.indexService.getBusinessOrderNumber();
    this.feeOrder = await this.indexService.getFeeOrderNumber();
    this.warehouseOrder = await this.indexService.getWarehouseOrderNumber();
    Object.assign(this.warehouse, {id: '', name: '全部'});
    this.storateWarehouses.push(this.warehouse);
    this.storateWarehouses = [...this.storateWarehouses, ...await this.indexService.getTopWarehouses()];
  }

  async detail() {
    await this.dialogService
      .open({ viewModel: ReadNotification, model: { body: this.notice.content, title: this.notice.title }, lock: true })
      .whenClosed();
  }

  // 页面载入完成后执行
  attached() {
    this.getStorageInfo();
    this.getChargeInfo();
    this.getPayInfo();
    this.getWorkOrderInfo();
  }

  async getChargeInfo() {

  }

  async getPayInfo() {

  }

  // 出入库、移库、货转作业信息
  async getWorkOrderInfo() {
    let myChart = echarts.init(document.getElementById('main') as HTMLDivElement);
    // 指定图表的配置项和数据
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['件数', '数量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '件数',
          type: 'bar',
          data: [320, 332, 301, 334, 390, 330, 320]
        },
        {
          name: '数量',
          type: 'bar',
          data: [120, 132, 101, 134, 90, 230, 210]
        }
      ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }

  // 库存信息
  async getStorageInfo() {
    let myChart = echarts.init(document.getElementById('main2') as HTMLDivElement);
    // 指定图表的配置项和数据
    let option = {
      title: {
        text: '世界人口总量'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['件数', '数量']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)']
      },
      series: [
        {
          name: '件数',
          type: 'bar',
          data: [18203, 23489, 29034, 104970, 131744, 630230]
        },
        {
          name: '数量',
          type: 'bar',
          data: [19325, 23438, 31000, 121594, 134141, 681807]
        }
      ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }

  async printOrder() {
    let title = "打印测试";
    let strHTML = '打印测试';
    print(title, strHTML, true);
  }

  changeWCategory(category) {
    this.wc = category;

  }

  changeWDate(date) {
    this.wd = date;
  }

  changeSCategory(category) {
    this.sc = category;
  }

  changeSWarehouse(warehouse) {
    this.sw = warehouse;
  }

  requiredPermissions(sourceCode: string) {
    return requiredPermissionsAttributeResult(sourceCode, this.user.userInfo.menuVoList);
  }
}