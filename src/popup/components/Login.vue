<template>
  <div class="login-id">
    <el-form :model="param" :rules="rules" ref="login" label-width="0px">
      <el-form-item prop="username">
        <el-input v-model="param.username" placeholder="username">
          <el-button slot="prepend" icon="el-icon-user"></el-button>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          placeholder="password"
          v-model="param.password"
          @keyup.enter.native="submitForm()"
        >
          <el-button slot="prepend" icon="el-icon-unlock"></el-button>
        </el-input>
      </el-form-item>
      <el-button
        class="login-btn"
        type="primary"
        :loading="authState === 'login'"
        @click="submitForm()"
        >登录
      </el-button>
    </el-form>
  </div>
</template>
<script>
import { Auth } from "aws-amplify";

export default {
  name: "Login",
  user: undefined,
  data: function() {
    return {
      param: {
        username: "",
        password: ""
      },
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      authState: "",
      signData: undefined,
      submit_new_password: false
    };
  },
  methods: {
    submitForm() {
      console.log("开始登录");
      this.$refs.login.validate(valid => {
        if (valid) {
          this.authState = "login";
          Auth.signIn(this.param.username.trim(), this.param.password.trim())
            .then(sign => {
              this.param.username = "";
              this.param.password = "";
              console.log(sign);
              console.log("登录成功");
              this.$router.push({ path: "/" });
            })
            .catch(err => {
              alert(err.message);
              console.log(err.message);
              this.authState = "";
            });
        } else {
          alert("请输入账号和密码");
          console.log("请输入账号和密码");
          return false;
        }
      });
    }
  }
};
</script>

<style>
.login-id {
  height: 200px;
  width: 200px;
}
</style>
