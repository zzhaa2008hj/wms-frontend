import { autoinject } from "aurelia-dependency-injection";
import { EventAggregator } from "aurelia-event-aggregator";
import * as echarts from 'echarts';

@autoinject
export class Dashboard {
  constructor(private events: EventAggregator) {

  }

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

  publish() {
    this.events.publish(
      'user:authenticate',
      {
        orgId: "6bef5d9d82b44e80833884619b3d1cb2",
        userId: "83731b46959547f8a1b5109966044c7f"
      }
    );
  }
}