<template>
    <Menu ref="sideMenu" :active-name="$store.currentPage.id" :open-names="$store.routerList.map(r => r.id)" width="auto" theme="dark" @on-select="changeMenu">
        <template v-for="item in $store.routerList" :key="item">
            <MenuItem v-if="(!item.children || item.children.length < 1) && item.label !== '首页' && item.show !== false" :name="item.id" :key="item">
                <Icon :type="item.icon" size="14"  :key="item"></Icon>
                <span class="layout-text"  :key="item">{{ item.label }}</span>
            </MenuItem>
            <Submenu v-else-if="item.label !== '首页' && item.show !== false" :name="item.id"  :key="item">
                <template slot="title">
                    <Icon :type="item.icon" size="14"></Icon>
                    <span class="layout-text">{{ item.label }}</span>
                </template>
                <template v-for="child in item.children" :key="child">
                    <MenuItem :name="child.id" :key="child">
                        <Icon :type="child.icon" size="14" :key="child"></Icon>
                        <span class="layout-text" :key="child">{{ child.label }}</span>
                    </MenuItem>
                </template>
            </Submenu>
        </template>
    </Menu>
</template>

<script>
	
	export default {
		name: 'sidebarMenu',
		data () {
			return {};
		},
		methods: {
			changeMenu (id) {
				this.$router(store.routerHashs[id]);
			}
		}
	};
</script>
