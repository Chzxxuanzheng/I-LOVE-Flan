import { BigDanmu } from "~/bigDanmu"
import { DrawSprite } from "~/draw"

import smallDanmuImg from "@/small.png"

const small = new Image()
small.src = smallDanmuImg

interface Manager{
	removeDanmu: (id: string) => void
}

/**
 * 小弹幕精灵，负责表现和行为。
 * @implements {DrawSprite}
 */
export class SmallDanmu implements DrawSprite {
	/** 当前弹幕的缩放尺寸 */
	private size: number
	/** 当前 x 坐标 */
	private x: number = 0
	/** 当前 y 坐标 */
	private y: number = 0
	/** 当前速度向量 */
	private speed: {x: number, y: number}|undefined
	/** 管理器实例 */
	private manager: Manager
	/** 弹幕唯一标识 */
	private id: string
	/** 弹幕基础缩放尺寸 */
	private baseSize: number
	/** 当前透明度 */
	private alpha: number = 1
	/**
	 * 构造一个小弹幕实例。
	 * @param pos 初始位置
	 * @param manager 管理器实例
	 * @param size 缩放系数
	 */
	constructor(pos: { x: number, y: number }, manager: Manager, size: number){
		this.manager = manager
		this.size = size * 5
		this.id = window.crypto.randomUUID()
		this.baseSize = size
		this.x = pos.x
		this.y = pos.y
	}
	/**
	 * 在画布上绘制该弹幕。
	 * @param ctx Canvas 2D 上下文
	 */
	async draw(ctx: CanvasRenderingContext2D): Promise<void> {
		ctx.globalAlpha = this.alpha
		ctx.drawImage(small, 0, 0, 16, 16, this.x - 8*this.size, this.y - 8*this.size, 16*this.size, 16*this.size)
	}
	/**
	 * 更新弹幕状态（位置、透明度、速度等）。
	 * @param bigDanmu 大弹幕实例
	 */
	async update(bigDanmu: BigDanmu): Promise<void> {
		// 离场判定
		const w = document.documentElement.clientWidth
		const h = document.documentElement.clientHeight
		if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) return this.rm()

		// 登场透明度计算
		if(this.size>this.baseSize)this.size -= 0.3 * this.baseSize
		else this.size = this.baseSize
		this.alpha = this.baseSize * this.baseSize / (this.size * this.size)


		// 移动计算
		if (this.speed) {
			this.x += this.speed.x
			this.y += this.speed.y
		}

		// 加速度计算
		const pos = bigDanmu.getPos()
		const distanceX = Math.abs(pos.x - this.x)
		if (distanceX > 75 * this.baseSize) return
		const distanceY = Math.abs(pos.y - this.y)
		if (distanceX > 75 * this.baseSize) return
		const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
		if (distance > 75 * this.baseSize) return 
		const a = Math.sqrt(distance) * 0.01
		if (!this.speed) {
			this.speed = {
				x: -a / distance * (pos.x - this.x),
				y: -a / distance * (pos.y - this.y)
			}
			this.manager.danmusNumber --
		}else{
			this.speed.x -= a / distance * (pos.x - this.x)
			this.speed.y -= a / distance * (pos.y - this.y)
		}
	}
	/**
	 * 获取弹幕唯一 id。
	 */
	getId(): string {
		return this.id
	}
	/**
	 * 移除该弹幕。
	 * @private
	 */
	private rm(){
		if(!this.speed)this.manager.danmusNumber --
		this.manager.removeDanmu(this.id)
	}
}