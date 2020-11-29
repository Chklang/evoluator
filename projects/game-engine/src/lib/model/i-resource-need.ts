import { Observable } from 'rxjs';
import { IResourceCount } from './i-resource-count';

export interface IResourceNeed extends IResourceCount {
    isOk$: Observable<number>;
}
