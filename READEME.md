# ScrollListSavior

一款用于 Cocos Creator 的滑动列表，实现了`ListItem`的复用，使得在列表数据量巨大的时候不会出现加载卡顿或者滑动卡顿，亲测数据量为 10000 时帧率为 60 左右。数据量到达 1000000 时帧率波动，但依然可以维持在 40-50 左右。

## Usage

- Clone 本项目之后将`assets/Scripts/`下的两个脚本一同放入自用的项目中，参考`assets/Scenes/demo.fire`或者`assets/Prefabs/ScrollListSavior.prefab`的使用即可，实际使用的`Item`预制体可随意，只要挂上`assets/Scripts/ListItem.ts`脚本在`Item`预制体的根节点就行，
