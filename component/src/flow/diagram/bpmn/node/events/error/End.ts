import AnchorPoint from '@app/flow/diagram/AnchorPoint';
import Node from '@app/flow/diagram/bpmn/Node';
import { innerFigureStyle, previewStyles, selectionStyle, styles } from '@app/flow/diagram/bpmn/node/events/eventsStyles/EndConstants';
import Lightning from '@app/flow/diagram/bpmn/shapes/Lightning';
import Text from '@app/flow/diagram/bpmn/shapes/Text';
import Coordinates from '@app/flow/graphics/canvas/Coordinates';
import CanvasCircle from '@app/flow/graphics/canvas/shapes/CanvasCircle';
import Store from '@app/flow/store/Store';


export default class End extends Node {
  public name = 'End';

  private circle: CanvasCircle;
  private circlePreview: CanvasCircle;
  private circleSelection: CanvasCircle;

  private lightning: Lightning;
  private lightningPreview: Lightning;

  private textArea: Text;

  constructor(ctx: CanvasRenderingContext2D, coordinates: Coordinates, radius?: number) {
    super(coordinates);
    const shapeRadius = radius || 20;
    const activeRadius = shapeRadius + 3;

    const circleParams = {
      x: coordinates.x,
      y: coordinates.y,
      radius: shapeRadius
    };

    const circlePreviewParams = {
      x: coordinates.x,
      y: coordinates.y,
      radius: shapeRadius - 2
    };

    const circleSelectionParams = {
      x: coordinates.x,
      y: coordinates.y,
      radius: activeRadius
    };

    const lightningParams = {
      x: coordinates.x,
      y: coordinates.y,
      width: shapeRadius*0.5,
      height: shapeRadius*0.6,
    };

    const lightningPreviewParams = {
      x: coordinates.x,
      y: coordinates.y,
      width: 9,
      height: 11
    };

    const canvas = ctx.canvas;
    const tmpHookDiv = document.createElement('div');

    this.circle = new CanvasCircle(canvas, tmpHookDiv, styles, circleParams);
    this.circlePreview = new CanvasCircle(canvas, tmpHookDiv, previewStyles, circlePreviewParams);
    this.circleSelection = new CanvasCircle(canvas, tmpHookDiv, selectionStyle, circleSelectionParams);

    this.lightning = new Lightning(canvas, tmpHookDiv, innerFigureStyle, lightningParams);
    this.lightningPreview = new Lightning(canvas, tmpHookDiv, innerFigureStyle, lightningPreviewParams);

    this.textArea = new Text(ctx, new Coordinates(coordinates.x, coordinates.y + activeRadius + 2), shapeRadius, shapeRadius);

    this.points = [
      new AnchorPoint(ctx, new Coordinates(coordinates.x - shapeRadius, coordinates.y), AnchorPoint.Orientation.Left),
      new AnchorPoint(ctx, new Coordinates(coordinates.x, coordinates.y - shapeRadius), AnchorPoint.Orientation.Top),
      new AnchorPoint(ctx, new Coordinates(coordinates.x + shapeRadius, coordinates.y), AnchorPoint.Orientation.Right),
      new AnchorPoint(ctx, new Coordinates(coordinates.x, coordinates.y + shapeRadius), AnchorPoint.Orientation.Bottom),
    ];
  }

  public draw() {
    this.textArea.text = this.label;
    this.circle.isActive = this.isActive;
    this.lightning.isActive = this.isActive;

    this.circle.isHover = this.isHover;
    this.lightning.isHover = this.isHover;

    this.circle.draw();
    this.lightning.draw();

    if (this.isActive) {
      this.circleSelection.draw();
    }

    if (!this.isEditing) {
      this.textArea.draw();
    }

    if (this.isActive || this.isHover) {
      this.drawConnectionPoints();
    }
  }


  public drawPreview() {
    this.circlePreview.isHover = this.isHover;
    this.lightningPreview.isHover = this.isHover;

    this.circlePreview.draw();
    this.lightningPreview.draw();
  }

  private drawConnectionPoints() {
    this.points.forEach(point => point.draw());
  }

  public includes(coordinates: Coordinates) {
    const isInCircle = this.circle.includes(coordinates.x, coordinates.y);
    const isInConnectionPoint = !!this.getConnectionPoint(coordinates);
    const isTextAreaIncludes = this.textArea.includes(coordinates);

    return isInCircle || isInConnectionPoint || isTextAreaIncludes;
  }

  public previewIncludes(coordinates: Coordinates) {
    return this.circlePreview.includes(coordinates.x, coordinates.y);
  }

  public renderHtml(parent: HTMLElement, store: Store) {
    this.textArea.renderHtml(parent, store, this.id, this.isEditing);
  }

  public move(dx: number, dy: number) {
    this.coordinates.move(dx, dy);
    this.circle.move(dx, dy);
    this.circleSelection.move(dx, dy);
    this.lightning.move(dx, dy);
    this.textArea.move(dx, dy);
    this.points.forEach(point => point.move(dx, dy));
  }
}