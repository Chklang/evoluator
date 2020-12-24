import { Pipe, PipeTransform } from '@angular/core';
import * as stringify from 'stringify-object';
import { IGameContext } from 'game-engine';

@Pipe({
  name: 'serializeGameContext'
})
export class SerializeGameContextPipe implements PipeTransform {

  transform(gameContext: IGameContext): string {
    let result: string[] = [
      'import { IAchievement, IBuilding, IFeature, IResource, IResearch } from \'game-engine\';',
      ''
    ];
    // Resources
    result.push(...gameContext.allResources.map((resource) => {
      const varName = 'resource' + this.firstLetterCapital(resource.name);
      return 'const ' + varName + ': IResource = ' + this.stringify(resource) + ';';
    }));
    result.push('export const allResources: IResource[] = [\n' + gameContext.allResources.reduce((prev, current) => {
      const varName = 'resource' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Researchs
    result.push(...gameContext.allResearchs.map((research) => {
      const varName = 'research' + this.firstLetterCapital(research.name);
      return 'const ' + varName + ': IResearch = ' + this.stringify(research) + ';';
    }));
    result.push('export const allResearchs: IResearch[] = [\n' + gameContext.allResearchs.reduce((prev, current) => {
      const varName = 'research' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Features
    result.push(...gameContext.allFeatures.map((feature) => {
      const varName = 'feature' + this.firstLetterCapital(feature.name);
      return 'const ' + varName + ': IFeature = ' + this.stringify(feature) + ';';
    }));
    result.push('export const allFeatures: IFeature[] = [\n' + gameContext.allFeatures.reduce((prev, current) => {
      const varName = 'resefeaturearch' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Buildings
    result.push(...gameContext.allBuildings.map((building) => {
      const varName = 'building' + this.firstLetterCapital(building.name);
      return 'const ' + varName + ': IBuilding = ' + this.stringify(building) + ';';
    }));
    result.push('export const allBuildings: IBuilding[] = [\n' + gameContext.allBuildings.reduce((prev, current) => {
      const varName = 'building' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Achievements
    result.push(...gameContext.allAchievements.map((achievement) => {
      const varName = 'achievement' + this.firstLetterCapital(achievement.name);
      return 'const ' + varName + ': IAchievement = ' + this.stringify(achievement) + ';';
    }));
    result.push('export const allAchievements: IAchievement[] = [\n' + gameContext.allAchievements.reduce((prev, current) => {
      const varName = 'achievement' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');
    return result.join('\n');
  }

  private firstLetterCapital(value: string): string {
    return value[0].toUpperCase() + value.substr(1);
  }

  private stringify(obj: any): string {
    return stringify(obj, {
      singleQuotes: true,
      indent: '    ',
    });
  }

}
