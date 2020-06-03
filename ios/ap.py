# encoding: utf-8
#mars 2017年09月23日16:52:27
#环境配置begin
#sudo easy_install pip
#brew install mysql
#sudo chmod 777 /usr/local/share/man/man8
#sudo -H pip install MySQL-python
#sudo easy_install biplist
#sudo easy_install os
#sudo pip install pillow

# 文档更新记录：
    # 2019/02/22: 由于更改了数据地址导致jenkins无法打包，报错权限错误，决绝办法：将`MySQLdb`替换为`pymysql``
    #


#环境配置结束
import pymysql
import subprocess
import os
import shutil
import urllib,urllib2
import time
import re
import sys
from PIL import Image

#数据库操作类
class MysqldbHelper:
    #获取数据库连接
    def getCon(self):
        try:
            conn=pymysql.connect('39.108.132.34','yjjmanager','bluestone_YJJ@2.0','ecmaster')
            return conn
        except pymysql.err,e:
            print "Mysqldb Error:%s" % e
    #查询方法，使用con.cursor(pymysql.cursors.DictCursor),返回结果为字典
    def select(self,sql):
        try:
            con=self.getCon()
            print con
            cur=con.cursor(pymysql.cursors.DictCursor)
            count=cur.execute(sql)
            fc=cur.fetchall()
            return fc
        except pymysql.err,e:
            print "Mysqldb Error:%s" % e
        finally:
            cur.close()
            con.close()
    #带参数的更新方法,eg:sql='insert into pythontest values(%s,%s,%s,now()',params=(6,'C#','good book')
    def updateByParam(self,sql,params):
        try:
            con=self.getCon()
            cur=con.cursor()
            count=cur.execute(sql,params)
            con.commit()
            return count
        except pymysql.err,e:
            con.rollback()
            print "Mysqldb Error:%s" % e
        finally:
            cur.close()
            con.close()
    #不带参数的更新方法
    def update(self,sql):
        try:
            con=self.getCon()
            cur=con.cursor()
            count=cur.execute(sql)
            con.commit()
            return count
        except pymysql.err,e:
            con.rollback()
            print "Mysqldb Error:%s" % e
        finally:
            cur.close()
            con.close()

def getConfig(configs,name):
    for config in configs:
        if config["name"]==name:
            return config["value"]

def getColor(colorconfigs,name):
    for color in colorconfigs:
        if color["name"]==name:
            return color["value"]

def getImage(imageconfigs,name):
    for image in imageconfigs:
        if image["name"]==name:
            return image["value"]

def cutImg(infile,size,outputpath):
    img = Image.open(infile)
    img.thumbnail(size,Image.ANTIALIAS)
    img.save(outputpath,"PNG")

companysysno=sys.argv[1]
buildnumber=sys.argv[2]

companyid=MysqldbHelper().select("select authid from ecmaster.`company`  where sysno="+companysysno+"")
print "------------------- companysysno is "+companysysno
keychianpath='~/Library/Keychains/login.keychain'
keychianpwd='123456'
#keychianpwd='yzw@123'
def updateConfig(name,value):
    if MysqldbHelper().select("select 1 from `ecmaster`.`companyparameter`  where companysysno='" + companysysno + "' and `name`='" + name + "' "):
        MysqldbHelper().update("UPDATE ecmaster.companyparameter SET `value`='" + value + "' where companysysno='" + companysysno + "' and `name`='" + value + "'")
    else:
        MysqldbHelper().update("INSERT INTO `ecmaster`.`companyparameter`(`companysysno`,`name`,`value`)VALUES('" + companysysno + "','" + name + "','" + value + "')")


sql="select `name`,`value` from ecmaster.companyparameter where companysysno="+companysysno
configs= MysqldbHelper().select(sql)
colors=MysqldbHelper().select("select `name` from ecmaster.companyparameter where ParameterValueType=3 and companysysno="+companysysno)
colorconfigs=MysqldbHelper().select("select `name`, `value` from ecmaster.companyparameter where ParameterValueType=3 and companysysno="+companysysno)
imageconfigs=MysqldbHelper().select("select `name`, `value` from ecmaster.companyparameter where ParameterValueType=1 and companysysno="+companysysno)
#clean flag
updateConfig("IOSAppLastCreatDate","")
#创建零时目录
tempdir='temp'
companydir='assets/images/company'
if os.path.exists(tempdir)==False:
    os.mkdir(tempdir)
