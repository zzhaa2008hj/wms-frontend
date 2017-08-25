/**
 * Created by Hui on 2017/6/19.
 */
export interface Notice {
  category: number;

  title: string;

  content: string;

  visible: number;

  createTime: Date;
  createTimeStr: string;
}