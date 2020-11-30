import { Injectable } from '@angular/core';
import { Dictionnary } from 'arrayplus';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, shareReplay, takeWhile, tap } from 'rxjs/operators';
import {
  IBlocker,
  IBlockerStatus,
  IGame,
  IAchievement,
} from '../../model';
import { ICalculatedGameContext } from '../store/i-calculated-game-context';
import { TickService } from '../tick/tick.service';

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {

  constructor(
    private readonly tickService: TickService,
  ) { }
  private allShowableAchievements: Dictionnary<string, IShowableAchievement> = Dictionnary.create();
  public allShowableAchievements$: Subject<Dictionnary<string, IShowableAchievement>> = new BehaviorSubject(this.allShowableAchievements);

  public listenAchievement(achievement: IAchievement): Observable<IShowableAchievement> {
    return this.allShowableAchievements$.pipe(
      map((allShowable) => allShowable.getElement(achievement.name)),
      filter((showable) => showable !== undefined),
    );
  }

  public setAchievementLevel(
    gameContext: ICalculatedGameContext,
    achievement: IAchievement,
    currentLevel: number,
    foreachLevelblockedBy: IBlocker<any>[][],
    blockedUntil: number[],
    game: IGame,
  ): void {
    const nextLevels: Dictionnary<number, IShowableAchievementNextLevels> = Dictionnary.create();
    for (let level = currentLevel; level < achievement.levels.length; level++) {
      const blockers: IBlockerStatus[] = (achievement.levels[level].blockers || []).map((blocker): IBlockerStatus => {
        return {
          blocker,
          isOk: foreachLevelblockedBy[level - currentLevel].indexOf(blocker) === -1,
        };
      });
      let timeBeforeUnlock: Observable<number>;
      if (blockers.every((e) => e.isOk)) {
        timeBeforeUnlock = new BehaviorSubject(-1);
      } else if (blockedUntil[level - currentLevel] === Infinity) {
        timeBeforeUnlock = new BehaviorSubject(0);
      } else {
        let featureIsAccessible = false;
        timeBeforeUnlock = this.tickService.tick$.pipe(
          map(() =>
            blockedUntil[level - currentLevel] - Date.now()
          ),
          map((value) =>
            (Math.ceil(value / 1000) * 1000) || -1
          ), // Never 0, 0=not accessible
          takeWhile(() => !featureIsAccessible),
          map((value) => {
            // console.log('Value sent ', value);
            if (value < 0 || value === Infinity) {
              featureIsAccessible = true;
            }
            if (value === Infinity) {
              return 0;
            }
            return value;
          }),
          shareReplay(1),
        );
      }
      nextLevels.addElement(level + 1, {
        blockedUntil: blockedUntil[level - currentLevel - 1],
        blockersStatus: blockers,
        level: level + 1,
        timeBeforeUnlock,
      });
    }
    const showable: IShowableAchievement = {
      achievement,
      level: currentLevel,
      nextLevels,
    };
    this.allShowableAchievements.addElement(achievement.name, showable);
    this.allShowableAchievements$.next(this.allShowableAchievements);
  }

  public changeOnlyLevel(achievement: IAchievement, level: number): void {
    const showable = this.allShowableAchievements.getElement(achievement.name);
    const diff = level - showable.level;
    if (diff <= 0) {
      // Already at this level, ignore
      return;
    }
    for (let i = showable.level + 1; i <= level; i++) {
      showable.nextLevels.removeElement(i);
    }
    showable.level = level;
    this.allShowableAchievements$.next(this.allShowableAchievements);
  }
}

export interface IShowableAchievement {
  achievement: IAchievement;
  level: number;
  nextLevels: Dictionnary<number, IShowableAchievementNextLevels>;
}

export interface IShowableAchievementNextLevels {
  level: number;
  blockedUntil: number;
  blockersStatus: IBlockerStatus[];
  timeBeforeUnlock: Observable<number>;
}