if os.path.exists(companydir)==False:
    os.mkdir(companydir)
#证书文件自助管理
#step1 导入p12文件
imagesiteurl="http://img2.lixiantuce.com"
# print "👉"
# print os
# print os.path
# print companysysno
# print configs
# print getConfig(configs,'IOSP12')
# print "👉"
p12path=os.path.abspath(tempdir)+"/"+companysysno+os.path.splitext(getConfig(configs,'IOSP12'))[1]
urllib.urlretrieve(imagesiteurl+getConfig(configs,'IOSP12')+"?t="+time.strftime('%Y%m%d%H%M%S',time.localtime(time.time())),p12path)
subprocess.call (["security unlock-keychain -p "+keychianpwd+" "+keychianpath],shell=True)
subprocess.call (["security import "+p12path+" -k "+keychianpath+" -P "+keychianpwd+" -T /usr/bin/codesign"],shell=True)
print "-------------------证书导入成功"
#step2解析描述文件
profilepath=os.path.abspath(tempdir)+"/"+companysysno+os.path.splitext(getConfig(configs,'IOSProfile'))[1];
plistpath=os.path.abspath(tempdir)+"/"+companysysno+".plist"
urllib.urlretrieve(imagesiteurl+getConfig(configs,'IOSProfile')+"?t="+time.strftime('%Y%m%d%H%M%S',time.localtime(time.time())),profilepath)
subprocess.call (["security cms -D -i "+profilepath+" > "+plistpath],shell=True)
#step3从描述文件中获取appid、teamidentifier、teamname
from biplist import *
try:
    plist = readPlist(plistpath)
    AppId=plist.AppIDName
    TeamIdentifier=plist.TeamIdentifier
    TeamName=plist.TeamName
    UUID=plist.UUID
    ExpirationDate=plist.ExpirationDate
    AppIdPrefix=plist.ApplicationIdentifierPrefix[0]
except (InvalidPlistException, NotBinaryPlistException), e:
    print "plist文件错误", e
print "-------------------描述文件解析成功"
#step4安装描述文件
shutil.copyfile(profilepath,'/Users/qsww/Library/MobileDevice/Provisioning Profiles/'+UUID+'.mobileprovision')
#shutil.copyfile(profilepath,'/Users/qsww/Library/MobileDevice/Provisioning Profiles/'+UUID+'.mobileprovision')
print "-------------------描述安装解析成功"
#step5校验描述文件与p12文件是否一致
p=subprocess.Popen (["security find-identity -v codesigning "+keychianpath],shell=True,stdout=subprocess.PIPE)
pattern1 = re.compile("\"(.*Distribution:\s"+TeamName+"\s\("+AppIdPrefix+"\))\"")#我们在编译这段正则表达式  "iPhone Distribution: wei jiang (BJM57H74R2)"   .*Distribution:\sTeamName\s\(AppIdPrefix\)
matcher1 = re.search(pattern1,p.stdout.read())#在源文本中搜索符合正则表达式的部分
cercommonname=matcher1.group(1)#打印出来(备注：如果在这一行报错请尝试执行如下步骤：1、Xcode->Preferences->Accounts里边确认导入了要打包的App账号；2、去开发者网站重新生成新的开发证书导入到本地钥匙串中。)
print "-------------------证书和描述文件校验完成"
#根据输入的参数去数据库中查询企业的配置信息
#替换原代码中的logo，appname、登录背景等信息

