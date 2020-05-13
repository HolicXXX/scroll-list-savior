const { ccclass, property } = cc._decorator;

export abstract class ListItemData {
	id: string;
}

@ccclass
export default abstract class ListItem extends cc.Component {
	protected data: ListItemData = null;
	// onLoad () {}

	// start() {}

	// update (dt) {}

	updateData(data: ListItemData) {
		this.data = data;
		this.updateDisplay();
	}

	private tempLabel: cc.Label = null;
	updateDisplay() {
		this.clear();
		//Test
		const tempNode = new cc.Node('temp');
		this.tempLabel = tempNode.addComponent(cc.Label);
		this.node.addChild(tempNode);
		tempNode.color = cc.Color.BLACK;
		this.tempLabel.string = this.data.id;
		//
	}

	clear() {
		//Test
		if (!!this.tempLabel) {
			this.tempLabel.node.removeFromParent();
			this.tempLabel == null;
		}
		//
	}
}
