# 森林碳循环动态模拟系统：理论基础、设计实现与应用分析
# Forest Carbon Cycle Dynamic Simulation System: Theory, Implementation, and Application

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

**摘要 (Abstract)**

在全球气候变化背景下，准确评估森林生态系统的碳汇功能对于制定气候缓解策略至关重要。本文详细阐述了一款基于系统动力学（System Dynamics）原理的森林碳循环动态模拟系统的设计与实现。该系统采用现代 Web 技术栈（React + TypeScript）构建，集成了数值积分求解器与交互式可视化引擎。通过耦合光合作用、呼吸作用及土壤碳周转过程，系统能够定量模拟不同气候情景（如升温、干旱）对森林碳收支的长期影响。本文将从理论模型、数学表征、核心算法、系统架构及模拟结果五个维度进行深入剖析。

In the context of global climate change, accurately assessing the carbon sink function of forest ecosystems is crucial for developing climate mitigation strategies. This paper details the design and implementation of a Forest Carbon Cycle Dynamic Simulation System based on System Dynamics principles. Built with a modern Web technology stack (React + TypeScript), the system integrates numerical integration solvers with an interactive visualization engine. By coupling photosynthesis, respiration, and soil carbon turnover processes, the system can quantitatively simulate the long-term impacts of different climate scenarios (e.g., warming, drought) on forest carbon budgets. This paper provides an in-depth analysis from five dimensions: theoretical models, mathematical representation, core algorithms, system architecture, and simulation results.

---

## 快速开始 (Quick Start)

