<template>
    <div class="container">
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
      <span class="el-dropdown-link">
        {{ username }}
        <i class="el-icon-caret-bottom"></i>
      </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="loginout">登出</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <el-tabs type="border-card" v-model="activeName">
            <el-tab-pane label="语句检测" name="wordsCheck">
                <el-form>
                    <el-select v-model="filedValue">
                        <el-option
                                v-for="item in filedOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                        >
                        </el-option>
                    </el-select>
                    <el-select v-model="typeValue">
                        <el-option
                                v-for="item in typeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                        >
                        </el-option>
                    </el-select>
                    <el-button type="primary" icon="el-icon-search" @click="checkWords()"
                    >检查数据
                    </el-button>
                    <h2>{{ package_name }}</h2>
                    <el-table
                            v-show="typeValue === 'key_word' && filedValue !== 'full_desc'"
                            :data="keywordTableData"
                            stripe
                            border
                            max-height="350"
                    >
                        <el-table-column prop="word" label="关键字"></el-table-column>
                        <el-table-column prop="frequency" label="词频"></el-table-column>
                        <el-table-column prop="density" label="密度"></el-table-column>
                    </el-table>
                    <el-table
                            v-show="typeValue === 'key_word' && filedValue === 'full_desc'"
                            :data="similarityTableData"
                            stripe
                            border
                            max-height="350"
                    >
                        <el-table-column prop="source" label="原句子"></el-table-column>
                        <el-table-column prop="target" label="目标句子"></el-table-column>
                        <el-table-column prop="similarity" label="相识度">
                        </el-table-column>
                    </el-table>
                    <el-table
                            v-show="typeValue === 'violate_word'"
                            :data="violateWordTableData"
                            stripe
                            border
                            height="100%"
                            max-height="350"
                    >
                        <el-table-column prop="word" label="违规词或句子">
                        </el-table-column>
                        <el-table-column prop="frequency" label="位置"></el-table-column>
                    </el-table>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="完整说明预览" name="preview">
                <el-form>
                    <el-form-item prop="full_description">
                        <el-button

                                type="primary"
                                :loading="form.loading"
                                @click="loadDesc()"
                        >预览
                        </el-button>
                        <p v-html="form.rawHtml"></p>
                    </el-form-item>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="移动端预览" name="previewMobile">
                <el-form>
                    <el-form-item prop="full_description">
                        <el-button

                                type="primary"
                                @click="loadMobileShow()"
                        >预览
                        </el-button>
                    </el-form-item>
                    <div v-if=mobileForm.show class="mobile">
                        <div id="product" class="product">
                            <div class="app-icon">
                                <img class="app-icon-img" id="logo-image-real" style="height:100%;width: 100%"
                                     :src="mobileForm.icon">
                            </div>
                            <div class="app-title">
                                <h1>{{mobileForm.title}}</h1>
                                <h3> Net meter
                                </h3>
                            </div>
                        </div>
                        <div class="section">
                            <div class="rate-entry">
                                <h3 class="value-label fff">4.8</h3> <i class="star label-icon black-star"></i>
                                <h3 class="label">222K reviews</h3>
                            </div>
                            <div class="downloads">
                                <h3 class="value-label">10M+</h3>
                                <h3 class="label">Downloads</h3>
                            </div>
                        </div>
                        <div class="installClass"><h4>Install</h4></div>
                        <swiper class="slideGallery" v-swiper:mySwiper="swiperOption">
                            <swiper-slide v-if="mobileForm.video!==''">
                                <el-image class="videoCut"
                                          :src="mobileForm.videoCut"></el-image>
                            </swiper-slide>
                            <swiper-slide
                                    v-for="image in mobileForm.bannerList">
                                <el-image class="mobileCut" :src="image"></el-image>
                            </swiper-slide>
                        </swiper>
                        <div id="description" class="container_section">
                            <h2 class="section-title">
                                About this app
                            </h2>
                            <div class="shortDescription">
                                {{mobileForm.shortDesc}}
                            </div>
                            <div>
                            </div>
                        </div>
                    </div>

                </el-form>
            </el-tab-pane>
            <el-tab-pane label="商品详情实验" name="ABTestInfo">
                <el-button type="primary" icon="el-icon-download" @click="loadAbTest()"
                >获取数据
                </el-button>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import {API, Auth} from "aws-amplify";
    import service from "../utils/api";
    import 'swiper/swiper-bundle.css'

    const CmdCheckWord = "check_words";
    const CmdGetFullDesc = "get_full_desc";
    const CmdGetABTestDetail = "get_ab_test_detail";
    const CmdMobileShow = "mobile_show";
    export default {
        name: "Home",
        data() {
            return {
                swiperOption: {
                    slidesPerView: 'auto',
                    spaceBetween: 30,
                    grabCursor: true,
                    setWrapperSize: true,
                    pagination: {
                        el: '.swiper-pagination',
                        clickable: true
                    }
                },
                activeName: "wordsCheck",
                filedOptions: [
                    {
                        value: "app_name",
                        label: "应用名称"
                    },
                    {
                        value: "short_desc",
                        label: "简短说明"
                    },
                    {
                        value: "full_desc",
                        label: "完整说明"
                    }
                ],
                filedValue: "app_name",
                typeOptions: [
                    {
                        value: "key_word",
                        label: "关键词检测"
                    },
                    {
                        value: "violate_word",
                        label: "违规词检测"
                    }
                ],
                typeValue: "key_word",
                package_name: "",
                form: {
                    loading: false,
                    rawHtml: ""
                },
                mobileForm: {
                    show: false,
                    icon: "",
                    title: "",
                    shortDesc: "",
                    video: "",
                    videoCut: "https://play-lh.googleusercontent.com/TogDHYop4cjomtZe-qxk7TLqnb_tigjpnUTPbDDoCgZUD9P2DG8DqLW7kiLCXvK3nNg=h2133",
                    bannerList: [
                        "https://play-lh.googleusercontent.com/ngsvh3IymnlzP7CjOCuTUvUmXdmmDjfgAPOVY6eKDIeqF-5QAsD-pTeNi32IdBmCuAo=h2133",
                        "https://play-lh.googleusercontent.com/V5fZRBZqXtiRHWDTDyYiLGBImP31TLMmJtlhe1im1qbuxsus2IKEj-SAi3LgWsfIW7c=h2133",
                        "https://play-lh.googleusercontent.com/V5fZRBZqXtiRHWDTDyYiLGBImP31TLMmJtlhe1im1qbuxsus2IKEj-SAi3LgWsfIW7c=h2133",
                        "https://play-lh.googleusercontent.com/V5fZRBZqXtiRHWDTDyYiLGBImP31TLMmJtlhe1im1qbuxsus2IKEj-SAi3LgWsfIW7c=h2133",
                    ]
                },
                keywordTableData: [],
                similarityTableData: [],
                violateWordTableData: []
            };
        },
        methods: {
            handleCommand(command) {
                if (command === "loginout") {
                    // localStorage.removeItem('ms_username');
                    this.user = undefined;
                    this.$router.push({path: "/login"});
                    Auth.signOut();
                }
            },
            async checkWords() {
                console.log("开始检测单词");
                this.sendWindowMsg(
                    CmdCheckWord,
                    {
                        field: this.filedValue,
                        type: this.typeValue
                    },
                    async response => {
                        console.log("callback===>>>>>>", response);
                        const code = response.code;
                        if (code === 1) {
                            console.log("提示错误");
                            alert(response.msg);
                        } else {
                            const package_name = response.data.package_name;
                            const content = response.data.content;
                            console.log("package_name=====", package_name);
                            console.log("content=====", content);
                            console.log("typeValue=====", this.typeValue);
                            if (!package_name) {
                                alert("没有获取到package_name");
                                return;
                            }

                            this.package_name = package_name;

                            if (this.typeValue === "key_word") {
                                if (this.filedValue === "full_desc") {
                                    const local = response.data.local;
                                    if (!local) {
                                        alert("没有获取到语言");
                                        return;
                                    }
                                    this.similarityTableData = await API.post(
                                        service.API_NAME,
                                        service.KEYWORD_SIMILARITY(package_name, local),
                                        await service.request({
                                            content: content
                                        })
                                    );
                                } else {
                                    this.keywordTableData = await API.post(
                                        service.API_NAME,
                                        service.KEYWORD_STATS(package_name, this.typeValue),
                                        await service.request({
                                            content: content
                                        })
                                    );
                                }
                            } else {
                                this.violateWordTableData = await API.post(
                                    service.API_NAME,
                                    service.KEYWORD_CHECK(package_name, this.typeValue),
                                    await service.request({
                                        content: content
                                    })
                                );
                            }
                        }
                    }
                );
            },
            async loadDesc() {
                this.form.loading = true;
                this.sendWindowMsg(CmdGetFullDesc, {}, async response => {
                    console.log("callback===>>>>>>", response);
                    const code = response.code;
                    if (code === 1) {
                        console.log("提示错误");
                        this.form.loading = false;
                        alert(response.msg);
                    } else {
                        const content = response.data.content;
                        this.form.rawHtml = content.replace(/\n/g, "<br/>");
                        this.form.loading = false;
                    }
                });
            },
            async loadAbTest() {
                this.sendWindowMsg(CmdGetABTestDetail, {}, async response => {
                    console.log("callback===>>>>>>", response);
                    const code = response.code;
                    if (code === 1) {
                        console.log("提示错误");
                        alert(response.msg);
                    } else {
                        try {
                            const data = response.data
                            const result = await API.put(
                                service.API_NAME,
                                service.APP_ABTEST(data.platform, data.package_name),
                                await service.request(data)
                            );
                            console.log(result)
                            alert("提交成功")
                        } catch (e) {
                            alert("提交失败")
                        }
                    }
                });
            },
            async loadMobileShow() {
                this.sendWindowMsg(CmdMobileShow, {}, async response => {
                    console.log("callback===>>>>>>", response);
                    const code = response.code;
                    if (code === 1) {
                        console.log("提示错误");
                        alert(response.msg);
                    } else {
                        this.mobileForm = response.data
                        this.mobileForm["show"] = true
                    }
                });

            },

            sendWindowMsg(cmd, data, callback) {
                chrome.tabs.getSelected(null, function (tab) {
                    chrome.tabs.sendMessage(
                        tab.id,
                        {
                            cmd: cmd,
                            data: data
                        },
                        function (response) {
                            if (callback) callback(response);
                        }
                    );
                });
            }
        },
        computed: {
            username() {
                return this.$meeConfig.user_name;
            }
        }
    };
