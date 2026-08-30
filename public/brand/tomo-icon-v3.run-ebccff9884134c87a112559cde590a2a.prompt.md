# Prompt Asset

## Metadata
```json
{
  "generated_at": "2026-08-30T06:25:40.878050+00:00",
  "output": "/home/node/.openclaw/workspace/cowork/tomo-3d/public/brand/tomo-icon-v3.png",
  "task_profile": "illustration",
  "task_profile_reason": "explicit",
  "creative_brief": {
    "schema_version": 2,
    "brief_version": "2026-08-09.2",
    "intent": {
      "goal": "",
      "audience": "",
      "destination": "",
      "primary_message": ""
    },
    "art_direction": {
      "concept": "",
      "directions": [],
      "mood": [],
      "avoid_cliches": [],
      "candidate_variation_axes": []
    },
    "delivery": {
      "requirements": []
    },
    "references": [],
    "exploration": {
      "creative_freedom": "medium"
    },
    "execution_policy": {
      "quality_tier": "quality",
      "visual_domain": "illustration",
      "novelty": "balanced"
    },
    "provenance": {
      "/execution_policy/quality_tier": {
        "source": "default",
        "confidence": 1.0
      },
      "/execution_policy/visual_domain": {
        "source": "inferred",
        "confidence": 0.7
      },
      "/execution_policy/novelty": {
        "source": "inferred",
        "confidence": 0.7
      },
      "/exploration/creative_freedom": {
        "source": "inferred",
        "confidence": 0.7
      }
    }
  },
  "quality_plan": {
    "schema_version": 2,
    "brief_digest": "e7164e347e83f332d775ccf244ecaf9eabc76df23ad590380fc16e7ab539ff73",
    "candidate_direction_digest": "e7164e347e83f332d775ccf244ecaf9eabc76df23ad590380fc16e7ab539ff73",
    "quality_tier": "quality",
    "creative_freedom": "medium",
    "candidate_set_id": null,
    "direction_id": null,
    "candidate_concept": null,
    "candidate_index": 1,
    "candidate_total": 1,
    "recommended_candidate_count": 2,
    "candidate_coverage": "insufficient",
    "candidate_mode": "divergent-then-convergent",
    "required_diversity_axes": [
      "concept",
      "composition_or_camera",
      "visual_language_or_palette"
    ],
    "variation_axes": [],
    "review_dimensions": [
      "requirement_fidelity",
      "concept_specificity",
      "composition_hierarchy",
      "craft_detail",
      "text_typography",
      "destination_usability",
      "delight"
    ],
    "independent_review_required": true,
    "maximum_targeted_retries": 2
  },
  "prompt_compilation": {
    "raw_sha256": "ec82a8dd6f635ab92cd9d68288cb3b1cb2e7b23dd98a0a9c79117f75d836198b",
    "compiled_sha256": "254e282631e10155660748f3449d03b7eb878f1936543001c7b242edacd1300d",
    "template_id": "allin-openai-structured-illustration-v1",
    "template_version": "2026-08-09.3",
    "task_profile": "illustration",
    "task_profile_reason": "explicit",
    "prompt_mode": "quality",
    "model_profile_id": "openai-structured-illustration-v1",
    "hard_constraints": {
      "facts": [],
      "exact_text": [],
      "preserve": [],
      "forbid": [
        "text, letters, watermark, logo, 3D render, photo, gradient, complex details, thin outlines, watercolor"
      ]
    },
    "creative_brief_schema_version": 2,
    "creative_brief_version": "2026-08-09.2",
    "creative_brief_digest": "e7164e347e83f332d775ccf244ecaf9eabc76df23ad590380fc16e7ab539ff73",
    "candidate_direction_digest": "e7164e347e83f332d775ccf244ecaf9eabc76df23ad590380fc16e7ab539ff73"
  },
  "model": "gpt-image-2",
  "model_selection": {
    "mode": "explicit",
    "model": "gpt-image-2",
    "reason": "explicit-model",
    "task_profile": "illustration",
    "policy_version": "2026-08-20.1",
    "policy_digest": "3f856baa08a1c916c1dc00dbac32a6e6d5a0cc97c86888b27c3ea55d2bff50b7",
    "task_profile_reason": "explicit"
  },
  "model_policy_version": "2026-08-20.1",
  "model_policy_digest": "3f856baa08a1c916c1dc00dbac32a6e6d5a0cc97c86888b27c3ea55d2bff50b7",
  "capabilities_digest": "fe03361b1e8866d7169ebb2754af99ae8df7f1722fed9042de38f1b54dc5e94b",
  "chatbot_key": "gpt-image-2",
  "style": null,
  "default_style_applied": false,
  "input_images": [],
  "workspace_id": 0,
  "project_id": 0,
  "retry_stage": 0
}
```

## Extra Params
```json
{
  "image_ratio": "1:1"
}
```

## Raw Prompt

App icon, square 1:1: a cute tomato character designed as bold flat silhouette style. The tomato body is a solid tomato-red filled silhouette with crisp organic rounded shape. Face features are carved out in cream-white negative space: two simple dot eyes with a tiny sparkle and one small curved smile line, rosy cheek dots. The green leaf calyx on top is a solid dark-green jagged silhouette like spiky cartoon hair, strong symbol shape. Pure cream off-white background, no gradient, no shadow. Subtle risograph print grain texture overlay on the red silhouette for hand-made retro feel. Thick confident shapes with generous margins, high contrast, sticker-like simplicity, legible at tiny sizes. Minimal, cool, playful.

## Compiled Prompt

<user_requirements>
App icon, square 1:1: a cute tomato character designed as bold flat silhouette style. The tomato body is a solid tomato-red filled silhouette with crisp organic rounded shape. Face features are carved out in cream-white negative space: two simple dot eyes with a tiny sparkle and one small curved smile line, rosy cheek dots. The green leaf calyx on top is a solid dark-green jagged silhouette like spiky cartoon hair, strong symbol shape. Pure cream off-white background, no gradient, no shadow. Subtle risograph print grain texture overlay on the red silhouette for hand-made retro feel. Thick confident shapes with generous margins, high contrast, sticker-like simplicity, legible at tiny sizes. Minimal, cool, playful.
</user_requirements>

<production_directives>
- 建立清晰单一的视觉焦点、层级、留白和目的地适配构图。
- 用一致的色彩、光线、材质和风格完成画面，避免无意义元素堆叠。
- 先形成与内容、受众和使用场景绑定的视觉逻辑；避免套用通用 AI 图标、库存式构图或无意义高级感。
- 至少做出一个有目的、可解释的独特设计决策；惊喜来自概念、构图与工艺，不来自堆叠装饰。
- 按最终使用尺寸检查视觉焦点、层级、留白、边缘、材质和文字排印。
- 画布比例由接口参数控制；不要把比例、参数名或制作说明绘制进图片。
</production_directives>

<hard_constraints>
禁止出现或禁止改变：
- text, letters, watermark, logo, 3D render, photo, gradient, complex details, thin outlines, watercolor
</hard_constraints>

<final_check>
生成前自行核对：事实、数量、文字、身份/参考保持、概念特异性、构图层级、工艺细节、目的地可用性和伪影。
任何装饰都不得覆盖硬约束。
</final_check>
