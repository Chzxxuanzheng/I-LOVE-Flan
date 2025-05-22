import { DrawCtx, DrawSprite } from "~/draw";

/**
 * 表示心形弹幕上的单个点。
 * @implements {DrawSprite}
 */
class Point implements DrawSprite {
	/** 父级 BigDanmu 实例 */
	private father: BigDanmu
	/** 点的唯一标识符 */
	private id: string
	/** 当前 x 坐标 */
	private x: number
	/** 当前 y 坐标 */
	private y: number
	/** 当前点的半径 */
	private nowSize: number
	/** 点的基础半径 */
	private size: number
	/** 点的移动速度 */
	private speed: number
	/**
	 * 构造一个 Point 实例。
	 * @param father 父级 BigDanmu 实例
	 */
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
	/**
	 * 在画布上绘制该点。
	 * @param ctx Canvas 2D 上下文
	 */
	draw(ctx: CanvasRenderingContext2D): Promise<void> {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.nowSize, 0, 2 * Math.PI)
		ctx.fill()
	}
	/**
	 * 更新点的状态（位置、大小、消失判定）。
	 */
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
	/**
	 * 获取点的唯一 id。
	 */
	getId(): string {
		return this.id
	}
	/**
	 * 移除该点。
	 */
	private rm(){
		this.father.rmPoint(this.id)
	}
}

/**
 * 心形大弹幕，负责生成和管理所有 Point。
 * @implements {DrawSprite}
 */
export class BigDanmu implements DrawSprite {
	/** 当前 x 坐标 */
	private x: number
	/** 当前 y 坐标 */
	private y: number
	/** 心形大小缩放 */
	private size: number
	/** 鼠标/触摸目标点 */
	private target: {x: number, y: number}
	/** 所有点的集合 */
	private points: Map<string, Point> = new Map()
	/**
	 * 构造 BigDanmu 实例。
	 * @param drawCtx 画布上下文
	 * @param size 缩放系数
	 */
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
	/**
	 * 绘制所有点。
	 * @param ctx Canvas 2D 上下文
	 */
	async draw(ctx: CanvasRenderingContext2D): Promise<void> {
		ctx.fillStyle = 'red'
		this.points.forEach((point) => { point.draw(ctx) })
	}
	/**
	 * 更新所有点，并移动心形整体。
	 */
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
	/**
	 * 获取心形缩放系数。
	 */
	getSize(): number {
		return this.size
	}
	/**
	 * 获取当前心形中心坐标。
	 */
	getPos(): {x: number, y: number} {
		return {x: this.x, y: this.y}
	}
	/**
	 * 移除指定 id 的点。
	 * @param id 点的唯一标识符
	 */
	rmPoint(id: string){
		this.points.delete(id)
	}
	/**
	 * 新增一个点。
	 */
	private newPoint(){
		const point = new Point(this)
		this.points.set(point.getId(), point)
	}
}