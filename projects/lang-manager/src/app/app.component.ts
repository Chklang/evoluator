import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProjectsService } from 'managers-lib';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IProjectDetails, LangService } from './services/lang/lang.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public show = true;
  public projects = this.projectsService.getProjects().pipe(
    tap(projects => {
      projects.forEach(projectName => {
        this.projectsDetails[projectName] = this.langService.loadProject(projectName);
      });
    })
  );
  public projectsDetails: Record<string, Observable<IProjectDetails>> = {};

  public constructor(
    public projectsService: ProjectsService,
    public langService: LangService,
  ) { }

}
