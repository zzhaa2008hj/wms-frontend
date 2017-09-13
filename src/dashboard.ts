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

@autoinject
export class Dashboard {

  notices: Notice[];
  notice: Notice = {} as Notice;
  show: boolean = false;

  constructor(private dialogService: DialogService,
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
  }

  async detail() {
    await this.dialogService
      .open({ viewModel: ReadNotification, model: { body: this.notice.content, title: this.notice.title }, lock: true })
      .whenClosed();
  }

  // 页面载入完成后执行
  attached() {
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

    let myChart2 = echarts.init(document.getElementById('main2') as HTMLDivElement);
    // 指定图表的配置项和数据
    let option2 = {
      title: {
        text: '世界人口总量',
        subtext: '数据来自网络'
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
    myChart2.setOption(option2);
  }

  async printOrder() {
    let title = "打印测试";
    let strHTML = '打印测试';
    print(title, strHTML, true);
  }

  onSelect(e) {

  }

  requiredPermissions(sourceCode: string) {
    return requiredPermissionsAttributeResult(sourceCode, this.user.userInfo.menuVoList);
  }
}