# 基于系统动力学的森林碳循环动态模拟系统：设计与实现
# Design and Implementation of a System Dynamics Model for Forest Carbon Cycling

## 摘要 (Abstract)

本文档旨在阐述“森林碳循环动态模拟系统”的软件架构与核心技术实现。该系统基于 React 框架构建，集成了数值积分求解器、交互式参数控制及动态数据可视化模块。系统旨在解决传统静态生态模型难以表征时间演化与反馈机制的痛点，通过前向欧拉法（Forward Euler Method）实现碳通量的逐年迭代，并采用力导向拓扑思想优化了系统结构图的视觉呈现。

## 1. 系统目录结构与模块化设计 (Directory Structure)

本系统采用现代前端工程化的模块化设计，遵循“数据-逻辑-视图”分离的原则。目录结构如下：

```text
/src
├── components/              # 视图层 (View)
│   ├── Charts.tsx           # 时间序列可视化图表组件 (Recharts封装)
│   ├── StockFlowDiagram.tsx # 系统动力学结构图 (SVG矢量渲染核心)
│   ├── ControlPanel.tsx     # 模型参数交互控制面板
│   ├── Dashboard.tsx        # 综合仪表盘 (布局容器)
│   ├── SensitivityAnalysis.tsx # 龙卷风图与灵敏度计算展示
│   ├── SimulationReport.tsx    # 智能评估报告生成器
│   └── SystemDocumentation.tsx # 在线理论文档
├── services/                # 逻辑层 (Service/Model)
│   ├── dataService.ts       # 原始异构数据解析与清洗服务
│   ├── modelService.ts      # 核心ODE求解器与通量计算引擎
│   └── exportService.ts     # 多格式数据导出服务 (CSV/Markdown)
├── types.ts                 # TypeScript 类型定义 (数据契约)
├── constants.ts             # 系统常量、预设情景与缺省参数
└── App.tsx                  # 应用入口
```

该结构确保了科学计算逻辑（`services`）与用户界面渲染（`components`）的解耦，便于后续算法的迭代与科学修正。

## 2. 核心算法实现 (Core Algorithms)

本系统的核心在于 `modelService.ts` 中的数值模拟引擎。区别于常规的数据展示应用，本系统实现了基于过程（Process-based）的动态推演。

### 2.1 反演初始化策略 (Inverse Initialization)

为了解决系统动力学模型中常见的“预热效应（Spin-up Artifacts）”问题，即模拟初期因状态不平衡导致的数据剧烈波动，本系统采用了“反推法”。即利用 $t_0$ 时刻的观测数据，反向求解系统参数。

**代码实现片段：**

```typescript
// services/modelService.ts

// 计算初始时刻的调节因子
const initial_fT = calc_fT(site.MAT, params.Q10);
const initial_fW = calc_fW(site.AridityIndex);

// 反演基准光合有效辐射 (Baseline APAR)
// 假设：观测到的 GPP 反映了该站点在当前气候条件下的潜在光合能力
const baseline_APAR = site.GPP > 0 
  ? site.GPP / (params.epsilonMax * initial_fT * initial_fW) 
  : 1000; // Fallback
```

此算法确保了无论用户选择哪个站点，模拟曲线的起点始终锚定在真实观测值上，保证了科学上的自洽性。

### 2.2 离散化数值积分 (Discrete Numerical Integration)

系统的时间演化遵循质量守恒定律，通过求解常微分方程组（ODEs）实现。算法采用时间步长 $\Delta t = 1 \text{ year}$ 的前向欧拉法。

**核心迭代逻辑：**

