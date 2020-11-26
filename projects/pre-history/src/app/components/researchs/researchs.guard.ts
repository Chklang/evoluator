import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { FeaturesService } from 'game-engine';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { featuresByKey } from '../../database';

@Injectable({
  providedIn: 'root'
})
export class ResearchsGuard implements CanActivate {

  public constructor(
    private router: Router,
    private featuresService: FeaturesService,
  ) {}

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.featuresService.listenFeature(featuresByKey.Research).pipe(
      take(1),
      map((feature) => {
        if (feature.blockedUntil === 0 || feature.blockedUntil < Date.now()) {
          return true;
        }
        return this.router.parseUrl('/colony');
      }),
    );
  }
}
