<template>
	<div ref="scrollCon" @mousewheel="handlescroll" class="tags-outer-scroll-con">
		<div ref="scrollBody" class="tags-inner-scroll-body" :style="{left: tagBodyLeft + 'px'}">
			<transition-group name="taglist-moving-animation">
				<Tag type="dot" v-for="item in pageTagsList" ref="tagsPageOpened" :key="item.id" :name="item.id"
				     @on-close="closePage(item)"
				     @click.native="linkTo(item)"
				     :closable="item.name !== '首页'"
				     :color="item.id === currentPage.id ? 'blue' : 'default'">
					{{ item.label }}
				</Tag>
			</transition-group>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'tagsPageOpened',
		data () {
			return {
				tagBodyLeft: 0,
				pageTagsList: [],
				currentPage: store.currentPage
			};
		},
		methods: {
			addPage(page, params){
				if (!page) return;
				let r = this.pageTagsList.find(p => p.id === page.id);
				if (!r) this.pageTagsList.push(page);
				Object.assign(store.currentPage, page);
				store.currentPage.params = params;
			},
			closePage (item) {
				let index = this.pageTagsList.findIndex(p => p.id === item.id);
				this.pageTagsList.splice(index, 1);
				if (index - 1 < 0) {
					if (this.pageTagsList.length === 0){
						Object.assign(store.currentPage, { id:"", component:"", name:"", label: "", icon:"", children:undefined, params: {} });
						return;
					}
				}
				else index--;
				Object.assign(store.currentPage, this.pageTagsList[index]);
			},
			linkTo (item) {
				Object.assign(store.currentPage, item);
			},
			handlescroll (e) {
				let left = 0;
				if (e.wheelDelta > 0) {
					left = Math.min(0, this.tagBodyLeft + e.wheelDelta);
				} else {
					if (this.$refs.scrollCon.offsetWidth - 100 < this.$refs.scrollBody.offsetWidth) {
						if (this.tagBodyLeft < -(this.$refs.scrollBody.offsetWidth - this.$refs.scrollCon.offsetWidth + 100)) {
							left = this.tagBodyLeft;
						} else {
							left = Math.max(this.tagBodyLeft + e.wheelDelta, this.$refs.scrollCon.offsetWidth - this.$refs.scrollBody.offsetWidth - 100);
						}
					} else {
						this.tagBodyLeft = 0;
					}
				}
				this.tagBodyLeft = left;
			},
			moveToView (tag) {
				if (tag.offsetLeft < -this.tagBodyLeft) {
					this.tagBodyLeft = -tag.offsetLeft + 10;
				} else if (tag.offsetLeft + 10 > -this.tagBodyLeft && tag.offsetLeft + tag.offsetWidth < -this.tagBodyLeft + this.$refs.scrollCon.offsetWidth - 100) {
					// 标签在可视区域
				} else {
					this.tagBodyLeft = -(tag.offsetLeft - (this.$refs.scrollCon.offsetWidth - 100 - tag.offsetWidth) + 20);
				}
			}
		},
		mounted () {
			let self = this;
			let main = store.routerList.find(r => r.name === '首页');
			main && this.addPage(main);
			store.defaultPage && this.addPage(store.defaultPage);
			this.$router.on(this.addPage.bind(this));
			setTimeout(() => {
				let view = self.$refs.tagsPageOpened.find(t => t.name === self.currentPage.id);
				view && self.moveToView(view.$el);
			}, 1);
		}
	};
</script>