### 1. 下载 (Download)
访问 [Releases 页面](https://github.com/HarmonyChen110/forest-carbon-cycle-dynamics/releases) 下载最新版本的压缩包 (`ForestCarbonSim-Portable.zip`)。

Visit the [Releases page](https://github.com/HarmonyChen110/forest-carbon-cycle-dynamics/releases) to download the latest version of the zip archive (`ForestCarbonSim-Portable.zip`).

### 2. 解压 (Extract)
将下载的压缩包**完整解压**到一个文件夹中。请确保解压所有文件，不要直接在压缩包内运行。

**Fully extract** the downloaded zip archive into a folder. Please ensure all files are extracted; do not run the application directly from within the zip file.

### 3. 运行 (Run)
双击文件夹中的 `ForestCarbonSim.exe` 即可启动系统。

Double-click `ForestCarbonSim.exe` in the folder to launch the system.

---

## 1. 理论模型与数学表征 (Theoretical Framework)

本模型属于基于过程（Process-Based）的陆地生态系统碳循环模型。模型将森林生态系统抽象为由大气、植被、土壤构成的碳循环网络，旨在模拟森林生态系统在气候变化（升温、降水改变）和人类活动（砍伐、土地利用变化）双重压力下的碳收支动态。

This model is a Process-Based terrestrial ecosystem carbon cycle model. It abstracts the forest ecosystem into a carbon cycle network consisting of the atmosphere, vegetation, and soil, aiming to simulate the carbon budget dynamics of forest ecosystems under the dual pressures of climate change (warming, precipitation changes) and human activities (logging, land use changes).

### 1.1 核心假设与系统边界 (Core Assumptions & System Boundaries)
1.  **质量守恒 (Mass Conservation)**：碳在大气、植被和土壤三大碳库之间转移，遵循质量守恒定律。
    *   Carbon transfers between the three major carbon pools (atmosphere, vegetation, and soil) follow the law of conservation of mass.
2.  **非线性反馈 (Non-linear Feedback)**：生理过程（如呼吸作用）对温度的响应遵循 Arrhenius 指数规律（$Q_{10}$ 效应）。
    *   Physiological processes (such as respiration) respond to temperature following the Arrhenius exponential law ($Q_{10}$ effect).
3.  **初始锚定 (Initial Anchoring)**：模拟的时间起点基于站点的实测数据（如 $SOC$, $NPP$）进行初始化。
    *   The starting point of the simulation is initialized based on measured data from the site (e.g., $SOC$, $NPP$).

### 1.2 核心控制方程 (Governing Equations)

系统的动态演化由一组常微分方程（ODEs）描述。

The dynamic evolution of the system is described by a set of Ordinary Differential Equations (ODEs).

**方程 1：植被碳库动力学 ($C_{veg}$)**
**Equation 1: Vegetation Carbon Pool Dynamics ($C_{veg}$)**

$$
\frac{dC_{veg}}{dt} = NPP(t) - Litter(t) - H(t)
$$

其中，$NPP = GPP - R_a$ 为净初级生产力，$Litter$ 为凋落物输入，$H$ 为人类干扰造成的碳移除。

Where $NPP = GPP - R_a$ is Net Primary Productivity, $Litter$ is litterfall input, and $H$ is carbon removal caused by human disturbance.

**方程 2：土壤碳库动力学 ($C_{soil}$)**
**Equation 2: Soil Carbon Pool Dynamics ($C_{soil}$)**

$$
\frac{dC_{soil}}{dt} = Litter(t) - Rh(t)
$$

其中，$R_h$ 为异养呼吸（土壤呼吸），受温度与土壤湿度的非线性调控。

Where $R_h$ is heterotrophic respiration (soil respiration), which is non-linearly regulated by temperature and soil moisture.

![模型结构说明](Doc/模型说明.png)
*图 1：模型内部结构说明。展示了碳输入（光合作用）、碳周转（凋落物）与碳输出（呼吸作用）的数学逻辑关系。*
*Figure 1: Model internal structure illustration. Shows the mathematical logical relationships of carbon input (photosynthesis), carbon turnover (litterfall), and carbon output (respiration).*

### 1.3 关键生态过程算法 (Key Ecological Process Algorithms)

#### A. 光合作用 (GPP)
采用光能利用率 (LUE) 模型的变体，引入环境限制函数：

A variant of the Light Use Efficiency (LUE) model is adopted, introducing environmental limitation functions:

$$
GPP(t) = \varepsilon_{max} \times APAR_{base} \times f(T_t) \times f(W_t)
$$

*   $\varepsilon_{max}$: 最大光能利用率 (Maximum Light Use Efficiency).
*   $APAR_{base}$: 基准光合有效辐射 (Baseline Photosynthetically Active Radiation).
*   $f(T_t)$: 温度限制因子 (Temperature Limitation Factor).
*   $f(W_t)$: 水分限制因子 (Moisture Limitation Factor).

#### B. 呼吸作用 (Ra & Rh)
生态系统的呼吸作用对温度的变化表现出非线性正反馈，采用经典的 $Q_{10}$ 指数方程：

Ecosystem respiration exhibits a non-linear positive feedback to temperature changes, adopting the classic $Q_{10}$ exponential equation:

$$
R(t) = k \cdot C(t) \cdot Q_{10}^{\frac{T(t) - T_{ref}}{10}} \cdot f(W_t)
$$

该公式表明，温度每升高 10°C，呼吸速率将增加 $Q_{10}$ 倍。

This formula indicates that for every 10°C increase in temperature, the respiration rate increases by a factor of $Q_{10}$.

![驱动因子与反馈机制](Doc/驱动因子与反馈.png)
*图 2：系统驱动因子与反馈机制示意图。展示了温度、水分等环境变量如何通过光合作用（GPP）与呼吸作用（Rh, Ra）控制碳在植被与土壤库之间的流动。*
*Figure 2: Schematic of system driving factors and feedback mechanisms. Shows how environmental variables such as temperature and moisture control the flow of carbon between vegetation and soil pools through photosynthesis (GPP) and respiration (Rh, Ra).*

---

## 2. 系统架构与实现 (System Architecture & Implementation)

本系统采用“浏览器即模型（Browser-as-Model）”架构，无需本地部署即可提供模拟能力。

The system adopts a "Browser-as-Model" architecture, providing simulation capabilities without the need for local deployment.

### 2.1 技术栈与目录结构 (Tech Stack & Directory Structure)
系统核心采用 **TypeScript** 编写，利用其静态类型系统确保物理量计算的量纲一致性。前端框架选用 **React 18**，配合 **Vite** 构建工具。

The system core is written in **TypeScript**, leveraging its static type system to ensure dimensional consistency in physical quantity calculations. The frontend framework uses **React 18**, paired with the **Vite** build tool.

**项目目录结构 (Project Directory Structure)：**
```text
forest-carbon-cycle-dynamics/
├── components/            # 视图层 (View Layer)
│   ├── Charts.tsx         # Recharts 时间序列可视化组件 (Time series visualization component)
│   ├── ControlPanel.tsx   # 参数控制面板 (Parameter control panel)
│   ├── Dashboard.tsx      # 主仪表盘容器 (Main dashboard container)
│   ├── SensitivityAnalysis.tsx # 敏感性分析视图 (Sensitivity analysis view)
│   ├── SimulationReport.tsx    # 智能报告生成器 (Intelligent report generator)
│   └── StockFlowDiagram.tsx    # SVG 系统动力学流图 (SVG System Dynamics flow diagram)
├── services/              # 业务逻辑与计算服务 (Model Layer)
│   ├── dataService.ts     # 数据加载与预处理 (Data loading and preprocessing)
│   ├── exportService.ts   # 结果导出 (Result export)
│   └── modelService.ts    # 核心 ODE 求解器与通量计算引擎 (Core ODE solver and flux calculation engine)
├── types.ts               # TypeScript 类型定义 (TypeScript type definitions)
└── App.tsx                # 应用入口 (Application entry)
```

### 2.2 界面布局 (Interface Layout)
系统界面设计主要由控制面板、动态可视化区和指标监控区构成。

The system interface design mainly consists of a control panel, a dynamic visualization area, and an indicator monitoring area.

![系统主界面概览](Doc/主界面示意图1.png)
*图 3：系统主界面概览。左侧为参数控制面板，右侧展示了碳库动态与碳通量的时间序列变化，顶部卡片实时显示当前模拟年份的关键生态指标。*
*Figure 3: System main interface overview. The left side is the parameter control panel, the right side shows the time series changes of carbon pool dynamics and carbon fluxes, and the top cards display key ecological indicators for the current simulation year in real-time.*

### 2.3 核心算法代码解析 (Core Algorithm Code Analysis)

#### 2.3.1 反演初始化 (Inverse Initialization)
为了解决动态模型常面临的“预热效应”，本系统利用 $t_0$ 时刻的观测数据反向求解系统的内禀参数。

To address the "spin-up effect" often faced by dynamic models, this system uses observed data at time $t_0$ to inversely solve for the system's intrinsic parameters.

```typescript
// services/modelService.ts 片段 (Snippet)

// 计算初始时刻的环境标量 (Calculate environmental scalars at initial time)
const initial_fT = calc_fT(site.MAT, params.Q10);
const initial_fW = calc_fW(site.AridityIndex);

// 反演基准 APAR：确保模拟起点的 GPP 等于观测值
// Inverse baseline APAR: Ensure GPP at simulation start equals observed value
const baseline_APAR = site.GPP / (params.epsilonMax * initial_fT * initial_fW);
```

#### 2.3.2 前向欧拉积分 (Forward Euler Integration)
系统采用前向欧拉法对微分方程进行数值求解，时间步长 $\Delta t = 1$ 年。

The system uses the Forward Euler method for numerical solution of differential equations, with a time step of $\Delta t = 1$ year.

```typescript
// 状态变量迭代更新 (State variable iterative update)
for (let t = 0; t <= simulationYears; t++) {
    // 1. 更新驱动力 (Update driving forces)
    const currentTemp = site.MAT + (params.warmingRate * t);
    
    // 2. 计算通量速率 (Calculate flux rates)
    const Rh = params.kSoil * Csoil * fT * fW; // 异养呼吸 (Heterotrophic respiration)
    const NPP = GPP - Ra;                      // 净初级生产力 (Net Primary Productivity)
    
    // 3. 求解微分方程 (Solve differential equations)
    const dCsoil = Litter - Rh;
    
    // 4. 欧拉积分 (Euler integration)
    Csoil += dCsoil; 
}
```

---

## 3. 模拟结果与分析 (Simulation Results)

系统模拟了未来 50-100 年内森林生态系统在不同气候情景下的演变趋势。

The system simulates the evolutionary trends of forest ecosystems under different climate scenarios over the next 50-100 years.

### 3.1 碳库动态演变 (Carbon Pool Dynamics Evolution)
在标准气候情景下，系统模拟了植被碳库与土壤碳库的长期积累过程。模拟结果显示，随着林龄增加，植被碳库呈现逻辑斯蒂（Logistic）增长，最终趋于饱和。

Under standard climate scenarios, the system simulates the long-term accumulation process of vegetation and soil carbon pools. Simulation results show that as forest age increases, the vegetation carbon pool exhibits Logistic growth and eventually tends towards saturation.

![碳库动态模拟](Doc/碳库动态.png)
*图 4：森林碳库动态模拟结果。绿色曲线代表植被碳密度，棕色曲线代表土壤碳密度。*
*Figure 4: Forest carbon pool dynamic simulation results. The green curve represents vegetation carbon density, and the brown curve represents soil carbon density.*

### 3.2 碳通量与源汇转换 (Carbon Fluxes & Source-Sink Transition)
碳通量（Carbon Fluxes）是衡量生态系统代谢活性的关键指标。

Carbon Fluxes are key indicators for measuring ecosystem metabolic activity.

![碳通量时间序列](Doc/碳通量.png)
*图 5：生态系统碳通量时间序列。展示了 GPP（总初级生产力）、NPP（净初级生产力）与 Rh（异养呼吸）随时间的动态变化。*
*Figure 5: Ecosystem carbon flux time series. Shows the dynamic changes of GPP (Gross Primary Productivity), NPP (Net Primary Productivity), and Rh (Heterotrophic Respiration) over time.*

### 3.3 净生态系统碳平衡 (NECB)
净生态系统碳平衡（NECB）反映了森林是作为“碳汇”还是“碳源”。

Net Ecosystem Carbon Balance (NECB) reflects whether the forest acts as a "carbon sink" or a "carbon source".

$$
NECB = NEP - Disturbance_{loss}
$$

模拟显示，在升温情景下，由于呼吸作用对温度的敏感性（$Q_{10}$ 效应）高于光合作用，森林可能在特定阈值后由碳汇转变为碳源。

Simulations show that under warming scenarios, due to the higher sensitivity of respiration to temperature ($Q_{10}$ effect) compared to photosynthesis, the forest may transition from a carbon sink to a carbon source after a certain threshold.

![生态系统净碳平衡](Doc/生态系统净碳平衡.png)
*图 6：生态系统净碳平衡（NECB）分析。正值表示碳汇，负值表示碳源。*
*Figure 6: Net Ecosystem Carbon Balance (NECB) analysis. Positive values indicate a carbon sink, negative values indicate a carbon source.*

---

## 4. 敏感性分析与智能评估 (Sensitivity Analysis & Assessment)

### 4.1 参数敏感性 (Parameter Sensitivity)
结果表明，土壤呼吸对 $Q_{10}$ 参数高度敏感，微小的温度上升可能导致土壤碳库的损耗。

Results indicate that soil respiration is highly sensitive to the $Q_{10}$ parameter, and a slight temperature increase may lead to the depletion of the soil carbon pool.

![参数敏感性分析](Doc/参数敏感性分析.png)
*图 7：参数敏感性分析结果。展示了不同 $Q_{10}$ 值对生态系统总碳储量的影响。*
*Figure 7: Parameter sensitivity analysis results. Shows the impact of different $Q_{10}$ values on the total ecosystem carbon storage.*

### 4.2 智能评估报告 (Intelligent Assessment Report)
系统集成了自动化的报告生成模块，能够根据模拟结果自动生成综合评估报告。

The system integrates an automated report generation module capable of automatically generating comprehensive assessment reports based on simulation results.

![智能评估报告生成](Doc/智能评估报告.png)
*图 8：系统生成的智能评估报告示例。*
*Figure 8: Example of an intelligent assessment report generated by the system.*

---

## 5. 结论 (Conclusion)

本文介绍的森林碳循环动态模拟系统，通过集成系统动力学方法与现代 Web 技术，实现了一个可交互的虚拟生态实验室。模拟结果强调了温度升高对森林碳汇功能的双重影响：一方面延长生长季可能促进光合作用，另一方面指数级增长的呼吸消耗可能抵消固碳收益。本系统为森林管理者制定适应性管理措施提供了定量的科学依据。

This paper introduces a Forest Carbon Cycle Dynamic Simulation System that integrates System Dynamics methods with modern Web technologies to realize an interactive virtual ecological laboratory. Simulation results emphasize the dual impact of rising temperatures on forest carbon sink functions: on one hand, extending the growing season may promote photosynthesis; on the other hand, exponentially increasing respiration consumption may offset carbon sequestration gains. This system provides a quantitative scientific basis for forest managers to develop adaptive management measures.

---

## 6. 许可协议 (License)

本项目采用 **[Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)** 进行许可。

This project is licensed under the **[Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)**.

这意味着您可以：
*   **共享** — 在任何媒介或格式下复制和分发本素材。
*   **改编** — 基于本素材进行修改、转换或构建。

This means you are free to:
*   **Share** — copy and redistribute the material in any medium or format.
*   **Adapt** — remix, transform, and build upon the material.

但在遵守以下条件的前提下：
*   **署名 (Attribution)** — 您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否（对原始作品）作了修改。
*   **非商业性使用 (NonCommercial)** — 您不得将本素材用于商业目的。

Under the following terms:
*   **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
*   **NonCommercial** — You may not use the material for commercial purposes.

如需商业使用授权，请联系作者。

For commercial use authorization, please contact the author.
