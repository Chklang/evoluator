import { Component, Directive, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import * as d3 from 'd3';
import { DragBehavior } from 'd3';
import * as PreHistory from "../../../../../pre-history/src/app/database";
import { IBuilding, IAchievement, IResource, IResearch, IFeature, IGameContext, IBlocker, IBuildingBlocker, IFeatureBlocker, IResourceBlocker } from 'game-engine';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { EditResourceComponent } from '../popups/edit-resource/edit-resource.component';
import { SaveComponent } from '../popups/save/save.component';
import { EditResearchComponent } from '../popups/edit-research/edit-research.component';
import { EditAchievementComponent } from '../popups/edit-achievement/edit-achievement.component';
import { EditBuildingComponent } from '../popups/edit-building/edit-building.component';
import { EditFeatureComponent } from '../popups/edit-feature/edit-feature.component';

@Directive({
  selector: '[svgZone]',
})
export class SchemaDirective extends Directive {
  constructor(public viewContainerRef: ViewContainerRef) {
    super();
  }
}

const svgns = "http://www.w3.org/2000/svg";

@Component({
  selector: 'app-schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.css']
})
export class SchemaComponent implements OnInit {
  @ViewChild(SchemaDirective, { static: true })
  public svgZone: SchemaDirective;

  public modalRef: BsModalRef;

  private currentAdd: rects | undefined;
  private transformCurrent: d3.ZoomTransform;
  private isAddMode = false;

  private menuGroup: SVGElement;
  private drawGroup: SVGElement;

  private currentResources: { resource: IResource, rect: rects }[] = [];
  private currentResearchs: { research: IResearch, rect: rects }[] = [];
  private currentFeatures: { feature: IFeature, rect: rects }[] = [];
  private currentBuildings: { building: IBuilding, rect: rects }[] = [];
  private currentAchivements: { achievement: IAchievement, rect: rects }[] = [];

  constructor(
    private readonly modalService: BsModalService,
  ) { }

  private createGameContext(): IGameContext {
    return {
      allAchievements: this.currentAchivements.map(e => {
        e.achievement.metadatas = {
          x: e.rect.posx,
          y: e.rect.posy,
        };
        return e.achievement;
      }),
      allBuildings: this.currentBuildings.map(e => {
        e.building.metadatas = {
          x: e.rect.posx,
          y: e.rect.posy,
        };
        return e.building;
      }),
      allFeatures: this.currentFeatures.map(e => {
        e.feature.metadatas = {
          x: e.rect.posx,
          y: e.rect.posy,
        };
        return e.feature;
      }),
      allResearchs: this.currentResearchs.map(e => {
        e.research.metadatas = {
          x: e.rect.posx,
          y: e.rect.posy,
        };
        return e.research;
      }),
      allResources: this.currentResources.map(e => {
        e.resource.metadatas = {
          x: e.rect.posx,
          y: e.rect.posy,
        };
        return e.resource;
      }),
      gameFromScratch: null,
    };
  }

  public ngOnInit(): void {
    const svgZone = this.svgZone.viewContainerRef.element.nativeElement as SVGElement;
    this.init(svgZone, {
      allAchievements: PreHistory.achievements,
      allBuildings: PreHistory.buildings,
      allFeatures: PreHistory.features,
      allResearchs: PreHistory.researchs,
      allResources: PreHistory.resources,
      gameFromScratch: null,
    });
  }

