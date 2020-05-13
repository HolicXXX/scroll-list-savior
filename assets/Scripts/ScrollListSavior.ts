import ListItem, { ListItemData } from './ListItem';

const { ccclass, property } = cc._decorator;

enum ListDirection {
	Vertical,
	Horizontal,
}

class ListItemDataWrapper {
	constructor(itemData: ListItemData) {
		this.itemData = itemData;
		this.itemPosition = cc.v2(0, 0);
	}

	targetItem?: ListItem;
	itemData: ListItemData;
	itemPosition: cc.Vec2;
}

@ccclass
export default class ScrollListSavior extends cc.Component {
	@property(cc.Node)
	protected content: cc.Node = null;

	@property({ type: cc.Enum(ListDirection), tooltip: 'Content layout type' })
	protected listDirection: ListDirection = ListDirection.Vertical;

	@property({
		tooltip: 'X available when Horizontal, Y available when Vertical',
	})
	protected gap: cc.Vec2 = cc.Vec2.ZERO;

	@property({ tooltip: 'Available when Horizontal' })
	protected paddingLeft: number = 0;

	@property({ tooltip: 'Available when Horizontal' })
	protected paddingRight: number = 0;

	@property({ tooltip: 'Available when Vertical' })
	protected paddingTop: number = 0;

	@property({ tooltip: 'Available when Vertical' })
	protected paddingBottom: number = 0;

	@property(cc.Prefab)
	itemPrefab: cc.Prefab = null;

