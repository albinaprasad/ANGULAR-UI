import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { IInsertRow } from "../../shared/components/modals/insert-row/type/insert-row.type";

@Injectable({
    providedIn: 'root'
})
export class InsertRowService {
    private insertRow = new Subject<IInsertRow>();
    insertRow$ = this.insertRow.asObservable();

    private id = 0;

    show(data:IInsertRow) {
        this.insertRow.next(data)
    }

    close() {
        this.insertRow.next({ tableName: ''});
    }
}