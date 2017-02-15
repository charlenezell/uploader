import WebUploader from '../../node_modules/webuploader';
import css from './main.scss';
let defaultObj = {
    cancelHandler: function () {
        console.log("cancel");
    },
    closeHandler: function () {
        console.log("close");
    },
    sureHandler: function (data) {
        console.log("sure", data);
    }
}

function MultiImageUploadWidget(option) {
    let {
        uploaderOption
    } = option;

    this.mc = $({});
    this.uploaderOption = uploaderOption;
    let wlist = [
        "sureHandler", "cancelHandler", "closeHandler", "container", , "maxItems"
    ];
    this.maxItems = 3;
    this.fileCount = 0;
    $.each(wlist, (k, v) => {
        if (v !== "uploadOption") {
            this[v] = option[v] || defaultObj[v];
        }
    });
    this.init();
}
$.extend(MultiImageUploadWidget.prototype, {

    init: function () {

        this.insertFrameHtml();
        this.bindEvt();
    },
    itemShowError: function (container, info) {
        $(container).find(".multiImageUploadWidget__itemTips").hide().filter(".multiImageUploadWidget__itemTips--error").show().text(info);
    },
    itemShowInfo: function (container, info) {
        $(container).find(".multiImageUploadWidget__itemTips").hide().filter(".multiImageUploadWidget__itemTips--info").show().text(info);
    },
    itemShowSuccess: function (container, info) {
        $(container).find(".multiImageUploadWidget__itemTips").hide().filter(".multiImageUploadWidget__itemTips--success").show().text(info);
    },
    initUploader: function () {
        this.uploader = WebUploader.create({
            pick: $(".multiImageUploadWidget__uploadCtrl", this.$addBtn),
            fileNumLimit: this.maxItems,
            ...this.uploaderOption
        });
        this.uploader.onFileDequeued = function (file) {
            // removeFile(file);
        };
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
                        this.itemShowSuccess(dom, '上传成功');
                    }
                });
            });
        };

        this.uploader.onUploadProgress = () => {
            // console.log("onUploadProgress");
        }
        this.uploader.onUploadFinished = () => {
            // console.log("onUploadFinished");
        }
        this.uploader.onUploadSuccess = (file, response) => {
            // console.log("onUploadSuccess");
            let dom=this.$listContainer.find(".multiImageUploadWidget__item[data-fileid='"+file.id+"']");
            dom.data("fileurl",response.url);
        }
        this.uploader.onUploadError = () => {
            // console.log("onUploadError");
        }
        this.uploader.onUploadComplete = () => {
            // console.log("onUploadComplete");
        }
        this.uploader.onUploadStart = () => {
            // console.log("onUploadStart");
        }
        this.updateAddBtnState();
    },

    singleFileUploadSuccess: function (...arg) {
        console.log(arg);
    },
    initSingleUploadButtonWidgetList: function () {
        this.$listContainer.find(".multiImageUploadWidget__item--normal").remove();
        this.$addBtn = $(".multiImageUploadWidget__uploadBtn", this.$listContainer);
        this.$addBtnState = $(".multiImageUploadWidget__uploadBtnState", this.$listContainer);
        this.initUploader();
    },
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
            this.$listContainer.prepend(ins);
            ins.data("multiImageUploadWidget_file", file);
            d.resolve(ins);
        },120,120);
        return d;
    },
    judgeAddBtnState: function () {
          if (this.fileCount < this.maxItems) {
            this.$addBtn.removeClass("webuploader-element-invisible")
        } else {
            this.$addBtn.addClass("webuploader-element-invisible")
        }
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
        this.judgeAddBtnState();
    },
    removeItem: function () {},
    addItem: function () {},
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
                    <input class="multiImageUploadWidget__ctrls__upload" type="button" value="上传" />
                    <input class="multiImageUploadWidget__ctrls__sure" type="button" value="确定" /><input type="button" value="取消" class="multiImageUploadWidget__ctrls__cancel"/>
                </div>
            </div>
        `);
        this.$listContainer = $(".multiImageUploadWidget__preview", this.container);
        this.initSingleUploadButtonWidgetList();
    },
    _sureHandler: function () {
        if (this.sureHandler) {
            this.sureHandler($.map(this.$listContainer.find(".multiImageUploadWidget__item").filter((k,v)=>{
                return $(v).data("fileurl")?true:false;
            }),function(v,k){
                return $(v).data("fileurl");
            }));
        }
    },
    bindEvt: function () {
        //componentEvent
        this.mc.on("multiImageUploadWidget_sure", () => {
            this._sureHandler();
        });
        this.mc.on("multiImageUploadWidget_cancel", () => {
            this.cancelHandler();
        });
        this.mc.on("multiImageUploadWidget_close", () => {
            this.closeHandler();
        });
        this.mc.on("multiImageUploadWidget_upload", () => {
            this.uploader.upload();
        });
        this.mc.on("multiImageUploadWidget_removeItem", (e, targetItem) => {
            let file = $(targetItem).data("multiImageUploadWidget_file");
            this.uploader.removeFile(file);
            $(targetItem).remove();
            this.fileCount--;
            this.updateAddBtnState();
        });
        //domEvent
        this.container.on("click", ".multiImageUploadWidget__header__closebtn", () => {
            this.mc.trigger("multiImageUploadWidget_close");
        });
        this.container.on("click", ".multiImageUploadWidget__ctrls__sure", () => {
            this.mc.trigger("multiImageUploadWidget_sure");
        });
        this.container.on("click", ".multiImageUploadWidget__ctrls__cancel", () => {
            this.mc.trigger("multiImageUploadWidget_cancel");
        });
        this.container.on("click", ".multiImageUploadWidget__ctrls__upload", () => {
            this.mc.trigger("multiImageUploadWidget_upload");
        });
        this.container.on("click", ".multiImageUploadWidget__items__closebtn", (e) => {
            this.mc.trigger("multiImageUploadWidget_removeItem", $(e.target).closest(".multiImageUploadWidget__item"));
        })
    }
});
module.exports = MultiImageUploadWidget;