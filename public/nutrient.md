# 作物营养缺乏（Nutrient Deficiency）诊断与处置建议报告

**Nutrient Deficiency Diagnosis & Action Report**

## 1. 结论摘要 / Summary

- **适用性（is_applicable）**：`True`
- **上游置信度（upstream_label_conf）**：`0.920`
- **本 Agent 复核分数（agent_validation_score）**：`0.753`
- **不确定性说明**：
  - 仅基于 RGB 的活力 proxy 可能与干旱、病害等胁迫混淆；如有 NIR/多时相影像，可显著增强判别。
  - 虽然紫色调通常指示氮或磷等关键营养元素缺乏，但需要通过土壤采样和遥感时序监测来进一步确认。
  - 影像分析可能受到光照条件、季节变化等因素的影响，导致结果的准确性存在一定的不确定性。
  - 受到气候条件影响，某些地区可能会出现假阳性或假阴性的检测结果，因此需要谨慎解释影像结果。
  - 土壤样本的采集和分析过程中的误差也可能引入一定的不确定性。

**中文：**

图像中出现了紫色斑块状的异常区域，这些区域与绿色背景形成了鲜明的对比，这通常是由于营养元素缺乏引起的。这些区域呈现出带状或条状的分布模式，边界模糊，并且与健康的植被纹理有显著差异。这种紫色调通常指示氮或磷等关键营养元素的缺乏，而不是其他类型的异常如干枯或双株现象。为了确认营养缺乏的程度并制定相应的施肥计划，建议立即采集土壤样本并进行遥感时序监测。

**English:**

Purple patches with a contrasting visual appearance against the green background are observed in the images, indicating a likely nutrient deficiency. These patches are typically band-shaped or linear and have blurry boundaries, distinguishing them from other types of anomalies such as drydown or double planting. The purple hue usually indicates a lack of key nutrients like nitrogen or phosphorus, rather than other conditions. To confirm the severity of the nutrient deficiency and develop an appropriate fertilization plan, it is recommended to immediately collect soil samples and conduct time-series remote sensing monitoring.

## 2. 可视化 / Visuals

### Query / Vigor Proxy / Severity Heatmap (1×3)
![triptych](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202603132021396.png)

> 从左到右：Query 图像、活力/指数 proxy、严重度热力图（透明 PNG 的可视化版本）。

## 3. 范围与严重度 / Extent & Severity

| Metric | Value |
| --- | --- |
| affected_area_px | 39668 |
| affected_ratio | 0.151 |
| patch_count | 6 |
| largest_patch_px | 35023 |
| mild_threshold | 0.216 |
| moderate_threshold | 0.302 |
| severe_threshold | 0.482 |

## 4. 更多图表 / More Figures

### Low-vigor 直方图（含阈值线）
![low_vigor_hist](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202603132021619.png)

### Severity 分布（像素计数）
![severity_dist](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202603132021612.png)

### Top Patch 面积柱状图
![patch_area_bar](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202603132022723.png)

### Severity 分布表
| class | pixel_count |
| --- | --- |
| healthy | 178932 |
| mild | 43544 |
| moderate | 21212 |
| severe | 18456 |

### Top Patch 面积表（前若干个斑块）
| rank | area_px | bbox(px) |
| --- | --- | --- |
| 0 | 35023 | (273,87,512,311) |
| 1 | 985 | (306,0,378,28) |
| 2 | 805 | (200,0,257,27) |
| 3 | 532 | (0,6,55,21) |
| 4 | 247 | (129,429,153,455) |
| 5 | 235 | (253,0,287,17) |

## 5. 证据 / Evidence

### Evidence Montage (2×3)
![evidence_montage](https://circlecoder05.oss-cn-beijing.aliyuncs.com/test/202603132022177.png)

对应关系（从左到右、从上到下）：
- **E1** labels_present=["nutrient_deficiency"]；该证据样本在数据集中标注包含 nutrient_deficiency，可作为对照参考。
- **E2** labels_present=["nutrient_deficiency"]；该证据样本在数据集中标注包含 nutrient_deficiency，可作为对照参考。
- **E3** labels_present=["nutrient_deficiency"]；该证据样本在数据集中标注包含 nutrient_deficiency，可作为对照参考。
- **E4** labels_present=["drydown"]
- **E5** labels_present=["nutrient_deficiency"]；该证据样本在数据集中标注包含 nutrient_deficiency，可作为对照参考。
- **E6** labels_present=["double_plant"]

## 6. 建议动作 / Recommended Actions

**中文：**
- 在重度斑块与健康区各选若干点做叶片/土壤采样，验证N/P/K与pH/EC等关键指标。
- 核对近期农事记录（施肥/灌溉/降雨），排查“水分胁迫/淋洗”导致的类似表征。
- 按斑块分区管理：优先对重度区做补救措施，对轻度区加强监测与复拍。

**English:**
- Sample leaves/soil in both severe patches and healthy zones to verify key nutrients and soil conditions (e.g., pH/EC).
- Cross-check recent operations (fertilization/irrigation) and rainfall to rule out water-stress or leaching effects.
- Use zone-based management: prioritize remediation in severe zones; monitor mild zones with follow-up imaging.

> 注意：涉及任何肥料/改良剂/用量方案时，请以当地农艺规范与产品标签为准；如不确定，咨询农技人员。

## 7. 专家建议视频 / Expert Advice Videos

- [营养缺乏的快速诊断与田间复核（示例链接，可替换）](https://example.com/nutrient_deficiency_diagnosis_video)
- [土壤/叶片采样流程与注意事项（示例链接，可替换）](https://example.com/soil_leaf_sampling_video)
- [分区管理：轻/中/重度斑块的监测与行动窗口（示例链接，可替换）](https://example.com/zone_management_video)

> 提示：以上链接可替换成你自己的录屏/专家讲解视频，以便答辩现场点击跳转演示。

## 8. 复核与监测 / Verification & Monitoring

**中文：**

- T+7 天：复拍同区域影像，对比活力指数/斑块面积变化。
- T+14 天：结合采样结果与复拍趋势，评估是否需要调整管理策略。

**English:**
- T+7d: Re-image the same area and compare vigor indices and patch extent changes.
- T+14d: Combine lab results and trend signals to decide whether to adjust the management plan.
