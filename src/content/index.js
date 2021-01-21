import Vue from "vue";
import App from "./components/App.vue";
import insert from "@/utils/insert";
import stroe from "@/mixins/store";


const CmdCheckWord = "check_words";
const CmdGetFullDesc = "get_full_desc";
const CmdGetABTestDetail = "get_ab_test_detail";
const CmdMobileShow = "mobile_show";
const GooglePlatform = "googleplay";

async function MobileShow() {
    console.log("获取手机展示信息");
    const popupSource = $('div[class^="active-app-button"]:first');
    if (popupSource.attr("aria-disabled") === "false") {
        await popupSource.click();
    }
    const packageName = $('div[class^="line"]')
        .eq(2)
        .text();
    const title = $('input[class^="mdc-text-field__input"]').eq(0);
    const short_desc = $('input[class^="mdc-text-field__input"]').eq(1);
    $('img[class^="_ngcontent"]').each(function (i, n) {
        console.log("打印所有", i, $(n).src);
    });
    return {
        package_name: packageName,
        title: title.val(),
        short_desc: short_desc.val()
    };
}

async function beforeGetAppInfo(cmd, data) {
    if (location.host !== "play.google.com") {
        return "错误域名" + location.host;
    }
    const pathNameItem = location.pathname.split("/");
    if (pathNameItem.length === 9) {
        if (pathNameItem[6] === "app" && pathNameItem[8] === "main-store-listing") {
            console.log("当前页面是<<<<主要商品详情>>>>");
            if (cmd === CmdCheckWord) {
                return await GetAppInfo(data);
            } else if (cmd === CmdGetFullDesc) {
                return await GetFullDesc();
            } else if (cmd === CmdMobileShow) {
                return await MobileShow(data);
            } else {
                return "cmd错误" + cmd;
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
    console.log("packageName--------->", packageName);
    const localStr = $('span[class^="button-text"]')
        .eq(0)
        .text();
    console.log("语言--------->", localStr);
    console.log("语言--------->", localStr.split(" "));
    const local = localStr.split(" ")[4];
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
        if (
            pathNameItem[6] === "app" &&
            pathNameItem[8] === "store-listing-experiments" &&
            pathNameItem[10] === "report"
        ) {
            console.log("当前页面是<<<商品详情实验detail页面>>>");
            if (!location.search.match("hl=en")) {
                if (location.search) {
                    location.search += "&hl=en";
                } else {
                    location.search += "?hl=en";
                }
                return "当前页面还不是英文,正在切换，请重新请求";
            }
            const report_id = pathNameItem[9];
            return GetABTestDetail(report_id);
        }
    return "当前页面不是主要商品详情页面";
}

async function GetABTestDetail(report_id) {
    console.log("______加载数据完成_____");
    console.log("查找数据并进行保存");
    let data = {report_id: report_id};
    let tagsDataList = [];
    data["title"] = $("span[class^='simple-html-contents']:first").text();
    const tagElt = $("div[class^='description']:first");
    tagElt.find("span[class^='simple-html-contents']").each(function (i, n) {
        const obj = $(n);
        const text = obj.text();
        console.log(i, text);
        tagsDataList.push(text);
    });
    data["tags"] = tagsDataList;
    data["state"] = tagsDataList[1].toLowerCase();
    data["category"] = tagsDataList[2].split(" ")[0].toLowerCase();
    console.log(tagsDataList);
    const descElt = $("div[debug-id^='result-overview-description']:first").find(
        "p:first"
    );
    console.log(descElt.text());
    let splitTemp;
    splitTemp = descElt.text().split(".");
    console.log(splitTemp[1]);
    console.log(splitTemp[2]);
    console.log(splitTemp[1].split("Started on "));
    console.log(splitTemp[2].split("Stopped on"));
    let startTimeStr = splitTemp[1].split("Started on ")[1];
    let endTimeStr = splitTemp[2].split("Stopped on")[1];
    data["start_time"] = Date.parse(startTimeStr);
    data["end_time"] = Date.parse(endTimeStr);
    console.log(startTimeStr);
    console.log(new Date(Date.parse(startTimeStr)));
    console.log(endTimeStr);
    console.log(new Date(Date.parse(endTimeStr)));

    //点击展开按钮
    await $("div[class^='particle-table-row']").each(async function (i, n) {
        const obj = $(n);
        const showTag = obj.find(
            "i[class^='material-icon-i material-icons-extended']:first"
        );
        console.log(
            showTag.attr("aria-hidden"),
            typeof showTag.attr("aria-hidden")
        );
        if (showTag.attr("aria-hidden") === "true") {
            await showTag.click();
        }
    });
    let variantInfoList = [];
    //展开之后查询数据
    $("div[class='particle-table-row']").each(function (i, n) {
        let variantInfo = {};
        const variant = $(n)
            .find("text-field:first")
            .text();
        variantInfo["variant"] = variant;
        console.log("变体=>>>>>", i, variant);
        $(n)
            .find("span[class^='main-text']")
            .each(function (x, y) {
                if (x === 1) {
                    variantInfo["audience"] = parseFloat($(y).text()) / 100;
                } else if (x === 2) {
                    variantInfo["installers_current"] = parseFloat($(y).text());
                } else if (x === 3) {
                    variantInfo["installers_scaled"] = parseFloat($(y).text());
                }
                console.log("文本=>>>>>", x, $(y).text());
            });
        const lower_endpoint = $(n)
            .find("div[class^='lower-endpoint-label']:first")
            .text();
        const upper_endpoint = $(n)
            .find("div[class^='upper-endpoint-label']:first")
            .text();
        const imgName = $(n)
            .next()
            .find("div[class^='_ngcontent']");
        const imgType = imgName
            .parent()
            .parent()
            .parent();
        let imgList = [];
        $(n)
            .next()
            .find("img")
            .each(function (i, n) {
                imgList.push($(n).attr("src"));
            });
        let img_type = imgType.attr("debug-id");
        if (img_type === "icon-field") {
            img_type = "icon";
        } else if (img_type === "feature-graphic-field") {
            img_type = "feature_graphic";
        } else if (img_type === "phone-screenshots-field") {
            img_type = "screenshots";
        } else if (img_type === "short-description-field") {
            img_type = "short_description";
        } else if (img_type === "full-description-field") {
            img_type = "full_description";
        } else if (img_type === "title-field") {
            img_type = "title";
        } else if (img_type === "video-field") {
            img_type = "video";
        }

        console.log(lower_endpoint, upper_endpoint);
        variantInfo["item_name"] = imgName.text();
        variantInfo["item_type"] = img_type;
        variantInfo["item_value"] = imgList;
        variantInfo["lower_endpoint"] =
            parseFloat(lower_endpoint ? lower_endpoint : 0) / 100;
        variantInfo["upper_endpoint"] =
            parseFloat(upper_endpoint ? upper_endpoint : 0) / 100;
        variantInfoList.push(variantInfo);
    });
    data["variant_info"] = variantInfoList;
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
    console.log("packageName--------->", packageName);
    data["package_name"] = packageName;
    data["platform"] = GooglePlatform;
    return data;
}

chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
) {
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
        let data = request.data;
        result = await beforeGetAppInfo(request.cmd, data.field);
    } else if (request.cmd === CmdGetFullDesc) {
        result = await beforeGetAppInfo(request.cmd);
    } else if (request.cmd === CmdMobileShow) {
        result = await beforeGetAppInfo(request.cmd, request.data.language);
    } else if (request.cmd === CmdGetABTestDetail) {
        result = await beforeGetABTestDetail();
    } else {
        result = "错误cmd  " + request.cmd;
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


console.log("注入监听成功");

Vue.mixin(stroe);

// 插入组件到页面中
insert(App);
