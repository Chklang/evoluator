import { Component, Input, OnInit } from '@angular/core';
import { IBlockerStatus, IBuildingBlocker, IFeatureBlocker, IResourceBlocker } from 'game-engine';

@Component({
  selector: 'app-blocker-status',
  templateUrl: './blocker-status.component.html',
  styleUrls: ['./blocker-status.component.css']
})
export class BlockerStatusComponent implements OnInit {
  private statusInternal: IBlockerStatus | undefined;
  public blockerName = '';
  public blockerValue = '';
  public blockerIsOk = false;
  @Input()
  public get status(): IBlockerStatus | undefined {
    return this.statusInternal;
  }
  public set status(value: IBlockerStatus | undefined) {
    this.statusInternal = value;
    if (!value) {
      return;
    }
    let blockerName = 'blockers.' + value.blocker.type + '.';
    switch (value.blocker.type) {
      case 'building':
        blockerName += (value.blocker as IBuildingBlocker).params.name;
        this.blockerValue = this.formatNumber((value.blocker as IBuildingBlocker).params.quantity);
        break;
      case 'feature':
        blockerName += (value.blocker as IFeatureBlocker).params.name;
        break;
      case 'resource':
      case 'resourceTotal':
        blockerName += (value.blocker as IResourceBlocker).params.name;
        this.blockerValue = this.formatNumber((value.blocker as IResourceBlocker).params.quantity);
        break;
    }
    blockerName += '.name';
    this.blockerName = blockerName;
    this.blockerIsOk = value.isOk;
  }

  constructor() { }

  ngOnInit(): void {
  }

  private formatNumber(value: number): string {
    // TODO format Millions/Milliards, ...
    return String(value);
  }

}
