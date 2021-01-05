import { Injectable } from '@angular/core';
import { BackendApiService } from 'managers-lib';
import { ILangRefEntry } from 'game-engine';
import { forkJoin, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LangService {

  constructor(
    private backendApiService: BackendApiService,
  ) { }

  public listLangs(projectName: string): Observable<ILangRefEntry[]> {
    return this.backendApiService.read('/' + projectName + '/src/assets/langs/langs.json').pipe(
      map((result): ILangRefEntry[] => JSON.parse(result)),
    );
  }

  public getLang(projectName: string, lang: string): Observable<any> {
    return this.backendApiService.read('/' + projectName + '/src/assets/langs/' + lang + '.json').pipe(
      map(result => JSON.parse(result)),
      shareReplay(1),
    );
  }

  public loadProject(projectName: string): Observable<IProjectDetails> {
    return this.listLangs(projectName).pipe(
      switchMap((langs): Observable<ILangDetailsBrut[]> => {
        if (langs.length === 0) {
          return of([]);
        }
        return forkJoin(langs.map(lang => {
          return this.getLang(projectName, lang.id).pipe(
            map(contentLang => {
              return {
                ref: lang,
                texts: contentLang,
              };
            }),
          );
        }));
      }),
      map((allLangs) => {
        const fullStruct: string[] = [];
        allLangs.map(lang => this.jsonStruct(lang.texts.data)).forEach(struct => {
          struct.forEach(entry => {
            if (fullStruct.indexOf(entry) < 0) {
              fullStruct.push(entry);
            }
          });
        });
        fullStruct.sort((a, b) => a.localeCompare(b));
        const projectDetails: IProjectDetails = {
          name: projectName,
          langStruct: fullStruct,
          langs: allLangs.map(lang => {
            return {
              ref: lang.ref,
              texts: this.getValueOfKeys(lang.texts.data, fullStruct),
            };
          }),
        };
        return projectDetails;
      }),
      shareReplay(1),
    );
  }

  private jsonStruct(obj: any): string[] {
    const result: string[] = [];
    Object.keys(obj).forEach(key => {
      if (typeof (obj[key]) === 'object') {
        this.jsonStruct(obj[key]).forEach(subKey => {
          result.push(key + '.' + subKey);
        });
      } else {
        result.push(key);
      }
    });
    return result;
  }

  private getValueOfKeys(fullStruct: any, keys: string[]): Record<string, any> {
    const result: Record<string, any> = {};
    keys.forEach(currentKey => {
      const splitted = currentKey.split('.');
      if (splitted.length > 1) {
        if (fullStruct[splitted[0]]) {
          result[currentKey] = this.getValueOfKey(fullStruct[splitted[0]], splitted, 1);
        }
      } else {
        result[currentKey] = fullStruct[currentKey];
      }
    });
    return result;
  }

  private getValueOfKey(fullStruct: any, keys: string[], currentIndex: number): any {
    if (keys.length > (currentIndex + 1)) {
      return this.getValueOfKey(fullStruct[keys[currentIndex]], keys, currentIndex + 1);
    } else {
      return fullStruct[keys[currentIndex]];
    }
  }
}

export interface IProjectDetails {
  name: string;
  langStruct: string[];
  langs: ILangDetails[];
}

export interface ILangDetails {
  ref: ILangRefEntry;
  texts: Record<string, string>;
}
interface ILangDetailsBrut {
  ref: ILangRefEntry;
  texts: any;
}
