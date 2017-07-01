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
}