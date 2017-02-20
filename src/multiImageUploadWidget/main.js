import WebUploader from '../../node_modules/webuploader/dist/webuploader';
import wuCss from '../../node_modules/webuploader/dist/webuploader.css';
import css from './main.scss';
import swf from '../../node_modules/webuploader/dist/Uploader.swf';
import extend from '../../node_modules/extend';
import emiter from  '../../node_modules/wolfy87-eventemitter';

// 除了基本的$selector之外还依赖了$的个方法map,each,trim,Deferred;
let defaultObj = {
    closeHandler: function () {
        console.log("close");
    },
    sureHandler: function (data) {
        console.log("sure", data);
    },
    maxItems: 3,
    fileCount: 0,
    onUploadSuccess: function (response) {
        //输入是一个后端返回给用户自定义响应的图片url位置和如何给ui去响应两个状态成功返回0，否则返回负值
        // 实现一个接口成功返回url否则返回空串
        if (response.state !== 'SUCCESS') {
            return {
                code: -1,
                detail: response.state,
                url: ''
            };
        } else {
            return {
                code: 0,
                detail: "上传成功",
                url: response.allUrls.NORMAL
            };
        }
    }
};

function MultiImageUploadWidget(option) {
    let {
        uploaderOption
    } = option;

    this.mc = $({});

    this.uploaderOption = uploaderOption;

    // 扩展默认值
    extend(this, defaultObj);

    // 供用户扩展的属性
    let wlist = [
        "sureHandler", "closeHandler", "container", "maxItems", 'onUploadSuccess'
    ];

    // 扩展用户定义值
    $.each(wlist, (k, v) => {
        if (v !== "uploadOption") {
            this[v] = option[v]
        }
    });
    this.init();
}
MultiImageUploadWidget.prototype=new emiter;
extend(MultiImageUploadWidget.prototype, {
    init: function () {
        this.insertFrameHtml();
        this.bindEvt();
    },
    // ui 提示方法
    itemShowError: function (container, info) {
        $(container).find(".multiImageUploadWidget__itemTips").hide().filter(".multiImageUploadWidget__itemTips--error").show().text(info);
    },
    itemShowInfo: function (container, info) {
        $(container).find(".multiImageUploadWidget__itemTips").hide().filter(".multiImageUploadWidget__itemTips--info").show().text(info);
    },
    itemShowSuccess: function (container, info) {
        $(container).find(".multiImageUploadWidget__itemTips").hide().filter(".multiImageUploadWidget__itemTips--success").show().text(info);
    },
    // ui 提示方法
    initUploader: function () {
        // 绑定webuploader API
        this.uploader = WebUploader.create({
            pick: $(".multiImageUploadWidget__uploadCtrl", this.$addBtn),
            fileNumLimit: this.maxItems,
            duplicate: true,
            ...this.uploaderOption
        });

        this.uploader.onFileQueued = (file) => {
            this.fileCount++;
            this.updateAddBtnState();
            this.addFile(file).then((dom) => {
                file.on('statuschange', (cur, prev) => {
                    if (cur === 'error' || cur === 'invalid') {
                        this.itemShowError(dom, file.statusText);
                    } else if (cur === 'interrupt') {
                        this.itemShowError(dom, 'interrupt');
                    } else if (cur === 'queued') {
                        this.itemShowInfo(dom, '等待上传');
                    } else if (cur === 'progress') {
                        this.itemShowInfo(dom, '上传中');
                    } else if (cur === 'complete') {

                    }
                });
            });
        };

        this.uploader.onUploadSuccess = (file, response) => {
            let {
                code,
                detail,
                url
            } = this.onUploadSuccess(response);
            let dom = this.$listContainer.find(".multiImageUploadWidget__item[data-fileid='" + file.id + "']");
            if (code == 0) {
                this.itemShowSuccess(dom, detail);
            } else {
                this.itemShowError(dom, detail);
            }
            if ($.trim(url)) {
                dom.data("fileurl", url);
            } else {
                dom.data("fileurl", '');
            }


        }
        this.uploader.onUploadError = (file, reason) => {
            // console.log("onUploadError");
            let dom = this.$listContainer.find(".multiImageUploadWidget__item[data-fileid='" + file.id + "']");
            this.itemShowError(dom, reason);
        }

        this.updateAddBtnState();
    },
    initSingleUploadButtonWidgetList: function () {
        this.$listContainer.find(".multiImageUploadWidget__item--normal").remove();
        this.$addBtn = $(".multiImageUploadWidget__uploadBtn", this.$listContainer);
        this.$addBtnState = $(".multiImageUploadWidget__uploadBtnState", this.$listContainer);
        this.initUploader();
    },
    // 用户删除ui时候响应
    removeItem: function (targetItem) {
        let file = $(targetItem).data("multiImageUploadWidget_file");
        this.uploader.removeFile(file);
        $(targetItem).remove();
        this.fileCount--;
        this.updateAddBtnState();
    },
    // enqueue 的时候生成预览的ui
    addFile: function (file) {
        let d = $.Deferred();
        this.uploader.makeThumb(file, (err, ret) => {
            let ins;
            if (!err) {
                ins = $(`
                 <span class="multiImageUploadWidget__item multiImageUploadWidget__item--normal" data-fileid="${file.id}">
                    <img src="${ret}" id="" />
                    <span class="multiImageUploadWidget__items__closebtn">×</span>
                    <span class="multiImageUploadWidget__itemTips multiImageUploadWidget__itemTips--error"></span>
                    <span class="multiImageUploadWidget__itemTips  multiImageUploadWidget__itemTips--success"></span>
                    <span class="multiImageUploadWidget__itemTips multiImageUploadWidget__itemTips--info">等待上传</span>
                </span>
                `);
            } else {
                ins = $(`
                 <span class="multiImageUploadWidget__item multiImageUploadWidget__item--normal" data-fileid="${file.id}">
                    <img src="" id="" alt="不能预览" />
                    <span class="multiImageUploadWidget__items__closebtn">×</span>
                    <span class="multiImageUploadWidget__itemTips multiImageUploadWidget__itemTips--error"></span>
                    <span class="multiImageUploadWidget__itemTips  multiImageUploadWidget__itemTips--success"></span>
                    <span class="multiImageUploadWidget__itemTips multiImageUploadWidget__itemTips--info">等待上传</span>
                </span>
                `);
            }
            this.$listContainer.find(".multiImageUploadWidget__uploadBtn").before(ins);
            ins.data("multiImageUploadWidget_file", file);
            d.resolve(ins);
        }, 120, 120);
        return d;
    },
    getAddBtn: function () {
        return `<div class="multiImageUploadWidget__item multiImageUploadWidget__uploadBtn">
        <div class="multiImageUploadWidget__uploadCtrl"></div>
        <div class="multiImageUploadWidget__uploadCtrl__info">添加图片<br/>
        <span class="multiImageUploadWidget__uploadBtnState"></span></div>
        </div>`;
    },
    updateAddBtnState: function () {
        this.$addBtnState.html(`还可以上传<span class="multiImageUploadWidget__uploadBtnState__n">${this.maxItems-this.fileCount}</span>个`);
        if (this.fileCount < this.maxItems) {
            this.$addBtn.removeClass("webuploader-element-invisible")
        } else {
            this.$addBtn.addClass("webuploader-element-invisible")
        }
    },
    // 注入静态的html框架
    insertFrameHtml: function () {
        this.container.html(`
            <div class="multiImageUploadWidget">
                <div class="multiImageUploadWidget__header">
                    插入图片 <span class="multiImageUploadWidget__header__closebtn">×</span>
                </div>
                <div class="multiImageUploadWidget__preview">
                    ${this.getAddBtn()}
                </div>
                <div class="multiImageUploadWidget__ctrls">
                    <input class="multiImageUploadWidget__ctrls__btn multiImageUploadWidget__ctrls__upload" type="button" value="上传" />
                    <input class="multiImageUploadWidget__ctrls__btn multiImageUploadWidget__ctrls__sure" type="button" value="确定" />
                </div>
            </div>
        `);
        this.$listContainer = $(".multiImageUploadWidget__preview", this.container);
        this.initSingleUploadButtonWidgetList();
    },
    bindEvt: function () {
        //componentEvent
        this.on("multiImageUploadWidget_sure", () => {
            if (this.sureHandler) {
                this.sureHandler($.map(this.$listContainer.find(".multiImageUploadWidget__item").filter((k, v) => {
                    return $(v).data("fileurl") !== '' ? true : false;
                }), function (v, k) {
                    return $(v).data("fileurl");
                }));
            }
        });
        this.on("multiImageUploadWidget_close", () => {
            this.closeHandler();
        });
        this.on("multiImageUploadWidget_upload", () => {
            this.uploader.upload();
        });
        this.on("multiImageUploadWidget_removeItem", (e, targetItem) => {
            this.removeItem(targetItem);
        });
        //domEvent
        this.container.on("click", ".multiImageUploadWidget__header__closebtn", () => {
            this.trigger("multiImageUploadWidget_close");
        });
        this.container.on("click", ".multiImageUploadWidget__ctrls__sure", () => {
            this.trigger("multiImageUploadWidget_sure");
        });
        this.container.on("click", ".multiImageUploadWidget__ctrls__upload", () => {
            this.trigger("multiImageUploadWidget_upload");
        });
        this.container.on("click", ".multiImageUploadWidget__items__closebtn", (e) => {
            this.trigger("multiImageUploadWidget_removeItem", $(e.target).closest(".multiImageUploadWidget__item"));
        })
    }
});
module.exports = MultiImageUploadWidget;