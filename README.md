# 此处引入webuploader.js而不采用npm包的默认的webuploader.fis.js差异应该如下:
```javascript
           fis: {
                name: 'webuploader',
                dest: "dist/webuploader.fis.js",

                fis: true,

                // 在没有jquery类似的库的前提下可以设置builtin,去除强行依赖。
                builtin: {
                    dollar: true,
                    promise: false
                }
            },
            all: {
                name: 'webuploader',
                dest: "dist/webuploader.js",

                // 在没有jquery类似的库的前提下可以设置builtin,去除强行依赖。
                builtin: {
                    dollar: false,
                    promise: false
                }
            }
```
初步看是构建时候引入不一样的输入方式和输出方式还有是否对dollar实现

然后内部有define(["jquery"])然后就在resolve里面解析为一个全局的jquery对象