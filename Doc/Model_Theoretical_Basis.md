# 森林碳循环模型理论说明书
# Theoretical Basis of the Forest Carbon Cycle Model

## 1. 模型概述 (Overview)

本模型是一个基于过程（Process-Based）的陆地生态系统碳循环模型。它旨在模拟森林生态系统在气候变化（升温、降水改变）和人类活动（砍伐、土地利用变化）双重压力下的碳收支动态。

系统将复杂的生态过程抽象为三个主要的碳“存量”（Stock）和连接它们的“流量”（Flow）。

### 核心假设
1.  **质量守恒**：碳不会凭空产生或消失，只会在大气、植被和土壤三大碳库之间转移。
2.  **非线性反馈**：生理过程（如呼吸作用）对温度的响应遵循 Arrhenius 指数规律（$Q_{10}$ 效应），而非线性关系。
3.  **初始锚定**：模拟的时间起点严格基于站点的实测数据（如 $SOC$, $NPP$），而非随机初始化，确保模拟具有现实意义。

---

## 2. 数据字典与变量定义 (Data Dictionary)

模型输入数据源于全球通量观测网络及遥感产品（MODIS, WorldClim）。

| 字段代码 | 全称 (Full Name) | 定义与物理含义 | 单位 |
| :--- | :--- | :--- | :--- |
| **Site** | Site Identifier | 观测站点的唯一标识符。 | - |
| **Habitat** | Habitat Type | 生境类型。**F**=森林 (Forest), **G**=草地 (Grassland)。影响根冠比参数。 | - |
| **MAT** | Mean Annual Temp | 年均温。决定生化反应速率的基准温度。 | °C |
| **MAP** | Mean Annual Precip | 年降水量。决定水分限制阈值。 | mm |
| **SOC** | Soil Organic Carbon | 土壤有机碳密度。模型初始化时土壤碳库的关键状态变量。 | Mg C/ha |
| **NPP** | Net Primary Production | 净初级生产力。植被生长的净碳源（观测值）。 | gC/m²/yr |
| **GPP** | Gross Primary Production | 总初级生产力。光合作用固定的总碳量。 | gC/m²/yr |
| **HMI** | Human Modification | 人类干扰指数 (0-1)。用于计算人为导致的碳损失（如砍伐）。 | 无量纲 |
| **Aridity** | Aridity Index | 干旱指数。通常为 MAP/PET，用于计算水分胁迫系数。 | 无量纲 |

---

## 3. 核心算法与方程 (Core Algorithms)

系统随时间 $t$ 的演化由一组常微分方程组控制。

### 3.1 状态方程 (State Equations)

植被碳库 ($C_{veg}$) 与 土壤碳库 ($C_{soil}$) 的变化率定义为：

$$
\frac{dC_{veg}}{dt} = NPP(t) - Litter(t) - H(t)
$$

$$
\frac{dC_{soil}}{dt} = Litter(t) - Rh(t)
$$

其中：
*   $NPP$: 净初级生产力
*   $Litter$: 凋落物输入
*   $H$: 人类干扰造成的碳移除
*   $Rh$: 异养呼吸（土壤呼吸）

### 3.2 过程算法 (Process Algorithms)

#### A. 光合作用 (GPP)
采用光能利用率 (LUE) 模型的变体：

$$
GPP(t) = \varepsilon_{max} \times APAR_{base} \times f(T_t) \times f(W_t)
$$

*   $\varepsilon_{max}$: 最大光能利用率。
*   $APAR_{base}$: 基准光合有效辐射（通过反演初始化获得）。
*   $f(T_t)$: 温度限制因子。
*   $f(W_t)$: 水分限制因子。

#### B. 呼吸作用 (Ra & Rh)
遵循指数响应函数，体现正反馈机制：

$$
R(t) = k \times Stock(t) \times Q_{10}^{\frac{T(t) - T_{ref}}{10}} \times f(W_t)
$$

*   $Q_{10}$: 温度敏感性系数（通常取值 1.5 - 2.5）。表示温度每升高 10°C，呼吸速率增加的倍数。
*   $T_{ref}$: 参考温度（通常为 10°C）。

#### C. 人类干扰 (Disturbance)
人类活动作为一种外部强迫，直接按比例移除植被碳库：

$$
H(t) = h \times HMI \times C_{veg}(t)
$$

*   $h$: 干扰强度系数（模型参数）。
*   $HMI$: 站点的具体干扰指数。

---

## 4. 模拟流程 (Simulation Workflow)

1.  **读取输入**：加载站点的气候、土壤和植被观测数据作为 $t=0$ 时刻的初始状态。
2.  **参数反演**：根据初始 GPP 和气候数据，反向计算该站点的环境承载力基准。
3.  **时间步进**：
    *   根据设定的情景（如：每年升温 0.05°C），更新当年的气候驱动因子。
    *   代入方程计算当年的通量（GPP, Ra, Rh, Litter）。
    *   使用欧拉法更新下一年的碳库储量。
4.  **结果输出**：生成长达 50 年的碳动态时间序列。