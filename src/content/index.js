import Vue from "vue";
import App from "./components/App.vue";
import insert from "@/utils/insert";
import stroe from "@/mixins/store";

const CmdCheckWord = "check_words"
const CmdGetFullDesc = "get_full_desc"
const CmdGetABTestDetail = "get_ab_test_detail"


async function beforeGetAppInfo(cmd, checkField) {
    if (location.host !== "play.google.com") {
        return "错误域名" + location.host;
    }
    const pathNameItem = location.pathname.split("/");
    if (pathNameItem.length === 9) {
        if (pathNameItem[6] === "app" && pathNameItem[8] === "main-store-listing") {
            console.log("当前页面是<<<<主要商品详情>>>>");
            if (cmd === CmdCheckWord) {
                return await GetAppInfo(checkField);
            } else if (cmd === CmdGetFullDesc) {
                return await GetFullDesc()
            } else {
                return "cmd错误" + cmd
            }
        }
    }
    return "当前页面不是主要商品详情页面";
}

async function GetFullDesc() {
    let text;
    text = $('textarea[class^="mdc-text-field__input"]:first');
    console.log("name=>>>>", text.attr("aria-label"));
    console.log("value=>>>>", text.val());
    return {content: text.val()};
}

async function GetAppInfo(checkField) {
    console.log("获取应用信息");
    const popupSource = $('div[class^="active-app-button"]:first');
    if (popupSource.attr("aria-disabled") === "false") {
        await popupSource.click();
    }
    const packageName = $('div[class^="line"]')
        .eq(2)
        .text();
    console.log("packageName--------->", packageName)
    const localStr = $('span[class^="button-text"]').eq(0).text();
    console.log("语言--------->", localStr)
    console.log("语言--------->", localStr.split(" "))
    const local = localStr.split(" ")[4]
    let text;
    if (checkField === "app_name") {
        text = $('input[class^="mdc-text-field__input"]').eq(0);
        console.log("name=>>>>", text.attr("aria-label"));
        console.log("value=>>>>", text.val());
    } else if (checkField === "short_desc") {
        text = $('input[class^="mdc-text-field__input"]').eq(1);
        console.log("name=>>>>", text.attr("aria-label"));
        console.log("value=>>>>", text.val());
    } else {
        text = $('textarea[class^="mdc-text-field__input"]:first');
        console.log("name=>>>>", text.attr("aria-label"));
        console.log("value=>>>>", text.val());
    }
    return {package_name: packageName, content: text.val(), local: local};
}


async function beforeGetABTestDetail() {
    if (location.host !== "play.google.com") {
        return "错误域名" + location.host;
    }
    const pathNameItem = location.pathname.split("/");
    if (pathNameItem.length === 11)
        if (pathNameItem[6] === "app" && pathNameItem[8] === "store-listing-experiments" && pathNameItem[10] === "report") {
            console.log("当前页面是<<<商品详情实验detail页面>>>")
            const report_id = pathNameItem[9]
            return GetABTestDetail(report_id)
        }
    return "当前页面不是主要商品详情页面";

}

async function GetABTestDetail(report_id) {
    console.log("______加载数据完成_____")
    console.log("查找数据并进行保存")
    let data = {"report_id": report_id}
    let tagsDataList = [];
    data["title"] = $("span[class^='simple-html-contents']:first").text()
    const tagElt = $("div[class^='description']:first");
    tagElt.find("span[class^='simple-html-contents']").each(
        function (i, n) {
            const obj = $(n);
            const text = obj.text()
            console.log(i, text);
            tagsDataList.push(text)
        }
    )
    data["tags"] = tagsDataList
    console.log(tagsDataList)
    const descElt = ($("div[debug-id^='result-overview-description']:first")).find("p:first");
    //TODO 匹配英文
    if (descElt.text().match(/[\u4e00-\u9fa5]+/g).length > 0) {
        //匹配中文，解析中文数据
        let splitTemp;
        splitTemp = descElt.text().split("。")
        console.log(splitTemp[1])
        console.log(splitTemp[2])
        let startTimeStr = splitTemp[1].split("：")[1]
        let endTimeStr = splitTemp[2].split("：")[1]
        data["start_time"] = startTimeStr
        data["end_time"] = endTimeStr
        console.log(startTimeStr)
        console.log(endTimeStr)
    }
    //点击展开按钮
    await $("div[class^='particle-table-row']").each(
        async function (i, n) {
            const obj = $(n);
            const showTag = obj.find("i[class^='material-icon-i material-icons-extended']:first")
            console.log(showTag.attr("aria-hidden"), typeof (showTag.attr("aria-hidden")))
            if (showTag.attr("aria-hidden") === "true") {
                await showTag.click()
            }
        }
    )
    let variantInfoList = []
    //展开之后查询数据
    $("div[class='particle-table-row']").each(
        function (i, n) {
            let variantInfo = {}
            const variant = $(n).find('text-field:first').text()
            variantInfo["variant"] = variant
            console.log("变体=>>>>>", i, variant)
            $(n).find("span[class^='main-text']").each(
                function (x, y) {
                    if (x === 1) {
                        variantInfo["audience"] = $(y).text()
                    } else if (x === 2) {
                        variantInfo["installers_current"] = $(y).text()
                    } else if (x === 3) {
                        variantInfo["installers_scaled"] = $(y).text()
                    }
                    console.log("文本=>>>>>", x, $(y).text())
                }
            )
            const lower_endpoint = $(n).find("div[class^='lower-endpoint-label']:first").text()
            const upper_endpoint = $(n).find("div[class^='upper-endpoint-label']:first").text()
            console.log(lower_endpoint, upper_endpoint)
            variantInfo["lower_endpoint"] = lower_endpoint
            variantInfo["upper_endpoint"] = upper_endpoint
            variantInfoList.push(variantInfo)
        }
    )
    data["variant_info"] = variantInfoList
    const popupSource = $('div[class^="active-app-button"]:first');
    if (popupSource.attr("aria-disabled") === "false") {
        await popupSource.click();
    }
    // $('div[class^="line"]').each(
    //     function (x, y) {
    //         console.log("packageName--------->", x,$(y).text())
    //     })
    const packageName = $('div[class^="line"]')
        .eq(10)
        .text();
    console.log("packageName--------->",packageName)
    data["package_name"] = packageName
    return data
}


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    console.log(
        "收到来自 " +
        (sender.tab
            ? "content-script(" + sender.tab.url + ")"
            : "popup或者background") +
        " 的消息：",
        request
    );
    console.log("cmd====", request.cmd);
    let result;
    if (request.cmd === CmdCheckWord) {
        console.log("开始获取单词");
        let data = request.data;
        console.log("data===>>>>>", data);
        result = await beforeGetAppInfo(request.cmd, data.field);
    } else if (request.cmd === CmdGetFullDesc) {
        result = await beforeGetAppInfo(request.cmd);
    } else if (request.cmd === CmdGetABTestDetail) {
        result = await beforeGetABTestDetail();
    } else {
        result = "错误cmd" + request.cmd
    }
    let response;
    if (typeof result === "string") {
        response = {
            code: 1,
            msg: result,
            data: {}
        };
    } else {
        response = {
            code: 0,
            msg: "ok",
            data: result
        };
    }
    console.log(response);
    sendResponse(response);
});
console.log("注入监听1成功");

// 注入js到页面

Vue.mixin(stroe);

// 插入组件到页面中
insert(App);