  private init(svg: SVGElement, gameContext: IGameContext): void {
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    this.menuGroup = document.createElementNS(svgns, "g");
    this.drawGroup = document.createElementNS(svgns, "g");

    svg.appendChild(this.drawGroup);
    svg.appendChild(this.menuGroup);

    const drawGroup = this.drawGroup;

    const svgD3 = d3.select(svg);
    gameContext.allResources.forEach((resource, index) => this.appendResource(resource, { index }));
    gameContext.allResearchs.forEach((research, index) => this.appendResearch(research, { index }));
    gameContext.allFeatures.forEach((feature, index) => this.appendFeature(feature, { index }));
    gameContext.allBuildings.forEach((building, index) => this.appendBuilding(building, { index }));
    gameContext.allAchievements.forEach((achievement, index) => this.appendAchievement(achievement, { index }));

    this.addButton(0, 'yellow', (event, pos) => {
      const newResource: IResource = {
        icon: '',
        max: 100,
        name: 'NewResource',
        resourceType: 'CLASSIC',
      };
      return this.appendResource(newResource, pos);
    });

    this.addButton(1, 'red', (event, pos) => {
      const newResearch: IResearch = {
        name: 'NewResearch',
        cost: {},
        bonusResources: {},
        bonusBuildingCosts: {},
      };
      return this.appendResearch(newResearch, pos);
    });

    this.addButton(2, '#fcf', (event, pos) => {
      const newFeature: IFeature = {
        name: 'NewFeature',
      };
      return this.appendFeature(newFeature, pos);
    });

    this.addButton(3, '#cff', (event, pos) => {
      const newBuilding: IBuilding = {
        name: 'NewBuilding',
        cost: {},
      };
      return this.appendBuilding(newBuilding, pos);
    });

    this.addButton(4, '#cfc', (event, pos) => {
      const newAchievement: IAchievement = {
        name: 'NewAchievement',
        levels: [],
      };
      return this.appendAchievement(newAchievement, pos);
    });
    svgD3.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.001, 1000])
      .on("zoom", ({ transform }) => {
        this.transformCurrent = transform;
        d3.select(drawGroup).attr("transform", transform);
      }));
  }

  private addButton(index: number, color: string, onAdd: (event: d3.D3DragEvent<Element, any, any>, pos: { posx: number, posy: number }) => rects) {
    const addButton = document.createElementNS(svgns, 'rect');
    addButton.style.fill = color;
    addButton.setAttribute("x", String(35 * index + 5));
    addButton.setAttribute("y", "5");
    addButton.setAttribute("width", String(30));
    addButton.setAttribute("height", String(30));
    this.menuGroup.appendChild(addButton);
    (addButton as any).obj = <rects>{
      color,
      posx: 5,
      posy: 5,
      rect: addButton,
      d3: [
        d3.select(addButton)
      ],
      name: "toto",
      main: d3.select(addButton),
      edit: null,
      texts: [],
      updated: null,
    }
    d3.select(addButton).call(
      d3.drag()
        .on("start", (e) => this.dragstarted(e, this.currentAdd))
        .on("drag", (e) => this.dragged(e, this.currentAdd))
        .on("end", () => this.dragended(this.currentAdd))
        .subject((event, d) => {
          this.isAddMode = true;
          const factor = this.transformCurrent ? this.transformCurrent.k : 1;
          const pos = {
            posx: (event.x - (this.transformCurrent ? this.transformCurrent.x : 0) - 90) / factor,
            posy: (event.y - (this.transformCurrent ? this.transformCurrent.y : 0) - 25) / factor,
          };
          this.currentAdd = onAdd(event, pos);
          return this.currentAdd.d3;
        })
    );
    d3.select(addButton).attr("cursor", "grab");
  }

  private addText(group: SVGGElement, text: string, line: number, horizontalCenter: boolean) {
    const textElement = document.createElementNS(svgns, "text");
    textElement.setAttribute("dominant-baseline", "middle");
    textElement.setAttribute("text-anchor", horizontalCenter ? "middle" : "left");
    textElement.innerHTML = text;
    textElement.setAttribute("transform", "translate(" + (horizontalCenter ? 90 : 5) + ", " + ((line * 25) + 15) + ")");
    group.appendChild(textElement);
    return textElement;
  }

  private formatBlockers(blockers?: IBlocker<any>[]): string[] {
    if (!blockers) {
      return [];
    }
    return blockers.map(blocker => {
      switch (blocker.type) {
        case 'building': {
          const typedBlocker = blocker as IBuildingBlocker;
          return '&nbsp;&nbsp;[B] ' + typedBlocker.params.name + ' (' + typedBlocker.params.quantity + ')';
        }
        case 'feature': {
          const typedBlocker = blocker as IFeatureBlocker;
          return '&nbsp;&nbsp;[F] ' + typedBlocker.params.name;
        }
        case 'resource': {
          const typedBlocker = blocker as IResourceBlocker;
          return '&nbsp;&nbsp;[R] ' + typedBlocker.params.name + ' (' + typedBlocker.params.quantity + ')';
        }
        case 'resourceTotal': {
          const typedBlocker = blocker as IResourceBlocker;
          return '&nbsp;&nbsp;[RT] ' + typedBlocker.params.name + ' (' + typedBlocker.params.quantity + ')';
        }
      }
      return '';
    });
  }

  private appendElement<T>(element: T, params: IAppendParameters<T>) {
    const rect = document.createElementNS(svgns, "rect");
    const edit = document.createElementNS(svgns, "use");
    edit.setAttribute("transform", "translate(130, -20)");
    edit.setAttribute("href", "#editButton");
    edit.setAttribute("action", "edit");
    const deleteBtn = document.createElementNS(svgns, "use");
    deleteBtn.setAttribute("transform", "translate(160, -20)");
    deleteBtn.setAttribute("href", "#deleteButton");
    deleteBtn.setAttribute("action", "delete");
    const g = document.createElementNS(svgns, "g");
    g.appendChild(rect);
    g.appendChild(edit);
    g.appendChild(deleteBtn);
    const texts = params.getTexts(element);
    const textElements: SVGTextElement[] = texts.map((line, indexLine) => {
      return this.addText(g, line, indexLine, indexLine === 0);
    });

    const updateElement = () => {
      const newTexts = params.getTexts(element);
      newTexts.forEach((text, indexText) => {
        while (result.texts.length <= indexText) {
          const textToAdd = this.addText(g, text, result.texts.length, result.texts.length === 0);
          result.texts.push(textToAdd);
          textToAdd.setAttribute("x", String(result.posx));
          textToAdd.setAttribute("y", String(result.posy));
        }
        result.texts[indexText].innerHTML = text;
      });
      for (let i = newTexts.length; i < result.texts.length; i++) {
        g.removeChild(result.texts[i]);
      }
      result.texts.length = newTexts.length;
      rect.setAttribute("height", String(newTexts.length * 25 + 5));
    };
    const result: rects = {
      posx: params.posx || (params.index || 0) * 200,
      posy: params.posy,
      color: params.color,
      name: texts[0],
      rect: g,
      d3: [
        d3.select(rect),
        d3.select(edit),
        d3.select(deleteBtn),
      ],
      main: d3.select(g),
      edit,
      texts: textElements,
      updated: () => updateElement(),
    };
    result.d3.push(...textElements.map(e => d3.select(e)));

    for (let currentChild = 0; currentChild < g.children.length; currentChild++) {
      g.children.item(currentChild).setAttribute("x", String(result.posx));
      g.children.item(currentChild).setAttribute("y", String(result.posy));
    }
    rect.setAttribute("width", String(180));
    rect.setAttribute("height", String(textElements.length * 25 + 5));
    rect.style.fill = result.color;
    this.drawGroup.appendChild(g);
    this.addDragFeature(result);
    edit.onclick = () => {
      this.modalRef = this.modalService.show(params.editComponent, {
        animated: true,
        initialState: {
          element,
          context: this.createGameContext(),
        },
      });
      this.modalRef.onHidden.subscribe(() => {
        updateElement();
        params.onUpdate(element);
      });
    };
    deleteBtn.onclick = () => {
      const confirmation = confirm('Are you sure to delete ' + result.name + '?');
      if (!confirmation) {
        return;
      }
      this.drawGroup.removeChild(g);
      params.onDelete(element);
    }

    return result;
  }

  private appendResource(resource: IResource, params?: { index?: number, posx?: number, posy?: number }) {
    let originalName = resource.name;
    const needToUpdate: rects[] = [];
    const onUpdateBlockers = (rect: rects, blockers?: IBlocker<any>[]) => {
      if (blockers) {
        blockers.forEach(b => {
          switch (b.type) {
            case 'building':
              // Nothing
              break;
            case 'feature':
              // Nothing
              break;
            case 'resource':
            case 'resourceTotal':
              const typedBlocker = b as IResourceBlocker;
              if (typedBlocker.params.name === originalName) {
                typedBlocker.params.name = resource.name;
                if (!needToUpdate.find(e => e === rect)) {
                  needToUpdate.push(rect);
                }
              }
              break;
          }
        });
      }
    };
    const onUpdateRecord = (rect: rects, values?: Record<string, number>) => {
      if (!values) {
        return;
      }
      if (values[originalName] === undefined) {
        return;
      }
      values[resource.name] = values[originalName];
      delete values[originalName];
      if (!needToUpdate.find(e => e === rect)) {
        needToUpdate.push(rect);
      }
    };
    const onDeleteBlockers = (rect: rects, blockers?: IBlocker<any>[]) => {
      if (!blockers) {
        return undefined;
      }
      return blockers.filter(b => {
        switch (b.type) {
          case 'building':
            // Nothing
            return true;
          case 'feature':
            // Nothing
            return true;
          case 'resource':
          case 'resourceTotal':
            const typedBlocker = b as IResourceBlocker;
            if (typedBlocker.params.name === originalName) {
              if (!needToUpdate.find(e => e === rect)) {
                needToUpdate.push(rect);
              }
              return false;
            }
            return true;
        }
      });
    };
    const onDeleteRecord = (rect: rects, values?: Record<string, number>) => {
      if (!values) {
        return;
      }
      if (values[originalName] === undefined) {
        return;
      }
      delete values[originalName];
      if (!needToUpdate.find(e => e === rect)) {
        needToUpdate.push(rect);
      }
    };
    const result = this.appendElement<IResource>(resource, {
      color: 'yellow',
      getTexts: (e) => {
        return [
          e.name,
          'Grow: ' + (e.growType || 'CLASSIC'),
          'max: ' + e.max,
          'min: ' + e.min,
          'Type: ' + e.resourceType,
          'Self grow: ' + e.selfGrow,
          'icon: ' + e.icon,
          'Blockers:',
          ...this.formatBlockers(e.blockedBy),
        ];
      },
      posx: params.posx,
      posy: params.posy || 100,
      index: params.index,
      editComponent: EditResourceComponent,
      onDelete: () => {
        this.currentResources.splice(this.currentResources.findIndex(e => e.resource === resource), 1);

        // Update all references
        needToUpdate.length = 0;
        this.currentResources.forEach(e => {
          e.resource.blockedBy = onDeleteBlockers(e.rect, e.resource.blockedBy);
        });
        this.currentAchivements.forEach(e => {
          e.achievement.levels.forEach(level => {
            level.blockers = onDeleteBlockers(e.rect, level.blockers);
          });
        });
        this.currentBuildings.forEach(e => {
          e.building.blockedBy = onDeleteBlockers(e.rect, e.building.blockedBy);
          onDeleteRecord(e.rect, e.building.consume);
          onDeleteRecord(e.rect, e.building.cost);
          onDeleteRecord(e.rect, e.building.maintenance);
          onDeleteRecord(e.rect, e.building.produce);
          onDeleteRecord(e.rect, e.building.storage);
        });
        this.currentFeatures.forEach(e => {
          e.feature.blockedBy = onDeleteBlockers(e.rect, e.feature.blockedBy);
        });
        this.currentResearchs.forEach(e => {
          e.research.blockedBy = onDeleteBlockers(e.rect, e.research.blockedBy);
          onDeleteRecord(e.rect, e.research.bonusBuildingCosts);
          onDeleteRecord(e.rect, e.research.bonusResources);
          onDeleteRecord(e.rect, e.research.cost);
        });
        needToUpdate.forEach(e => e.updated());
      },
      onUpdate: () => {
        needToUpdate.length = 0;
        if (originalName !== resource.name) {
          // Update all references
          this.currentResources.forEach(e => {
            onUpdateBlockers(e.rect, e.resource.blockedBy);
          });
          this.currentAchivements.forEach(e => {
            e.achievement.levels.forEach(level => {
              onUpdateBlockers(e.rect, level.blockers);
            });
          });
          this.currentBuildings.forEach(e => {
            onUpdateBlockers(e.rect, e.building.blockedBy);
            onUpdateRecord(e.rect, e.building.consume);
            onUpdateRecord(e.rect, e.building.cost);
            onUpdateRecord(e.rect, e.building.maintenance);
            onUpdateRecord(e.rect, e.building.produce);
            onUpdateRecord(e.rect, e.building.storage);
          });
          this.currentFeatures.forEach(e => {
            onUpdateBlockers(e.rect, e.feature.blockedBy);
          });
          this.currentResearchs.forEach(e => {
            onUpdateBlockers(e.rect, e.research.blockedBy);
            onUpdateRecord(e.rect, e.research.bonusBuildingCosts);
            onUpdateRecord(e.rect, e.research.bonusResources);
            onUpdateRecord(e.rect, e.research.cost);
          });
          originalName = resource.name;
        }
        needToUpdate.forEach(e => e.updated());
      },
    });
    this.currentResources.push({
      resource,
      rect: result,
    });

    return result;
  };

  private appendResearch(research: IResearch, params?: { index?: number, posx?: number, posy?: number }) {
    const result = this.appendElement(research, {
      color: 'red',
      getTexts: (e) => {
        const result: string[] = [
          e.name,
          'Max level: ' + (e.maxLevel || 'Infinity'),
          'Costs: ',
          ...Object.keys(e.cost).map((costKey) => {
            return '&nbsp;&nbsp;' + costKey + ': ' + e.cost[costKey];
          }),
          'Bonus resource: ',
          ...Object.keys(e.bonusResources || {}).map((key) => {
            return '&nbsp;&nbsp;' + key + ': ' + e.bonusResources[key];
          }),
          'Bonus building: ',
          ...Object.keys(e.bonusBuildingCosts || {}).map((key) => {
            return '&nbsp;&nbsp;' + key + ': ' + e.bonusBuildingCosts[key];
          }),
          'Blockers:',
          ...this.formatBlockers(e.blockedBy),
        ];
        return result;
      },
      posx: params.posx,
      posy: params.posy || 320,
      index: params.index,
      editComponent: EditResearchComponent,
      onDelete: () => {
        this.currentResearchs.splice(this.currentResearchs.findIndex(e => e.research === research), 1);
      },
      onUpdate: () => { },
    });
    this.currentResearchs.push({
      research,
      rect: result,
    });

    return result;
  };

  private appendFeature(feature: IFeature, params?: { index?: number, posx?: number, posy?: number }) {
    let originalName = feature.name;
    const needToUpdate: rects[] = [];
    const onUpdateBlockers = (rect: rects, blockers?: IBlocker<any>[]) => {
      if (blockers) {
        blockers.forEach(b => {
          switch (b.type) {
            case 'building':
              // Nothing
              break;
            case 'feature':
              const typedBlocker = b as IFeatureBlocker;
              if (typedBlocker.params.name === originalName) {
                typedBlocker.params.name = feature.name;
                if (!needToUpdate.find(e => e === rect)) {
                  needToUpdate.push(rect);
                }
              }
              // Nothing
              break;
            case 'resource':
              // Nothing
              break;
            case 'resourceTotal':
              // Nothing
              break;
          }
        });
      }
    };
    const onDeleteBlockers = (rect: rects, blockers?: IBlocker<any>[]) => {
      if (!blockers) {
        return undefined;
      }
      return blockers.filter(b => {
        switch (b.type) {
          case 'building':
            // Nothing
            return true;
          case 'feature':
            const typedBlocker = b as IFeatureBlocker;
            if (typedBlocker.params.name === originalName) {
              if (!needToUpdate.find(e => e === rect)) {
                needToUpdate.push(rect);
              }
              return false;
            }
            return true;
          case 'resource':
            return true;
          case 'resourceTotal':
            return true;
        }
      });
    };
    const result = this.appendElement(feature, {
      color: '#fcf',
      getTexts: (e) => {
        return [
          e.name,
          'Blockers:',
          ...this.formatBlockers(e.blockedBy),
        ];
      },
      posx: params.posx,
      posy: params.posy || 420,
      index: params.index,
      editComponent: EditFeatureComponent,
      onDelete: () => {
        this.currentFeatures.splice(this.currentFeatures.findIndex(e => e.feature === feature), 1);

        // Update all references
        needToUpdate.length = 0;
        this.currentResources.forEach(e => {
          e.resource.blockedBy = onDeleteBlockers(e.rect, e.resource.blockedBy);
        });
        this.currentAchivements.forEach(e => {
          e.achievement.levels.forEach(level => {
            level.blockers = onDeleteBlockers(e.rect, level.blockers);
          });
        });
        this.currentBuildings.forEach(e => {
          e.building.blockedBy = onDeleteBlockers(e.rect, e.building.blockedBy);
        });
        this.currentFeatures.forEach(e => {
          e.feature.blockedBy = onDeleteBlockers(e.rect, e.feature.blockedBy);
        });
        this.currentResearchs.forEach(e => {
          e.research.blockedBy = onDeleteBlockers(e.rect, e.research.blockedBy);
        });
        needToUpdate.forEach(e => e.updated());
      },
      onUpdate: () => {
        needToUpdate.length = 0;
        if (originalName !== feature.name) {
          // Update all references
          this.currentResources.forEach(e => {
            onUpdateBlockers(e.rect, e.resource.blockedBy);
          });
          this.currentAchivements.forEach(e => {
            e.achievement.levels.forEach(level => {
              onUpdateBlockers(e.rect, level.blockers);
            });
          });
          this.currentBuildings.forEach(e => {
            onUpdateBlockers(e.rect, e.building.blockedBy);
          });
          this.currentFeatures.forEach(e => {
            onUpdateBlockers(e.rect, e.feature.blockedBy);
          });
          this.currentResearchs.forEach(e => {
            onUpdateBlockers(e.rect, e.research.blockedBy);
          });
          originalName = feature.name;
        }
        needToUpdate.forEach(e => e.updated());
      },
    });
    this.currentFeatures.push({
      feature,
      rect: result,
    });

    return result;
  };

  private appendBuilding(building: IBuilding, params?: { index?: number, posx?: number, posy?: number }) {
    let originalName = building.name;
    const needToUpdate: rects[] = [];
    const onUpdateBlockers = (rect: rects, blockers?: IBlocker<any>[]) => {
      if (blockers) {
        blockers.forEach(b => {
          switch (b.type) {
            case 'building':
              const typedBlocker = b as IBuildingBlocker;
              if (typedBlocker.params.name === originalName) {
                typedBlocker.params.name = building.name;
                if (!needToUpdate.find(e => e === rect)) {
                  needToUpdate.push(rect);
                }
              }
              break;
            case 'feature':
              // Nothing
              break;
            case 'resource':
              // Nothing
              break;
            case 'resourceTotal':
              // Nothing
              break;
          }
        });
      }
    };
    const onDeleteBlockers = (rect: rects, blockers?: IBlocker<any>[]) => {
      if (!blockers) {
        return undefined;
      }
      return blockers.filter(b => {
        switch (b.type) {
          case 'building':
            const typedBlocker = b as IBuildingBlocker;
            if (typedBlocker.params.name === originalName) {
              if (!needToUpdate.find(e => e === rect)) {
                needToUpdate.push(rect);
              }
              return false;
            }
            return true;
          case 'feature':
            return true;
          case 'resource':
            return true;
          case 'resourceTotal':
            return true;
        }
      });
    };
    const result = this.appendElement(building, {
      color: '#cff',
      getTexts: (e) => {
        return [
          e.name,
          'Costs: ',
          ...Object.keys(e.cost).map((costKey) => {
            return '&nbsp;&nbsp;' + costKey + ': ' + e.cost[costKey];
          }),
          'Consume: ',
          ...Object.keys(e.consume || {}).map((key) => {
            return '&nbsp;&nbsp;' + key + ': ' + e.consume[key];
          }),
          'Produce: ',
          ...Object.keys(e.produce || {}).map((key) => {
            return '&nbsp;&nbsp;' + key + ': ' + e.produce[key];
          }),
          'Storage: ',
          ...Object.keys(e.storage || {}).map((key) => {
            return '&nbsp;&nbsp;' + key + ': ' + e.storage[key];
          }),
          'Maintenance: ',
          ...Object.keys(e.maintenance || {}).map((key) => {
            return '&nbsp;&nbsp;' + key + ': ' + e.maintenance[key];
          }),
          'Blockers:',
          ...this.formatBlockers(e.blockedBy),
        ];
      },
      posx: params.posx,
      posy: params.posy || 480,
      index: params.index,
      editComponent: EditBuildingComponent,
      onDelete: () => {
        this.currentBuildings.splice(this.currentBuildings.findIndex(e => e.building === building), 1);

        // Update all references
        needToUpdate.length = 0;
        this.currentResources.forEach(e => {
          e.resource.blockedBy = onDeleteBlockers(e.rect, e.resource.blockedBy);
        });
        this.currentAchivements.forEach(e => {
          e.achievement.levels.forEach(level => {
            level.blockers = onDeleteBlockers(e.rect, level.blockers);
          });
        });
        this.currentBuildings.forEach(e => {
          e.building.blockedBy = onDeleteBlockers(e.rect, e.building.blockedBy);
        });
        this.currentFeatures.forEach(e => {
          e.feature.blockedBy = onDeleteBlockers(e.rect, e.feature.blockedBy);
        });
        this.currentResearchs.forEach(e => {
          e.research.blockedBy = onDeleteBlockers(e.rect, e.research.blockedBy);
        });
        needToUpdate.forEach(e => e.updated());
      },
      onUpdate: () => {
        needToUpdate.length = 0;
        if (originalName !== building.name) {
          // Update all references
          this.currentResources.forEach(e => {
            onUpdateBlockers(e.rect, e.resource.blockedBy);
          });
          this.currentAchivements.forEach(e => {
            e.achievement.levels.forEach(level => {
              onUpdateBlockers(e.rect, level.blockers);
            });
          });
          this.currentBuildings.forEach(e => {
            onUpdateBlockers(e.rect, e.building.blockedBy);
          });
          this.currentFeatures.forEach(e => {
            onUpdateBlockers(e.rect, e.feature.blockedBy);
          });
          this.currentResearchs.forEach(e => {
            onUpdateBlockers(e.rect, e.research.blockedBy);
          });
          originalName = building.name;
        }
        needToUpdate.forEach(e => e.updated());
      },
    });
    this.currentBuildings.push({
      building,
      rect: result,
    });

    return result;
  };

  private appendAchievement(achievement: IAchievement, params?: { index?: number, posx?: number, posy?: number }) {
    const result = this.appendElement(achievement, {
      color: '#cfc',
      getTexts: (e) => {
        const blockers: string[] = [];
        e.levels.forEach(level => {
          blockers.push('&nbsp;&nbsp;' + level.level + ':')
          blockers.push(...this.formatBlockers(level.blockers).map(f => '&nbsp;&nbsp;' + f));
        });
        return [
          e.name,
          'Blockers:',
          ...blockers,
        ];
      },
      posx: params.posx,
      posy: params.posy || 530,
      index: params.index,
      editComponent: EditAchievementComponent,
      onDelete: () => {
        this.currentAchivements.splice(this.currentAchivements.findIndex(e => e.achievement === achievement), 1);
      },
      onUpdate: () => { },
    });
    this.currentAchivements.push({
      achievement,
      rect: result,
    });

    return result;
  };

  private addDragFeature(rect: rects) {
    rect.d3.forEach(e => {
      e.call(d3.drag()
        .on("start", (e) => this.dragstarted(e, rect))
        .on("drag", (e) => this.dragged(e, rect))
        .on("end", () => this.dragended(rect))
        .subject(() => {
          return rect.rect;
        })
      );
      if (e.attr("action")) {
        e.attr("cursor", "pointer");
      } else {
        e.attr("cursor", "grab");
      }
    });
  }

  private dragstarted(event: d3.D3DragEvent<d3.DraggedElementBaseType, any, any>, def: rects) {
    def.main.raise();
    def.d3.filter(e => !e.attr("action")).forEach(e => e.attr("cursor", "grabbing"));
  }

  private dragged(event: d3.D3DragEvent<d3.DraggedElementBaseType, any, any>, def: rects) {
    let dx = event.dx;
    let dy = event.dy;
    if (this.isAddMode && this.transformCurrent) {
      dx /= this.transformCurrent.k;
      dy /= this.transformCurrent.k;
    }
    def.posx += dx;
    def.posy += dy;
    def.d3.forEach(e => e.attr("x", String(def.posx)).attr("y", String(def.posy)));
  }

  private dragended(def: rects) {
    this.isAddMode = false;
    def.d3.filter(e => !e.attr("action")).forEach(e => e.attr("cursor", "grab"));
    this.currentAdd = undefined;
  }

  public save(): void {
    this.modalService.show(SaveComponent, {
      animated: true,
      class: 'modal-lg',
      initialState: {
        datas: this.createGameContext(),
      },
    });
  }
}
interface rects {
  rect: SVGGElement;
  posx: number;
  posy: number;
  color: string;
  name: string;
  edit: SVGUseElement;
  d3: d3.Selection<SVGGraphicsElement, any, null, undefined>[];
  main: d3.Selection<SVGGElement, any, null, undefined>;
  startDragEvent?: DragBehavior<Element, unknown, unknown>;
  texts: SVGTextElement[];
  updated: () => void;
}

interface IAppendParameters<T> {
  getTexts: (e: T) => string[];
  editComponent: any;
  onUpdate: (e: T) => void;
  onDelete: (e: T) => void;
  color: string;
  index?: number;
  posx?: number;
  posy: number;
}