</script>

<style>

    .container {
        width: 700px;
        height: 500px;
    }

    .mobile {
        width: 276px;
        height: 600px;
        border-style: solid;
        border-width: 5px;
    }

    .product {
        width: 100%;
        height: 100px;
    }

    .app-icon {
        margin: 10px 3px 3px 10px;
        width: 21%;
        float: left;
    }

    .app-title {
        width: 70%;
        float: right;
    }

    .app-title h1 {
        font-family: 'GP Font', serif;
        font-size: 16px;
        word-break: break-word;
        color: black;
    }

    .app-title h3 {
        color: green;
        font-size: 12px;
        word-break: break-word;
    }

    .rate-entry {
        flex: auto;
        width: 35%;
        font-size: 10px;
        padding-left: 22px;
    }

    .downloads {
        flex: auto;
        width: 35%;
        font-size: 10px;
    }

    .section {
        display: flex;
        width: 100%;
    }

    .label {
        font-size: 7px;
        color: #707070;
    }

    .installClass {
        height: 20px;
        text-align: center;
        background-color: green;
        width: 90%;
        margin: 0 auto;

    }

    .slideGallery {
        padding-top: 10px;
        padding-bottom: 10px;
        height: 150px;
        width: 90%;
        margin: 0 auto;
    }

    .videoCut {
        width: 100%;
        height: 100%;
    }

    .mobileCut {
        width: 100%;
        height: 100%;
    }

    .swiper-slide {
        width: 70px !important;
    }

    .swiper-slide:first-child {
        width: 210px !important;
    }

    .section-title {
        padding: 0;
        margin: 0;
        font-family: 'GP Font';
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.1px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: black;
    }

    .shortDescription {
        padding: 0;
        margin-top: 12px;
        margin-bottom: 15px;
        font-size: 12px;
        text-align: left;
        line-height: 1.5;
    }

    .container_section {
        width: 90%;
        margin: 0 auto;

    }
</style>



