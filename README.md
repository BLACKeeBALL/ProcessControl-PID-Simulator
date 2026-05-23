# 过程控制-PID模拟器

## 项目简介

本项目是“过程控制系统及仪表”课程大作业，设计并实现了一个基于 PID 算法的温度过程控制仿真系统。系统采用一阶惯性带纯滞后的被控对象模型，可以模拟典型温度控制对象的动态响应过程。

## 主要功能

- PID 参数设置：Kp、Ki、Kd
- 被控对象参数设置：对象增益 K、时间常数 T、纯滞后时间 τ
- 温度设定值与仿真时间设置
- 温度响应曲线绘制
- 控制量曲线绘制
- 外部扰动测试
- 控制性能指标计算：超调量、调节时间、稳态误差、IAE、ISE
- PID 参数预设
- CSV 仿真数据导出

## 运行方法

下载或克隆本仓库后，直接打开：

```text
index.html
```

即可运行仿真系统。

## 被控对象模型

系统采用一阶惯性带纯滞后模型：

```math
G(s)=\frac{K}{Ts+1}e^{-\tau s}
```

离散仿真近似为：

```math
y(k+1)=y(k)+\frac{\Delta t}{T}[-y(k)+Ku(k-\tau)]
```

## PID 控制算法

```math
u(k)=K_p e(k)+K_i\sum e(k)\Delta t+K_d\frac{e(k)-e(k-1)}{\Delta t}
```

其中：

```math
e(k)=r(k)-y(k)
```

## 文件结构

```text
ProcessControl-PID-Simulator/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── pid.js
│   ├── plant.js
│   └── metrics.js
├── docs/
│   └── images/
└── README.md


```

## 课程设计说明

本项目通过网页形式实现过程控制系统的建模、仿真与性能分析。用户可以通过修改 PID 参数观察系统响应速度、超调量、稳态误差和抗扰动能力的变化，从而理解比例、积分、微分环节在过程控制系统中的作用。
