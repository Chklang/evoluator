import { Component, Directive, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import * as d3 from 'd3';
import { DragBehavior } from 'd3';
import * as PreHistory from "../../../../../pre-history/src/app/database";
import { IBuilding, IAchievement, IResource, IResearch, IFeature, IGameContext } from 'game-engine';
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
    gameContext.allAchievements.forEach((achievement, index) => this.appendAchivement(achievement, { index }));

    const addResource = document.createElementNS(svgns, 'rect');
    addResource.style.fill = 'yellow';
    addResource.setAttribute("x", '5');
    addResource.setAttribute("y", "5");
    addResource.setAttribute("width", String(30));
    addResource.setAttribute("height", String(30));
    this.menuGroup.appendChild(addResource);
    (addResource as any).obj = <rects>{
      color: 'yellow',
      posx: 5,
      posy: 5,
      rect: addResource,
      d3: [
        d3.select(addResource)
      ],
      type: "addResource",
      name: "toto",
      main: d3.select(addResource),
      edit: null,
      texts: [],
    }
    d3.select(addResource).call(
      d3.drag()
        .on("start", (e) => this.dragstarted(e, this.currentAdd))
        .on("drag", (e) => this.dragged(e, this.currentAdd))
        .on("end", () => this.dragended(this.currentAdd))
        .subject((event, d) => {
          this.isAddMode = true;
          const factor = this.transformCurrent ? this.transformCurrent.k : 1;
          const newResource: IResource = {
            icon: '',
            max: 100,
            name: 'NewRes',
            resourceType: 'CLASSIC',
          };
          this.currentAdd = this.appendResource(newResource, {
            posx: (event.x - (this.transformCurrent ? this.transformCurrent.x : 0) - 90) / factor,
            posy: (event.y - (this.transformCurrent ? this.transformCurrent.y : 0) - 25) / factor,
          });
          this.currentAdd.d3.forEach(e => e.attr("cursor", "grabbing"));
          return this.currentAdd.d3;
        })
    );
    d3.select(addResource).attr("cursor", "grab");

    const addResearch = document.createElementNS(svgns, 'rect');
    addResearch.style.fill = 'red';
    addResearch.setAttribute("x", '40');
    addResearch.setAttribute("y", "5");
    addResearch.setAttribute("width", String(30));
    addResearch.setAttribute("height", String(30));
    this.menuGroup.appendChild(addResearch);
    (addResearch as any).obj = <rects>{
      color: 'red',
      posx: 5,
      posy: 5,
      rect: addResearch,
      d3: [
        d3.select(addResearch)
      ],
      type: "addResearch",
      name: "toto",
      main: d3.select(addResearch),
      edit: null,
      texts: [],
    }
    d3.select(addResearch).call(
      d3.drag()
        .on("start", (e) => this.dragstarted(e, this.currentAdd))
        .on("drag", (e) => this.dragged(e, this.currentAdd))
        .on("end", () => this.dragended(this.currentAdd))
        .subject((event, d) => {
          this.isAddMode = true;
          const factor = this.transformCurrent ? this.transformCurrent.k : 1;
          const newResearch: IResearch = {
            name: 'NewResearch',
            cost: {},
            bonusResources: {},
            bonusBuildingCosts: {},
          };
          this.currentAdd = this.appendResearch(newResearch, {
            posx: (event.x - (this.transformCurrent ? this.transformCurrent.x : 0) - 90) / factor,
            posy: (event.y - (this.transformCurrent ? this.transformCurrent.y : 0) - 25) / factor,
          });
          this.currentAdd.d3.forEach(e => e.attr("cursor", "grabbing"));
          return this.currentAdd.d3;
        })
    );
    d3.select(addResearch).attr("cursor", "grab");
    svgD3.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.001, 1000])
      .on("zoom", ({ transform }) => {
        this.transformCurrent = transform;
        d3.select(drawGroup).attr("transform", transform);
      }));
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

  private appendElement<T>(element: T, params: { getTexts: (e: T) => string[], editComponent: any, color: string, index?: number, posx?: number, posy: number }) {
    const rect = document.createElementNS(svgns, "rect");
    const edit = document.createElementNS(svgns, "use");
    edit.setAttribute("transform", "translate(160, -20)");
    edit.setAttribute("href", "#editButton");
    edit.setAttribute("action", "edit");
    const g = document.createElementNS(svgns, "g");
    g.appendChild(rect);
    g.appendChild(edit);
    const texts = params.getTexts(element);
    const textElements: SVGTextElement[] = texts.map((line, indexLine) => {
      return this.addText(g, line, indexLine, indexLine === 0);
    });
    const result: rects = {
      posx: params.posx || (params.index || 0) * 200,
      posy: params.posy,
      color: params.color,
      name: texts[0],
      rect: g,
      d3: [
        d3.select(rect),
        d3.select(edit),
      ],
      main: d3.select(g),
      edit,
      texts: textElements,
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
      });
    };

    return result;
  }

  private appendResource(resource: IResource, params?: { index?: number, posx?: number, posy?: number }) {
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
        ];
      },
      posx: params.posx,
      posy: params.posy || 100,
      index: params.index,
      editComponent: EditResourceComponent,
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
          'Max level: ' + (e.maxLevel || 0),
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
        ];
        return result;
      },
      posx: params.posx,
      posy: params.posy || 320,
      index: params.index,
      editComponent: EditResearchComponent,
    });
    this.currentResearchs.push({
      research,
      rect: result,
    });

    return result;
  };

  private appendFeature(feature: IFeature, params?: { index?: number, posx?: number, posy?: number }) {
    const result = this.appendElement(feature, {
      color: '#fcf',
      getTexts: (e) => {
        return [
          e.name,
        ];
      },
      posx: params.posx,
      posy: params.posy || 420,
      index: params.index,
      editComponent: EditFeatureComponent,
    });
    this.currentFeatures.push({
      feature,
      rect: result,
    });

    return result;
  };

  private appendBuilding(building: IBuilding, params?: { index?: number, posx?: number, posy?: number }) {
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
        ];
      },
      posx: params.posx,
      posy: params.posy || 480,
      index: params.index,
      editComponent: EditBuildingComponent,
    });
    this.currentBuildings.push({
      building,
      rect: result,
    });

    return result;
  };

  private appendAchivement(achievement: IAchievement, params?: { index?: number, posx?: number, posy?: number }) {
    const result = this.appendElement(achievement, {
      color: '#cfc',
      getTexts: (e) => {
        return [
          e.name,
        ];
      },
      posx: params.posx,
      posy: params.posy || 530,
      index: params.index,
      editComponent: EditAchievementComponent,
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
      if (e.attr("action") === "edit") {
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
  type?: "addResource" | "addResearch";
  startDragEvent?: DragBehavior<Element, unknown, unknown>;
  texts: SVGTextElement[];
}