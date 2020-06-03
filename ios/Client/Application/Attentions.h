
** Attentions!! **

一、关于热更新功能
    👉 1、发布热更新或者切换分支打包之前(特别是切换目录打包之前)，务必删除./ios/bundle目录下的文件，运行命令`npm run bundle-ios`以重新打包；
    👉 2、集成热更新之后bundle不再使用之前的./ios/bundle目录下的index.ios.jsbundle(.meta)文件，所以集成了热更新之后，可以删除这两个文件，而使用./ios目录下的main.jsbundle(.meta)文件，同时`AppDelegate`里边程序入口要改成`[CodePush bundleURL]`；
    👉 3、发布更新命令：`code-push react-release App名称 参数一 参数二 ...`;
    👉 4、可以使用`code-push deployment ls App名称 -k`命令查看注册的CodePush Key以及应用更新情况；

二：iOS版本发布热更新流程
    👉 确保自上次打包之后代码经过修改;
    👉 打包环境改为`Staging(测试)`或者`Release(发布)`;
    👉 控制台运行`code-push release-react App名字 ios`

三：发布更新可能会用到的命令
    code-push release-react <appName> <platform>
        [--bundleName <bundleName>
        [--deploymentName <deploymentName>
        [--description <description>
        [--development <development>
        [--disabled <disabled>
        [--entryFile <entryFile>
        [--mandatory <mandatory>
        [--sourcemapOutput <sourcemapOutput>
        [--targetBinaryVersion <targetBinaryVersion>
        [--rollout <rolloutPercentage>
四：问题总结
         之前打包一直报错没有找到文件libRCTPhotoBrowser.a的问题，是因为插件没有指定iOS Deployment Target
