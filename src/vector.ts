export class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector): Vector {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector): Vector {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  mul(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  div(scalar: number): Vector {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  toXY(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  static fromXY(obj: { x: number; y: number }): Vector {
    return new Vector(obj.x, obj.y);
  }
}