	onLoad() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
	}

	protected contentStartPos: cc.Vec2 = cc.Vec2.ZERO;

	protected touchMoveDelta: cc.Vec2 = undefined;
	protected onTouchStart(e: cc.Event.EventTouch) {
		this.contentStartPos = this.content.getPosition();
		this.touchMoveDelta = cc.v2(0, 0);
	}

	onTouchMove(e: cc.Event.EventTouch) {
		this.touchMoveDelta.addSelf(e.getDelta());
		this.updateContentPosition();
	}

	onTouchEnd(e: cc.Event.EventTouch) {
		this.updateContentPosition();
	}

	onTouchCancel(e: cc.Event.EventTouch) {
		this.updateContentPosition();
	}

	protected updateContentPosition() {
		const toPos = this.contentStartPos.add(this.touchMoveDelta);
		if (this.listDirection === ListDirection.Vertical) {
			toPos.x = this.contentInitPosition.x;
			toPos.y = Math.max(
				Math.min(
					this.contentHeight - this.node.height * this.node.anchorY,
					toPos.y
				),
				this.contentInitPosition.y
			);
		} else if (this.listDirection === ListDirection.Horizontal) {
			toPos.x = Math.min(
				Math.max(
					this.node.width * this.node.anchorX - this.contentWidth,
					toPos.x
				),
				this.contentInitPosition.x
			);
			toPos.y = this.contentInitPosition.y;
		}
		this.content.setPosition(toPos);
		this.updateItemsVisibility();
	}

	start() {
		//Test
		const tempData: Array<ListItemData> = [];
		for (let i = 0; i < 1000000; i++) {
			tempData.push({ id: i.toString() });
		}
		this.updateDataSource(tempData);
		//
	}

	// update (dt) {}

	protected dataSource: Array<ListItemData> = [];
	protected dataSourceWrapper: Array<ListItemDataWrapper> = [];
	updateDataSource(dataSource: Array<ListItemData>) {
		this.dataSource = dataSource;
		this.dataSourceWrapper = dataSource.map(
			(data) => new ListItemDataWrapper(data)
		);

		this.updateItemNodeConfig();
		this.applyDataSource();
	}

	updateItemData(index: number, itemData: ListItemData) {
		const wrapper = this.dataSourceWrapper[index];
		if (!wrapper) return;

		wrapper.itemData = this.dataSource[index] = itemData;
		if (!!wrapper.targetItem) wrapper.targetItem.updateData(itemData);
	}

	indexOf(itemData: ListItemData) {
		return this.dataSource.indexOf(itemData);
	}

	protected itemWidth: number = 0;
	protected itemHeight: number = 0;
	protected itemAnchorX: number = 0.5;
	protected itemAnchorY: number = 0.5;
	protected itemScaleX: number = 1;
	protected itemScaleY: number = 1;
	protected updateItemNodeConfig() {
		const itemNode: cc.Node = this.itemPrefab.data;
		this.itemWidth = itemNode.width;
		this.itemHeight = itemNode.height;
		this.itemAnchorX = itemNode.anchorX;
		this.itemAnchorY = itemNode.anchorY;
		this.itemScaleX = itemNode.scaleX;
		this.itemScaleY = itemNode.scaleY;
	}

	protected contentInitPosition: cc.Vec2 = cc.Vec2.ZERO;
	protected contentWidth: number = 0;
	protected contentHeight: number = 0;
	protected applyDataSource() {
		let contentWidth: number = this.paddingLeft + this.paddingRight;
		let contentHeight: number = this.paddingTop + this.paddingBottom;
		for (let index = 0; index < this.dataSourceWrapper.length; ++index) {
			const itemDataWrapper = this.dataSourceWrapper[index];
			const pos = cc.v2(0, 0);
			if (this.listDirection === ListDirection.Vertical) {
				pos.y =
					(this.itemHeight * this.itemAnchorY + this.itemHeight * index) *
						this.itemScaleY +
					this.gap.y * index +
					this.paddingTop;
				pos.x =
					this.itemWidth * this.itemAnchorX * this.itemScaleX +
					(this.node.width - this.itemWidth * this.itemScaleX) * 0.5;
				contentHeight +=
					this.itemHeight * this.itemScaleY + (index == 0 ? 0 : this.gap.y);
			} else if (this.listDirection === ListDirection.Horizontal) {
				pos.x =
					(this.itemWidth * this.itemAnchorX + this.itemWidth * index) *
						this.itemScaleX +
					this.gap.x * index +
					this.paddingLeft;
				pos.y =
					this.itemHeight * this.itemAnchorY * this.itemScaleY +
					(this.node.height - this.itemHeight * this.itemScaleY) * 0.5;
				contentWidth +=
					this.itemWidth * this.itemScaleX + (index == 0 ? 0 : this.gap.x);
			}
			itemDataWrapper.itemPosition.x = pos.x;
			itemDataWrapper.itemPosition.y = -pos.y;
		}

		if (this.listDirection === ListDirection.Vertical) {
			this.contentWidth = this.node.width;
			this.contentHeight = contentHeight;
		} else if (this.listDirection === ListDirection.Horizontal) {
			this.contentWidth = contentWidth;
			this.contentHeight = this.node.height;
		}
		this.contentInitPosition = cc.v2(
			-this.node.width * this.node.anchorX,
			this.node.height * (1 - this.node.anchorY)
		);
		this.content.setPosition(this.contentInitPosition);

		this.updateItemsVisibility();
	}

	protected listItemPool: Array<ListItem> = [];
	protected createItemInstance(): ListItem {
		const itemNode = cc.instantiate(this.itemPrefab);
		const listItem = itemNode.getComponent(ListItem);
		return listItem;
	}

	protected getItemInstance(itemDataWrapper: ListItemDataWrapper): ListItem {
		let listItem = this.listItemPool.pop() || this.createItemInstance();
		this.content.addChild(listItem.node);
		listItem.node.active = true;
		listItem.updateData(itemDataWrapper.itemData);
		listItem.node.setPosition(itemDataWrapper.itemPosition);
		return listItem;
	}

	protected returnItemInstance(listItem: ListItem) {
		listItem.clear();
		listItem.node.removeFromParent();
		listItem.node.active = false;
		this.listItemPool.push(listItem);
	}

	protected updateItemsVisibility() {
		const visibleRect = cc.rect(
			-this.node.width * this.node.anchorX,
			-this.node.height * this.node.anchorY,
			this.node.width,
			this.node.height
		);
		const itemActuralL = this.itemWidth * this.itemScaleX * this.itemAnchorX;
		const itemActuralB = this.itemHeight * this.itemScaleY * this.itemAnchorY;
		const itemActuralW = this.itemWidth * this.itemScaleX;
		const itemActuralH = this.itemHeight * this.itemScaleY;
		for (const itemDataWrapper of this.dataSourceWrapper) {
			const itemPos = cc.v2(
				itemDataWrapper.itemPosition.x + this.content.x,
				itemDataWrapper.itemPosition.y + this.content.y
			);
			const itemRect = cc.rect(
				itemPos.x - itemActuralL,
				itemPos.y - itemActuralB,
				itemActuralW,
				itemActuralH
			);

			if (visibleRect.intersects(itemRect)) {
				if (!itemDataWrapper.targetItem) {
					itemDataWrapper.targetItem = this.getItemInstance(itemDataWrapper);
				}
			} else {
				if (!!itemDataWrapper.targetItem) {
					this.returnItemInstance(itemDataWrapper.targetItem);
					itemDataWrapper.targetItem = undefined;
				}
			}
		}
	}

	onDestroy() {
		this.node.targetOff(this);
	}
}