logofile=os.path.abspath(tempdir)+"/"+companysysno+os.path.splitext(getConfig(configs,'IOSAPPIcon'))[1]
urllib.urlretrieve(imagesiteurl+getConfig(configs,'IOSAPPIcon')+"?t="+time.strftime('%Y%m%d%H%M%S',time.localtime(time.time())),logofile)
xcassetspath=os.path.abspath("ios/Client/Application/Images.xcassets/AppIcon.appiconset")
cutImg(logofile,(76,76),xcassetspath+"/"+"YJJiPadApp_76pt.png")
cutImg(logofile,(152,152),xcassetspath+"/"+"YJJiPadApp_76pt@2x.png")
cutImg(logofile,(20,20),xcassetspath+"/"+"YJJiPadNotifications_20pt.png")
cutImg(logofile,(40,40),xcassetspath+"/"+"YJJiPadNotifications_20pt@2x.png")
cutImg(logofile,(167,167),xcassetspath+"/"+"YJJiPadProApp_83.5pt@2x.png")
cutImg(logofile,(29,29),xcassetspath+"/"+"YJJiPadSpootlight5_29pt.png")
cutImg(logofile,(58,58),xcassetspath+"/"+"YJJiPadSpootlight5_29pt@2x.png")
cutImg(logofile,(40,40),xcassetspath+"/"+"YJJiPadSpootlight7_40pt.png")
cutImg(logofile,(80,80),xcassetspath+"/"+"YJJiPadSpootlight7_40pt@2x.png")
cutImg(logofile,(120,120),xcassetspath+"/"+"YJJiPhoneApp_60pt@2x.png")
cutImg(logofile,(180,180),xcassetspath+"/"+"YJJiPhoneApp_60pt@3x.png")
cutImg(logofile,(40,40),xcassetspath+"/"+"YJJiPhoneNotification_20pt@2x.png")
cutImg(logofile,(60,60),xcassetspath+"/"+"YJJiPhoneNotification_20pt@3x.png")
cutImg(logofile,(58,58),xcassetspath+"/"+"YJJiPhoneSpootlight5_29pt@2x.png")
cutImg(logofile,(87,87),xcassetspath+"/"+"YJJiPhoneSpootlight5_29pt@3x.png")
cutImg(logofile,(80,80),xcassetspath+"/"+"YJJiPhoneSpootlight7_40pt@2x.png")
cutImg(logofile,(120,120),xcassetspath+"/"+"YJJiPhoneSpootlight7_40pt@3x.png")
cutImg(logofile,(1024,1024),xcassetspath+"/"+"YJJstore_1024pt.png")
print "-------------------Logo替换完成"

# 修改bundle identifier
subprocess.call (["sed -i '' s/com.bluestone.yjj/"+getConfig(configs,'IOSBundleIdentifier')+"/g "+os.path.abspath("ios/YJJApp.xcodeproj/project.pbxproj")],shell=True)

# 修改包名、版本号、应用名称、应用图标
subprocess.call (["/usr/libexec/PlistBuddy -c 'Set :CFBundleDisplayName "+getConfig(configs,'IOSAppName')+"' "+os.path.abspath("ios/Client/Application/Info.plist")],shell=True)
print "-------------------APP名称替换完成"

subprocess.call (["/usr/libexec/PlistBuddy -c 'Set :CFBundleInfoDictionaryVersion "+getConfig(configs,'IOSVersionName')+"' "+os.path.abspath("ios/Client/Application/Info.plist")],shell=True)
subprocess.call (["/usr/libexec/PlistBuddy -c 'Set :CFBundleShortVersionString "+getConfig(configs,'IOSVersionName')+"' "+os.path.abspath("ios/Client/Application/Info.plist")],shell=True)
print "-------------------版本号替换完成"

subprocess.call (["/usr/libexec/PlistBuddy -c 'Set :CFBundleIdentifier "+getConfig(configs,'IOSBundleIdentifier')+"' "+os.path.abspath("ios/Client/Application/Info.plist")],shell=True)
print "-------------------包名替换完成"

subprocess.call (["/usr/libexec/PlistBuddy -c 'Set :CFBundleVersion "+buildnumber+"' "+os.path.abspath("ios/Client/Application/Info.plist")],shell=True)
print "-------------------BuildNumber替换完成"

