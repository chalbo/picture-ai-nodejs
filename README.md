# sai-nodejs
基于opencv4nodejs对原来业务做一些外层
人工智能服务nodejs后台，基于sofa+zookeeper+opencv4+opencv4nodejs框架。web业务层 koa2。

##1、 安装java jdk 1.8
***
##2、make编译安装opencv4

git clone https://github.com/opencv/opencv.git
git clone https://github.com/opencv/opencv_contrib.git

***
在源码目录中创建一个临时目录，这里会存放一下cmake编译生成的文件
```
cd~ / opencv
mkdir build
```
配置
```
cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local .. #不带模型
cmake -D CMAKE_BUILD_TYPE=Release -D CMAKE_INSTALL_PREFIX=/usr/local -D OPENCV_EXTRA_MODULES_PATH=/Users/zhangbo/opencv_contrib-master/modules .. #带模型

```
构建安装
```
make -j6＃并行运行6个作业
sudo make install
```
至此OpenCV在MAC上算安装完毕了。
添加环境变量 .bashrc
### linux and osx:
```
export OPENCV4NODEJS_DISABLE_AUTOBUILD=1
npm install --save opencv4nodejs

```
##3、安装zookeeper
###Mac下
###brew install zookeeper

##4、进入sainode目录，执行npm -I

