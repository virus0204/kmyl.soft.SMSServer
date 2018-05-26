<template>
    <Card :padding="0">
        <div class="infor-card-con">
            <Col class="infor-card-icon-con" :style="{backgroundColor: color, color: 'white'}" span="8">
                <Row class="height-100" type="flex" align="middle" justify="center">
                    <Icon :type="iconType" size="30"></Icon>
                </Row>
            </Col>
            <Col span="16" class="height-100">
                <Row type="flex" align="middle" justify="center" class="height-100">
                    <div class="infor-card-count user-created-count">
                        <Tooltip placement="bottom">
                            <p :style="{textAlign: 'center', color: color, fontSize: '30px', fontWeight: 700}">
                                <span v-cloak >{{ val }}</span>
                                <span>{{ unit }}</span>
                            </p>
                            <div slot="content">{{ endVal }}</div>
                        </Tooltip>
                        <p class="infor-intro-text">{{ introText }}</p>
                    </div>
                    
                </Row>
            </Col>
        </div>
    </Card>
</template>

<script>
    export default {
        name: 'inforCard',
	    data () {
		    return { unit: '', val: '' };
	    },
        props: {
            endVal: Number, color: String, iconType: String, introText: String, iconSize: {type: Number, default: 40}
        },
	    created () {
		    let val = this.endVal;
		    if (val < 1000) {
			    this.val = val;
		    } else if (val >= 1000 && val < 1000000) {
			    this.val = parseInt(val / 1000);
			    this.unit = 'K+';
		    } else if (val >= 1000000 && val < 10000000000) {
			    this.val = parseInt(val / 1000000);
			    this.unit = 'M+';
		    } else {
			    this.val = parseInt(val / 1000000000);
			    this.unit = 'B+';
		    }
	    }
    };
</script>

<style lang="less">
    .infor-card-icon-con{height: 100%;}
    .infor-card-con{height: 100px;}
    .infor-intro-text{font-size:12px;font-weight:500;color:#C8C8C8;}
</style>

