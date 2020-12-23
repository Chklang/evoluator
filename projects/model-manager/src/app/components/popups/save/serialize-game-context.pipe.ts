import { Pipe, PipeTransform } from '@angular/core';
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
      return 'const ' + varName + ': IResource = ' + JSON.stringify(resource, null, 4) + ';';
    }));
    result.push('export const allResources: IResource[] = [\n' + gameContext.allResources.reduce((prev, current) => {
      const varName = 'resource' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Researchs
    result.push(...gameContext.allResearchs.map((research) => {
      const varName = 'research' + this.firstLetterCapital(research.name);
      return 'const ' + varName + ': IResearch = ' + JSON.stringify(research, null, 4) + ';';
    }));
    result.push('export const allResearchs: IResearch[] = [\n' + gameContext.allResearchs.reduce((prev, current) => {
      const varName = 'research' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Features
    result.push(...gameContext.allFeatures.map((research) => {
      const varName = 'feature' + this.firstLetterCapital(research.name);
      return 'const ' + varName + ': IFeature = ' + JSON.stringify(research, null, 4) + ';';
    }));
    result.push('export const allFeatures: IFeature[] = [\n' + gameContext.allFeatures.reduce((prev, current) => {
      const varName = 'resefeaturearch' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Buildings
    result.push(...gameContext.allBuildings.map((research) => {
      const varName = 'building' + this.firstLetterCapital(research.name);
      return 'const ' + varName + ': IBuilding = ' + JSON.stringify(research, null, 4) + ';';
    }));
    result.push('export const allBuildings: IBuilding[] = [\n' + gameContext.allBuildings.reduce((prev, current) => {
      const varName = 'building' + this.firstLetterCapital(current.name);
      return prev + '    ' + varName + ',\n';
    }, '') + '];');

    // Achievements
    result.push(...gameContext.allAchievements.map((research) => {
      const varName = 'achievement' + this.firstLetterCapital(research.name);
      return 'const ' + varName + ': IAchievement = ' + JSON.stringify(research, null, 4) + ';';
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

}
