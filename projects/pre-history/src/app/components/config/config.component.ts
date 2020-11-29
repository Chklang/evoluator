import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from 'game-engine';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit, OnDestroy {
  public framerate?: number;
  public form: FormGroup;

  private subscribes: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private readonly configService: ConfigService,
  ) { }

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      frameRate: ['', [Validators.required, Validators.min(1), Validators.max(60)]],
    });
    this.subscribes.push(this.configService.config$.subscribe((config) => {
      this.form.get('frameRate').setValue(config.framerate);
    }));
  }
  public ngOnDestroy(): void {
    this.subscribes.forEach((e) => e.unsubscribe());
  }

  public save(): void {
    // console.log(this.form.get('frameRate').value);
    if (!this.form.valid) {
      return;
    }
    this.configService.config$.next({
      framerate: this.form.get('frameRate').value,
    });
  }

}
