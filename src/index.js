if(!Function.prototype.bind){
    Function.prototype.bind = function(){
        var fn = this,
        args = [].slice.call(arguments),
        object = args.shift();
        return function(){
            return fn.apply(object,args.concat([].slice.call(arguments)));
        };
    };
}
if (!Array.prototype.filter){
    Array.prototype.filter = function(fun /*, thisp*/){
    var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
            var res = new Array();
            var thisp = arguments[1];
            for (var i = 0; i < len; i++){
                if (i in this){
                    var val = this[i]; // in case fun mutates this
                    if (fun.call(thisp, val, i, this))
                    res.push(val);
                }
            }
        return res;
    };
}
//注入jquery
let MultiImageUploadWidget = require("./multiImageUploadWidget/main");
$.fn.multiImageUploadWidget = function (option) {
    this.each(function (k, v) {
        let instance = new MultiImageUploadWidget({
            container:$(this),
            ...option
        })
        $(this).data("multiImageUploadWidgetInstance", instance)
    })
}
module.exports = {
    MultiImageUploadWidget: MultiImageUploadWidget
}