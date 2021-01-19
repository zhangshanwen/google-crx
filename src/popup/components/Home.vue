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
            <el-table-column prop="word" label="关键字"> </el-table-column>
            <el-table-column prop="frequency" label="词频"> </el-table-column>
            <el-table-column prop="density" label="密度"> </el-table-column>
          </el-table>
          <el-table
            v-show="typeValue === 'key_word' && filedValue === 'full_desc'"
            :data="similarityTableData"
            stripe
            border
            max-height="350"
          >
            <el-table-column prop="source" label="原句子"> </el-table-column>
            <el-table-column prop="target" label="目标句子"> </el-table-column>
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
            <el-table-column prop="frequency" label="位置"> </el-table-column>
          </el-table>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="完整说明预览" name="fullDescPreview">
        <el-form>
          <el-form-item prop="full_description">
            <el-button
              type="primary"
              :loading="form.loading"
              @click="loadDesc()"
              >预览</el-button
            >
            <p v-html="form.rawHtml"></p>
          </el-form-item>
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
import { API, Auth } from "aws-amplify";
import service from "../utils/api";

const CmdCheckWord = "check_words";
const CmdGetFullDesc = "get_full_desc";
const CmdGetABTestDetail = "get_ab_test_detail";
export default {
  name: "Home",
  data() {
    return {
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
        this.$router.push({ path: "/login" });
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
        }
      });
    },

    onPreview() {
      if (this.form.preview) {
        this.form.rawHtml = this.form.full_description.replace(/\n/g, "<br/>");
      } else {
        this.form.rawHtml = "";
      }
    },
    sendWindowMsg(cmd, data, callback) {
      chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            cmd: cmd,
            data: data
          },
          function(response) {
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

<style scoped>
.container {
  width: 700px;
  height: 500px;
}
</style>
