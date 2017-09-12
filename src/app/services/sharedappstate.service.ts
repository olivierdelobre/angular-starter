import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SharedAppStateService {
    public loggedUserInfoSource = new BehaviorSubject<any>(0);
    public loggedUserInfo = this.loggedUserInfoSource.asObservable();

    public treeFilterSource = new BehaviorSubject<string>("");
    public treeFilter = this.treeFilterSource.asObservable();

    public refreshParentSource = new BehaviorSubject<number>(0);
    public refreshParent = this.refreshParentSource.asObservable();

    public updateLoggedUserInfo(newValue: any) {
        this.loggedUserInfoSource.next(newValue);
    }

    public updateTreeFilter(newValue: string) {
        this.treeFilterSource.next(newValue);
    }

    public updateRefreshParent(newValue: number) {
        this.refreshParentSource.next(newValue);
    }
}
