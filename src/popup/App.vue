<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script>
import { Auth } from "aws-amplify";

export default {
  name: "app",
  beforeCreate() {},
  async created() {
    console.log("监听事件");
    this.user = await getUser();
    if (this.user) {
      this.$meeConfig.user_name = this.user.attributes.name
        ? this.user.attributes.name
        : this.user.attributes.email;
      console.log("读取到了user跳转到home");
      await this.$router.push({ path: "/home" });
    } else {
      console.log("读取到了user跳转到login");
      await this.$router.push({ path: "/login" });
    }
  },
  data: function() {
    return {
      user: undefined
    };
  },
  methods: {}
};

function getUser() {
  return Auth.currentAuthenticatedUser()
    .then(userData => userData)
    .catch(() => console.log("Not signed in"));
}
</script>
<style></style>
