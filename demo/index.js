$("#multiimgwidget").multiImageUploadWidget({
    closeHandler:function(){
        console.log("closeOverride");
    },
    sureHandler:function(currentData){
        console.log("sureOverride");
        console.log(currentData);
        $("body").append(currentData.map(function(v){
            return `<img src="${v}"/>`
        }))
    },
    cancelHandler:function(){
        console.log("cancelOverride");
    },
    maxItems:10,
    uploaderOption: {
        swf: "../node_modules/webuploader/dist/Uploader.swf", //默认根据document域名判断除非这里写死一个url
        //与webuploader参数一致
        server: "http://qq.100bt.com/uploadImage.action",
        fileVal: "picdata",
        withCredentials:true,
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        },
        // runtimeOrder :"flash",
        compress: {
            width: 500,
            height: 500,
            // 图片质量，只有type为`image/jpeg`的时候才有效。
            quality: 80,
            // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
            // allowMagnify: false,
            // 是否允许裁剪。
            crop: false,
            // 是否保留头部meta信息。
            preserveHeaders: false,
            // 如果发现压缩后文件大小比原来还大，则使用原来图片
            // 此属性可能会影响图片自动纠正功能
            noCompressIfLarger: true,
            // 单位字节，如果图片大小小于此值，不会采用压缩。
            compressSize: 0
        }
        //与webuploader参数一致
    }
})
console.log("initialed");