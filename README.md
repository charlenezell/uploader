# README

## 一些心得

1. 调试node程序

    1. 一般可以使用vscode的lauch预配置（实质是调用了node --debug-brk ）
    1. 如果需要调试webpack的话官方暂时没有方案但是也是可以使用上面的方式去做 在当前要运行webpack的目录运行node --debug-brk xx/bin/webpack之类的
        ```bat
        @IF EXIST "%~dp0\node.exe" (
          "%~dp0\node.exe" "--debug-brk"  "%~dp0\..\webpack\bin\webpack.js" %*
        ) ELSE (
          @SETLOCAL
          @SET PATHEXT=%PATHEXT:;.JS;=;%
          node "--debug-brk" "%~dp0\..\webpack\bin\webpack.js" %*
        )
        ```

1. webpack2部分插件已经不支持ie8了比如style-loader里面用了bind方法可以用polyfill解决也可以内部自己做polyfill如果全局加麻烦的话

1. babel里面也有对关键字做变量名等让ie8崩溃的事儿，所以只能加一个plugin做转化（es3ifyPlugin）

1. 其中style注入页面支持top和bottom两种但是有个问题是注入时候如果前面有link是在脚本后的话似乎注入的style会有位置问题这个应该是浏览器渲染顺序的问题，所以header里面尽量样式在脚本前面。

## todo
1. [] 集成自己的sassMixin到里面