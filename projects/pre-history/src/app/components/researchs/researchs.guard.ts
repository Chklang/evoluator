import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { StoreService } from 'game-engine';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ResearchsGuard implements CanActivate {

  public constructor(
    private router: Router,
    private storeService: StoreService,
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.storeService.datas$.pipe(
      take(1),
      map((datas) => {
        if (datas.showableElements.features.hasElement('Research')) {
          return true;
        }
        return this.router.parseUrl('/colony');
      }),
    );
  }
}
