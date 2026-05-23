# 过程控制-PID模拟器

## 在线运行地址

https://blackeeball.github.io/ProcessControl-PID-Simulator/

## 项目简介

本项目是“过程控制系统及仪表”课程大作业，设计并实现了一个基于 PID 算法的温度过程控制仿真系统。系统采用一阶惯性带纯滞后的被控对象模型，可以模拟典型温度控制对象的动态响应过程。

## 主要功能

- PID 参数设置：Kp、Ki、Kd
- 被控对象参数设置：对象增益 K、时间常数 T、纯滞后时间 τ
- 温度设定值与仿真时间设置
- 温度响应曲线绘制
- 控制量曲线绘制
- 动态演示：曲线按采样时刻逐步生成，显示当前仿真时间和当前时刻红线
- 外部扰动测试
- 控制性能指标计算：超调量、调节时间、稳态误差、IAE、ISE
- PID 参数预设
- CSV 仿真数据导出

## 运行方法

直接打开 `index.html`，或访问上方在线运行地址。

## 被控对象模型

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
