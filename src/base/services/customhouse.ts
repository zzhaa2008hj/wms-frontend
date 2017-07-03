import { autoinject } from "aurelia-dependency-injection";
import { Query, RestClient, handleResult} from '@app/utils';
import { CustomhouseClearance, CustomhouseClearanceVo} from '@app/base/models/customhouse';

@autoinject
export class CustomhouseClearanceService {
  constructor(private http: RestClient) {
  }

  /**
   * 查询海关放行单
   * @param search 
   */
  queryCustomhouseClearancePage(search?: Object): Query<CustomhouseClearance> {
    return this.http.query<CustomhouseClearance>(`/base/customhouse-clearance/page`, search);
  }

  /**
   * 保存海关放行 / 单证审核
   * @param customhouse
   */
  async saveCustomhouseClearance(customhouse: CustomhouseClearanceVo): Promise<void> {
    await this.http.post(`/base/customhouse-clearance`, customhouse).then(handleResult);
  }

  /**
   * 获取放行单
   */
  async getCustomhouseClearanceByType(type: number, flowId: string): Promise<CustomhouseClearance> {
    let res = await this.http.get(`/base/customhouse-clearance/type/${type}/${flowId}`);
    return res.content;
  }

  /**
   * 修改海关放行 / 单证审核
   * @param customhouse
   */
  async updateCustomhouseClearance(id: string, customhouse: CustomhouseClearanceVo): Promise<void> {
    await this.http.put(`/base/customhouse-clearance/${id}`, customhouse).then(handleResult);
  }
}