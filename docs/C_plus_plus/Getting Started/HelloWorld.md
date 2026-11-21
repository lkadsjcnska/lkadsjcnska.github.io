---
title: C++入门 02 Hello World!
description: C++简单的示例
tags:
    - C++
comments: true
---
​

 因为作者本人也是C++初学者，所以...可能有些地方解释的可能不好，敬请谅解...

### 一、使用g++做一个HelloWorld程序
??? info
    Q: 不是除了g++以外还有个gcc吗？为什么不用Ta呢？ 
    
    A: gcc给c语言用的，`g++`是给`C++`用的，自然地，要用专门的编译器
废话不多说，教程开始

首先，在桌面新建一个本文文档

![](https://i-blog.csdnimg.cn/direct/e29a3e2575784fe3bfb7ca0b53ef18f1.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

然后改后缀名

![](https://i-blog.csdnimg.cn/direct/0fab7f42c3e6431daecaed32e06799c6.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

接着打开DEV-C++(因为可能CSP-J和CSP-S这类的考试要用，所以我们要尽快熟悉)

![](https://i-blog.csdnimg.cn/direct/d0c9fe5774e34bf08b4cc5dfa8072f4f.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

接着打开刚才创建的文件  
![](https://i-blog.csdnimg.cn/direct/042d76b803ab472695891b4d66434c88.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

![](https://i-blog.csdnimg.cn/direct/35abcc14f15e49329eae73b4005e1a40.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

接着就可以编写代码了

在此之前吗，我们不能忘记头文件。在C++中的标准输入输出流是iostream。

头文件导入代码

```cpp

#include <iostream>
```

![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

为了方便输入输出，我们要简化(要不然到时候输入时还得在前面加一个std::)

```cpp

using namespace std;
```

![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

然后是主函数和输出代码

还有"//文字"(不加引号)是注释

```cpp

int main(){//大括号也不能少
    cout << "Hello World";//分号不能少
}
```

![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

然后我们的HelloWorld程序就做好了

整体代码：

```cpp

#include <iostream>
using namespace std;
int main(){
    cout << "Hello World!";
    return 0;//这个return 0是结束的意思
}
```

![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)

然后把代码复制到DEV里面，如图，点击编译并运行  
![](https://i-blog.csdnimg.cn/direct/6c55202e53284a529d68fdf36d769e21.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

![](https://i-blog.csdnimg.cn/direct/2cf2ff89e94d4e678c16886127a4bd68.png)![](data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==)​编辑

好了，今天就到这里了(~~_绝对不是水文章_~~)

​