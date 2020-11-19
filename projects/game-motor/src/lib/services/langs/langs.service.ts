import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ErrorMessage } from '../../model';
import { ILangRefEntry, ILangRefFile, } from '../../model/translation';

interface ILangFile {
  version: string;
  data: any;
}
interface ILangRefEntrySrc {
  id: string;
  name: string;
  logo: string;
}

interface ILangDictionnary {
  [key: string]: string;
}

@Injectable({
  providedIn: 'root'
})
export class LangsService {

  private readonly currentCodeLang$: Subject<ILangRefEntry> = new ReplaySubject(1);
  private readonly currentTranslation$: Observable<ILangDictionnary>;
  private readonly cacheLangs: { [key: string]: ILangDictionnary } = {};
  public readonly allLangs: Observable<ILangRefFile>;

  constructor(
    private readonly http: HttpClient,
    private readonly sanitizer: DomSanitizer,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.allLangs = this.http.get<ILangRefEntrySrc[]>(baseUrl + 'assets/langs/langs.json').pipe(
      map((response) => response.map((e) => ({
        ...e,
        logo: this.sanitizer.bypassSecurityTrustHtml(e.logo),
      }))),
      shareReplay(1)
    );
    const defaultCodeLang$: Observable<ILangRefEntry> = this.allLangs.pipe(
      map((allLangs) => allLangs[0]),
    );
    this.currentTranslation$ = defaultCodeLang$.pipe(
      switchMap((defaultCodeLang) => {
        this.currentCodeLang$.next(defaultCodeLang);
        return this.currentCodeLang$;
      }),
      switchMap((currentCodeLang) => {
        if (this.cacheLangs[currentCodeLang.id]) {
          return of(this.cacheLangs[currentCodeLang.id]);
        }
        return this.http.get<ILangFile>(baseUrl + 'assets/langs/' + currentCodeLang.id + '.json').pipe(
          map((response) => {
            this.cacheLangs[currentCodeLang.id] = this.flatMap(response.data);
            return this.cacheLangs[currentCodeLang.id];
          }),
        );
      }),
      shareReplay(1),
    );
  }

  private flatMap(src: any): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    Object.keys(src).forEach((key) => {
      if (typeof src[key] === 'string') {
        result[key] = src[key] as string;
      } else {
        const flatted = this.flatMap(src[key]);
        Object.keys(flatted).forEach((keyFlatted) => {
          result[key + '.' + keyFlatted] = flatted[keyFlatted];
        });
      }
    });
    return result;
  }

  public changeLang(codeLang: string): Observable<void> {
    return this.allLangs.pipe(
      map((allLangs) => allLangs.find(e => e.id === codeLang)),
      map((langFound) => {
        if (!langFound) {
          throw { code: 'LANG_NOT_FOUND', defaultMessage: 'Lang $1 not found', parameters: [codeLang] } as ErrorMessage;
        }
        this.currentCodeLang$.next(langFound);
      }),
    );
  }

  public translate(text: string): Observable<string> {
    return this.currentTranslation$.pipe(
      map((dictionnary) => dictionnary[text] || text),
    );
  }
}
