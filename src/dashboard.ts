import { autoinject } from "aurelia-dependency-injection";
import * as echarts from 'echarts';
import * as moment from 'moment';
import { NoticeService } from '@app/base/services/notice';
import { Notice } from '@app/base/models/notice';
import { DialogService } from 'ui';
import { ReadNotification } from '@app/base/notifications/read';

@autoinject
export class Dashboard {

  notices: Notice[];
  notice: Notice;

  constructor(private dialogService: DialogService,
              private noticeService: NoticeService) {

  }

  async activate() {
    // todo 公告向上滚动
    this.notices = await this.noticeService.getNotices();
    if (this.notices && this.notices.length > 0) {
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
      title: {
        text: 'ECharts 入门示例'
      },
      tooltip: {},
      legend: {
        data: ['销量']
      },
      xAxis: {
        data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
      },
      yAxis: {},
      series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
      }]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
  }
}