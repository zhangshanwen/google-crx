import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import {Amplify} from "aws-amplify";
import aws_exports from "./aws-exports";
import merge from "lodash.merge";
import router from "./router";
import VueAwesomeSwiper from 'vue-awesome-swiper'


const env = aws_exports.oauth.domain.split(".")[0].match(/.*-(\w+)/)[1];
const redirect_uri = aws_exports.oauth.redirectSignIn
    .split(",")
    .filter(url => url.includes(window.location.host));
aws_exports.oauth.redirectSignIn = redirect_uri;
let endpoint;
console.log("env++++++++++", env);
switch (env) {
    case "dev":
        endpoint = "https://euzvx2hwig.execute-api.eu-west-1.amazonaws.com/prod/v1";
        break;
    case "us":
        endpoint = "https://2q8fdo3he6.execute-api.us-east-1.amazonaws.com/prod/v1";
        break;
    default:
        break;
}
Amplify.configure(
    merge(aws_exports, {
        env: env,
        API: {
            endpoints: [
                {
                    name: "MeeRestApi",
                    endpoint
                }
            ]
        },
        Storage: {
            AWSS3: {
                bucket:
                    env === "prod"
                        ? "meeseeks-meeseeksbucket-10nvb842ub72r"
                        : "meeseeks-meeseeksbucket-1jxmx02y7423t",
                region: aws_exports.aws_project_region
            }
        }
    })
);
Vue.prototype.$meeConfig = {
    user_name: ""
};
Vue.use(VueAwesomeSwiper)
Vue.use(ElementUI);

new Vue({
    router,
    render: h => h(App)
}).$mount("#app");
