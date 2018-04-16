import {gl} from '../../globals';

abstract class Drawable {
  count: number = 0;

  bufIdx: WebGLBuffer;
  bufPos: WebGLBuffer;
  bufTranslate: WebGLBuffer;
  bufCol: WebGLBuffer;
  bufInstanceIdx: WebGLBuffer;
  bufScaleFactor: WebGLBuffer;

  idxGenerated: boolean = false;
  posGenerated: boolean = false;
  colGenerated: boolean = false;
  translateGenerated: boolean = false;
  instanceIdxGenerated: boolean = false;
  scaleFactorGenerated: boolean = false;

  numInstances: number = 0; // How many instances of this Drawable the shader program should draw

  abstract create() : void;

  destory() {
    gl.deleteBuffer(this.bufIdx);
    gl.deleteBuffer(this.bufPos);
    gl.deleteBuffer(this.bufCol);
    gl.deleteBuffer(this.bufTranslate);
    gl.deleteBuffer(this.bufInstanceIdx);
    gl.deleteBuffer(this.bufScaleFactor);
  }

  generateIdx() {
    this.idxGenerated = true;
    this.bufIdx = gl.createBuffer();
  }

  generatePos() {
    this.posGenerated = true;
    this.bufPos = gl.createBuffer();
  }

  generateCol() {
    this.colGenerated = true;
    this.bufCol = gl.createBuffer();
  }

  generateTranslate() {
    this.translateGenerated = true;
    this.bufTranslate = gl.createBuffer();
  }

  generateInstanceIdx() {
    this.instanceIdxGenerated = true;
    this.bufInstanceIdx = gl.createBuffer();
  }

  generateScaleFactor() {
    this.scaleFactorGenerated = true;
    this.bufScaleFactor = gl.createBuffer();
  }

  bindIdx(): boolean {
    if (this.idxGenerated) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    }
    return this.idxGenerated;
  }

  bindPos(): boolean {
    if (this.posGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    }
    return this.posGenerated;
  }

  bindCol(): boolean {
    if (this.colGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
    }
    return this.colGenerated;
  }

  bindTranslate(): boolean {
    if (this.translateGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufTranslate);
    }
    return this.translateGenerated;
  }

  bindInstanceIdx(): boolean {
    if (this.instanceIdxGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufInstanceIdx);
    }
    return this.instanceIdxGenerated;
  }

  bindScaleFactor(): boolean {
    if (this.scaleFactorGenerated) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufScaleFactor);
    }
    return this.scaleFactorGenerated;
  }

  elemCount(): number {
    return this.count;
  }

  drawMode(): GLenum {
    return gl.TRIANGLES;
  }

  setNumInstances(num: number) {
    this.numInstances = num;
  }
};

export default Drawable;
