import { DrawCtx, DrawSprite } from "~/draw";

class Point implements DrawSprite {
	private father: BigDanmu
	private id: string
	private x: number
	private y: number
	private nowSize: number
	private size: number
	private speed: number
	constructor(father: BigDanmu) {
		this.father = father
		this.size = father.getSize()
		this.id = window.crypto.randomUUID()
		let t = Math.random() * 1.65 + 0.1 // 解决心内部凹陷处重叠
		if(t > 0.95)t += 0.15  // 解决底部尖端重叠
		t *= Math.PI
		let x = 16 * Math.pow(Math.sin(t), 3)
		let y = -13 * Math.cos(t) + 5 * Math.cos(2 * t) + 2 * Math.cos(3 * t) + Math.cos(4 * t)
		let basePos = father.getPos()
		this.x = basePos.x + x * this.size * 3
		this.y = basePos.y + y * this.size * 3
		this.nowSize = 3 * this.size - Math.random() * this.size * 2
		this.speed = Math.sqrt(Math.random() * 4 * this.size)
	}
	draw(ctx: CanvasRenderingContext2D): Promise<void> {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.nowSize, 0, 2 * Math.PI)
		ctx.fill()
	}
	async update(): Promise<void> {
		// 大小变化
		this.nowSize -= 0.1 * this.size
		if (this.nowSize < 0.5 ) return this.rm()

		// 移动路径
		const target = this.father.getPos()
		const direction = Math.sqrt(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2))
		if (direction < 0.5 * this.size) return this.rm()
		this.x += this.speed / direction * (target.x - this.x)
		this.y += this.speed / direction * (target.y - this.y)
	}
	getId(): string {
		return this.id
	}
	private rm(){
		this.father.rmPoint(this.id)
	}
}

export class BigDanmu implements DrawSprite {
	private x: number
	private y: number
	private size: number
	private target: {x: number, y: number}
	private points: Map<string, Point> = new Map()
	constructor(drawCtx: DrawCtx, size: number) {
		this.size = size
		this.x = document.documentElement.clientWidth / 2
		this.y = document.documentElement.clientHeight / 2
		drawCtx.addUpdateHook(() => {this.update()})
		drawCtx.addSprite(this)
		this.target = {x: this.x, y: this.y}
		addEventListener('mousemove', (e)=>{this.target = {x: e.clientX, y: e.clientY}})
		addEventListener('touchstart', (e)=>{this.target = {x: e.touches[0].clientX, y: e.touches[0].clientY}})
		addEventListener('touchmove', (e)=>{this.target = {x: e.touches[0].clientX, y: e.touches[0].clientY}})
	}
	async draw(ctx: CanvasRenderingContext2D): Promise<void> {
		ctx.fillStyle = 'red'
		this.points.forEach((point) => { point.draw(ctx) })
	}
	async update(): Promise<void> {
		// 生成点点
		for(let i = 0; i < 10; i++)this.newPoint()
		const updatePromises: Promise<void>[] = []
		this.points.forEach((point) => { updatePromises.push(point.update()) })
		await Promise.all(updatePromises)
		// 移动
		const direction = Math.sqrt(Math.pow(this.x - this.target.x, 2) + Math.pow(this.y - this.target.y, 2))
		if (direction < 3 * this.size) return
		let speed = Math.min(10, Math.pow(direction, 0.4))
		this.x += speed * this.size / direction * (this.target.x - this.x)
		this.y += speed * this.size / direction * (this.target.y - this.y)
	}
	getSize(): number {
		return this.size
	}
	getPos(): {x: number, y: number} {
		return {x: this.x, y: this.y}
	}
	rmPoint(id: string){
		this.points.delete(id)
	}
	private newPoint(){
		const point = new Point(this)
		this.points.set(point.getId(), point)
	}
}