```typescript
// 循环遍历模拟年份 (t)
for (let t = 0; t <= years; t++) {
    // 1. 更新气候驱动 (Climate Drivers)
    currentTemp = site.MAT + (params.warmingRate * t);
    
    // 2. 计算通量 (Fluxes)
    // 光合作用 (GPP) 受光能利用率、温度、水分共同限制
    const GPP = params.epsilonMax * baseline_APAR * fT * fW;
    // 呼吸作用 (Ra, Rh) 遵循指数响应 Q10
    const Ra = params.alphaRa * GPP * Math.pow(1.05, (currentTemp - site.MAT));
    const Rh = params.kSoil * Csoil * fT_soil * fW_soil;
    
    // 3. 状态更新 (State Update - Euler Integration)
    const dCveg = NPP - Litter - H; // 植被碳变率
    const dCsoil = Litter - Rh;     // 土壤碳变率
    
    // 更新存量
    Cveg += dCveg;
    Csoil += dCsoil;
}
```

## 3. 可视化核心代码 (Visualization Core)

为了直观展示复杂的生态反馈机制，系统摒弃了静态图片，转而使用 SVG 动态渲染技术构建系统结构图。

### 3.1 拓扑布局优化 (Topology Layout)

在 `StockFlowDiagram.tsx` 中，为了避免复杂连接线的交叉（Line Crossing Problem），采用了“同心圆/周边流（Perimeter Flow）”布局策略：

*   **中心层**：放置驱动因子（温度、水分），作为信息辐射源。
*   **外围层**：放置物质流（碳通量），形成闭环。

**SVG 路径生成逻辑：**

```typescript
// components/StockFlowDiagram.tsx

// GPP 通路：从大气(底部)出发，向上弯曲进入植被(中心)
// 使用三次贝塞尔曲线 (C) 实现平滑的非交叉路径
<MassFlow d="M 150 420 L 150 150 C 150 100 310 100 310 210" />

// 反馈信号：使用虚线连接驱动因子与阀门
// type='pos' 渲染为绿色（正反馈），type='neg' 渲染为红色（负反馈）
<InfoLink d="M 80 180 Q 100 480 545 360" type="pos" />
```

这种代码化的绘图方式使得图表具有高度的可维护性，且能支持鼠标悬停交互（Hover Effects）。

## 4. 用户界面与交互设计 (UI & Interaction)

系统界面设计遵循“探索式数据分析（Exploratory Data Analysis, EDA）”流程。

### 4.1 综合控制台 (Dashboard)

*(图注：系统主界面。左侧为参数控制面板，支持滑块调节 $Q_{10}$、升温速率等参数；右侧为多标签页结果展示区。)*

交互逻辑：
1.  **参数扰动**：用户拖动左侧滑块（例如将 $Q_{10}$ 从 2.0 调至 2.5）。
2.  **实时响应**：`useEffect` 钩子监听到 `params` 变化，立即触发 `runSimulation` 重新计算 50 年的数据。
3.  **动态更新**：右侧的面积图（Area Chart）即时重绘，展示新的碳库演化轨迹。

### 4.2 智能评估报告 (Smart Reporting)

*(图注：自动生成的分析报告界面。包含“碳源/汇”判定结论、关键指标变化率及数据摘要表。)*

系统内置了一个简易的“专家系统”，根据模拟结果自动生成自然语言描述：

*   **判定逻辑**：`const isSink = deltaC > 0;`
*   **归因分析**：通过对比期初与期末的 $Rh$（异养呼吸）值，自动判断是否因温度升高导致呼吸超过光合作用。

### 4.3 系统结构交互

在系统结构图中，采用了交互式 SVG 元素：
*   **高亮机制**：当鼠标悬停在“温度”节点上时，所有受温度影响的连线（如指向 Rh 的 Q10 路径）会高亮显示，帮助用户理解复杂的耦合关系。
*   **原理解析**：顶部的信息栏会根据悬停对象，动态显示该生态过程的数学定义（如 $Rh = k \cdot C_{soil} \cdot f(T)$）。

## 5. 结论

本系统成功实现了一个轻量级但科学严谨的森林碳循环模拟器。通过前端技术的深度应用，将复杂的微分方程组转化为可交互、可视化的动态图形，为理解气候变化背景下的生态系统响应提供了有力的科研辅助工具。