import { RestClient, Query, handleResult } from "../../utils";
import { inject } from "aurelia-dependency-injection";
import { WorkArea } from "@app/base/models/work-area";
import { autoinject } from "aurelia-dependency-injection";

@autoinject
export class WorkAreaService {
    constructor( @inject private http: RestClient) {
    }

    queryWorkAreaPage(workOrderId?: string): Query<WorkArea> {
        return this.http.query("/base/workArea/page", { workOrderId });
    }

    getByWorkOrderId(workOrderId: string): Promise<WorkArea[]> {
        return this.http.get(`/base/workArea/${workOrderId}`).then(res => res.content);
    }

    removeWorkOrderArea(id: string): Promise<void> {
        return this.http.put(`/base/workArea/${id}`, '').then(handleResult);
    }


}