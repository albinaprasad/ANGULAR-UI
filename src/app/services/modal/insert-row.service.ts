import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { IInsertRow } from "../../shared/components/modals/insert-row/type/insert-row.type";
import { TableDescription } from "../../types/admin.types";

@Injectable({
    providedIn: 'root'
})
export class InsertRowService {
    private isActive = new Subject<boolean>();
    private insertRow = new Subject<TableDescription>();
    insertRow$ = this.insertRow.asObservable();
    isActive$ = this.isActive.asObservable();

    private id = 0;

    show(data:TableDescription) {
        this.insertRow.next(data)
        this.isActive.next(true);
    }

    close() {
        this.insertRow.next({ columns: [], table: ''});
        this.isActive.next(false);
    }
}