#####################################################################################
##### 配置iOS原生文件`CompanyConfigurationManager`，以及配置JS文件`company.app.js`

companyConfig = "#import \"CompanyConfigurationManager.h\"\n\n"
companyConfig += "@implementation CompanyConfigurationManager\n\n"
companyConfig += "RCT_EXPORT_MODULE();\n\n"
companyConfig += "- (NSDictionary<NSString *,id> *)constantsToExport {\n"
companyConfig += "  return @{\n"
companyConfig += "           @\"CompanyAppConfig\" : @{\n"
companyConfig += "               @\"CompanyID\" : @\"" + companyid[0]["authid"] + "\",\n"
companyConfig += "               @\"BaiduPushAPIKey\" : @{\n"
companyConfig += "                   @\"android\": @\"notset\",\n"
companyConfig += "                   @\"ios\": @\"" + getConfig(configs,'BaiduPush_IOSAPIKey') + "\"\n"
companyConfig += "               },\n"
companyConfig += "               @\"AppColor\" : @{\n"
for index in range(len(colors)):
    color=colors[index]
    companyConfig += "                   " + "@\"" + color['name'] + "\"" +" : " + "@\"" + getColor(colorconfigs,color['name']) + "\"" + (",\n" if index!=len(colors)-1 else "\n")
companyConfig += "               },\n"
companyConfig += "               @\"AppStyle\" : @\"" +getConfig(configs,'AppStyle')+ "\"\n"
companyConfig += "        }\n"
companyConfig += "    };\n"
companyConfig += "}\n"
companyConfig += "\n"
companyConfig += "@end"
fp = open("ios/Client/Helpers/CompanyConfigurationManager.m", 'w')
fp.write(companyConfig)
fp.close()
print "-------------------`CompanyConfigurationManager.m`文件配置完成"

companyApp = "import { NativeModules } from 'react-native';\n"
companyApp += "var config = NativeModules.CompanyConfigurationManager.CompanyAppConfig;\n\n"
companyApp += "export const CompanyAppConfig = Object.assign({\n"
companyApp += "    env: 'production',\n"
companyApp += "    baseURL: 'http://app-svc.lixiantuce.com',\n"
companyApp += "    uploadUrl: 'http://img2.lixiantuce.com',\n"
companyApp += "    imageBaseUrl: 'http://img2.lixiantuce.com',\n"
companyApp += "    appUpdateUrl: 'http://www.lixiantuce.com/Company/Index/',\n"
companyApp += "    isGeneral: function () { return config.CompanyID == '00000000-0000-0000-0000-000000000000'; },\n"
if os.path.exists("ios/Client/Application/Images.xcassets/Company Assets"):
    shutil.rmtree("ios/Client/Application/Images.xcassets/Company Assets") #首先删除目录之下的所有文件
for index in range(len(imageconfigs)):
    image = imageconfigs[index]
    imagestrs = getImage(imageconfigs, image['name'])
    components = imagestrs.split('/')   #abc.png
    saveimagearr = components[-1].split('.') # abc png
    pathdir = os.path.abspath("ios/Client/Application/Images.xcassets/Company Assets") + "/" + image['name'] + ".imageset"
    if not os.path.exists(pathdir):
        os.makedirs(pathdir)
    savepath = pathdir + "/"  + image['name'] + "." + saveimagearr[-1]
    urllib.urlretrieve(imagesiteurl + imagestrs, savepath)
    companyApp += "    " + image['name'] + "_Name: '" + image['name'] + "." + saveimagearr[-1] + "',\n"
    companyApp += "    " + image['name'] + ": {uri: '" + image['name'] + "'},\n"
    contentJsonDir = pathdir + '/Contents.json'
    contentJson = "{\n  \"images\" : [\n"
    contentJson += "    {\n      \"idiom\" : \"universal\",\n"
    contentJson += "      \"filename\" : \"" + image['name'] + "." + saveimagearr[-1] + "\",\n"
    contentJson += "      \"scale\" : \"1x\"\n"
    contentJson += "    },\n    {\n      \"idiom\" : \"universal\",\n      \"scale\" : \"2x\"\n    },\n    {\n      \"idiom\" : \"universal\",\n      \"scale\" : \"3x\"\n    }\n  ],\n  \"info\" : {\n    \"version\" : 1,\n    \"author\" : \"xcode\"\n  }\n}"
    fp = open(contentJsonDir, 'w')
    fp.write(contentJson)
    fp.close()
