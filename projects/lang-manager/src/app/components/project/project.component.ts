import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { IProjectDetails, LangService } from '../../services/lang/lang.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit {
  public projectDetails: Observable<IProjectDetails>;
  public selectedKey: Subject<string> = new BehaviorSubject('');
  public keys: FormArray;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private langService: LangService,
  ) { }

  public ngOnInit(): void {
    this.projectDetails = this.activatedRoute.paramMap.pipe(
      switchMap((paramsRoute): Observable<IProjectDetails | undefined> => {
        if (!paramsRoute.get('project')) {
          return of(undefined);
        }
        const projectName = paramsRoute.get('project');
        return this.langService.loadProject(projectName);
      }),
      tap((projectDetails) => {
        if (!projectDetails) {
          this.keys = this.formBuilder.array([]);
          return;
        }
        this.keys = this.formBuilder.array(projectDetails.langs.map(lang => {
          return this.formBuilder.group({
            langName: lang.ref.name,
            texts: this.formBuilder.group(lang.texts),
          });
        }));
        this.selectedKey.next(projectDetails.langStruct[0]);
        console.log(this.keys);
      })
    );
  }

  public changeKey(newKey: string): void {
    this.selectedKey.next(newKey);
    console.log('Set to ', newKey);
  }

}