companyApp += "}, config);\n"
companyApp += "\n"
companyApp += "export default CompanyAppConfig;"
fp = open("config/company.app.js", 'w')
fp.write(companyApp)
fp.close()
print "-------------------`company.app.js`文件配置完成"

##### 完成配置iOS原生文件`CompanyConfigurationManager`，以及配置JS文件`company.app.js`
#####################################################################################

# 打包react代码
print "-------------------react bundle start"
subprocess.call (["/usr/local/bin/node "+os.path.abspath("node node_modules/react-native/local-cli/cli.js")+" bundle --entry-file "+os.path.abspath("index.ios.js")+" --bundle-output "+os.path.abspath("ios/main.jsbundle")+" --platform ios --assets-dest "+os.path.abspath("ios/bundle")+" --dev false"],shell=True)
print "-------------------react bundle 完成"

#如果要修改应用icon和launchimage直接替换icon和launchimage目录里面的图片就可以了，用到rm移除命令，cp粘贴命令
xcarchivepath=os.path.abspath(tempdir)+"/"+companysysno+".xcarchive"
subprocess.call (["xcodebuild archive -workspace ios/YJJApp.xcworkspace -scheme YJJApp -configuration Release CODE_SIGN_IDENTITY='"+cercommonname+"' PROVISIONING_PROFILE='"+UUID+"' -archivePath "+xcarchivepath],shell=True)
print "-------------------xcarchive生成完成"

#读取exportOptionsPlist文件，替换相应的值，生成exportOptionsPlist.plist
exportOptionsPlistName="temp/exportOptionsPlist-"+companysysno+".plist"
f = open('ios/ep.plist','r')
f_new = open(exportOptionsPlistName,'w')
for line in f:
    if "$appid$" in line:
        line = line.replace('$appid$',getConfig(configs,'IOSBundleIdentifier'))
    if "$uuid$" in line:
        line = line.replace('$uuid$',UUID)
    if "$teamid$" in line:
        line = line.replace('$teamid$',TeamIdentifier[0])
    f_new.write(line)
f.close()
f_new.close()
print "-------------------exportOptionsPlist.plist生成完成"
subprocess.call (["xcodebuild -exportArchive -archivePath '"+xcarchivepath+"' -exportPath '"+os.path.abspath(tempdir)+"' -exportOptionsPlist "+exportOptionsPlistName],shell=True)
print "-------------------ipa导出完成"

#将打包好的app重新命名,并更新到数据库
ipaname=AppId+"_"+companysysno+"_"+time.strftime('%m%d%H%M',time.localtime(time.time()))+".ipa"
shutil.copyfile(os.path.abspath(tempdir)+"/YJJApp.ipa",os.path.abspath(tempdir)+"/"+ipaname)
#提交到appstore
subprocess.call (["/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool -v -f "+os.path.abspath(tempdir)+"/"+ipaname+" -u "+getConfig(configs,'IOSAccount')+" -p "+getConfig(configs,'IOSCertPwd')+" -t ios"],shell=True)

subprocess.call (["/Applications/Xcode.app/Contents/Applications/Application\ Loader.app/Contents/Frameworks/ITunesSoftwareService.framework/Support/altool --upload-app -f "+os.path.abspath(tempdir)+"/"+ipaname+" -u  "+getConfig(configs,'IOSAccount')+" -p "+getConfig(configs,'IOSCertPwd')+" -t ios"],shell=True)
print "-------------------上传到苹果APPStore完成"
updateConfig("IOSAppFileName",ipaname)
updateConfig("IOSAppLastCreatDate",ipaname)
print "UPDATE IOSAppFileName SUCCESS"

