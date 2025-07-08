export const PROMPT_CATEGORIES = [
  'General',
  'text-to-image',
  'text-to-video',
  'text-to-audio',
  'audio-to-text',
] as const;

export const MODEL_TYPES = [
  {
    id: 1,
    name: "Text Generation",
    enum: 'text-to-text',
    models: [
      {
        name: "anthropic/claude-3.7-sonnet",
        platform: "Replicate/Hugging face or open source??",
        link: "https://replicate.com/anthropic/claude-3-7-sonnet",
        cost: "100K tokens / $150"
      }
    ]
  },
  {
    id: 2,
    name: "Text to Image Generation",
    enum: 'text-to-image',
    models: [
      {
        name: "fal-ai/flux-pro/v1.1-ultra",
        platform: "Fal.ai/Replicate",
        link: "https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra/playground",
        cost: "$0.06 per image"
      },
      {
        name: "fal-ai/recraft-v3",
        platform: "Fal.ai/Replicate",
        link: "https://fal.ai/models/fal-ai/recraft-v3",
        cost: "$0.04 per image"
      },
      {
        name: "ideogram-ai/ideogram-v2-turbo",
        platform: "Fal.ai/Replicate",
        link: "https://replicate.com/ideogram-ai/ideogram-v2-turbo",
        cost: "$0.05 per image"
      }
    ]
  },
  {
    id: 3,
    name: "Text to Video",
    enum: 'text-to-video',
    models: [

      {
        name: "fal-ai/kling-video/v1.6/pro/text-to-video",
        platform: "Fal.ai",
        link: "https://fal.ai/models/fal-ai/kling-video/v1.6/pro/text-to-video",
        cost: "$0.1 per second video"
      }
    ]
  },
  {
    id: 4,
    name: "Image to Video ",
    enum: 'image-to-video',
    models: [{
      name: "fal-ai/kling-video/v1.6/pro/image-to-video",
      platform: "Fal.ai",
      link: "https://fal.ai/models/fal-ai/kling-video/v1.6/pro/image-to-video",
      cost: "$0.1 per second video"
    },
    ]

  },
  {
    id: 5,
    name: "Video to Video ",
    enum: 'video-to-video',
    models: [{
      name: "fal-ai/hunyuan-video/video-to-video",
      platform: "Fal.ai",
      link: "https://fal.ai/models/fal-ai/hunyuan-video/video-to-video",
      cost: "$0.1 per second video"
    },]
  },
  {
    id: 5,
    name: "Voice Cloner",
    enum: 'voice-cloner',
    models: [
      {
        name: "lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e",
        platform: "Replicate",
        link: "https://replicate.com/lucataco/xtts-v2",
        cost: "$0.0013"
      }
    ]
  },
  {
    id: 6,
    name: "Audio to Text",
    enum: 'audio-to-text',
    models: [
      {
        name: "openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e",
        platform: "Replicate",
        link: "https://replicate.com/openai/whisper",
        cost: "$0.0013"
      }
    ]
  },
  {
    id: 7,
    name: "Text to Music",
    enum: 'text-to-music',
    models: [
      {
        name: "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        platform: "Replicate",
        link: "https://replicate.com/meta/musicgen",
        cost: "$0.096 to run"
      }
    ]
  },
  {
    id: 8,
    name: "Audio to Audio",
    enum: 'audio-to-audio',
    models: []
  },
  {
    id: 9,
    name: "Music to Music",
    enum: 'music-to-music',
    models: [
      {
        name: "sakemin/musicgen-remixer:0b769f28e399c7c30e4f2360691b9b11c294183e9ab2fd9f3398127b556c86d7",
        platform: "Replicate",
        link: "https://replicate.com/sakemin/musicgen-remixer",
        cost: "$0.36"
      }
    ]
  },
  {
    id: 10,
    name: "Image to 3D",
    enum: 'image-to-3d',
    models: [
      {
        name: "ndreca/hunyuan3d-2",
        platform: "Replicate",
        link: "https://replicate.com/ndreca/hunyuan3d-2",
        cost: "*"
      }
    ]
  },
  {
    id: 11,
    name: "Image to Text",
    enum: 'image-to-text',
    models: [
      {
        name: "llava 13b",
        platform: "Replicate",
        link: "https://replicate.com/yorickvp/llava-13b",
        cost: "$0.0045"
      }
    ]
  },
  {
    id: 12,
    name: "Image to Image",
    enum: 'image-to-image',
    models: [
      {
        name: "fal-ai/flux-pro/v1.1-ultra/redux",
        platform: "Fal.ai",
        link: "https://fal.ai/models/fal-ai/flux-pro/v1.1-ultra/redux",
        cost: "$0.05 per megapixel ($1 for 20 times)"
      }
    ]
  },
  {
    id: 12,
    name: "Gemini ",
    enum: 'gemini',
    models: [
      {
        name: "gemini-2.0-flash-exp-image-generation",
        platform: "Gemini",
        link: "https://gemini.google.com/api/gemini-2.0-flash-exp-image-generation",
        cost: "$0.05 per megapixel ($1 for 20 times)"
      }
    ]
  },
  {
    id: 12,
    name: "FLUX MODEL TRAINING ",
    enum: 'model-training',
    models: [
      {
        name: "fal-ai/flux-lora-fast-training",
        platform: "Fal.ai",
        link: "https://fal.ai/models/fal-ai/flux-lora-fast-training",
        cost: "$0.05 per megapixel ($1 for 20 times)"
      }
    ]
  },
  {
    id: 13,
    name: "fal-ai/flux-pro/v1/fill ",
    enum: 'inpaint',
    models: [
      {
        name: "fal-ai/flux-pro/v1/fill",
        platform: "Fal.ai",
        link: "https://fal.ai/models/fal-ai/flux-pro/v1/fill",
        cost: "$0.05 per megapixel ($1 for 20 times)"
      }
    ]
  },
  {
    id: 14,
    name: "Flux Lora Fast Training",
    enum: 'flux-lora-fast-training',
    models: [
      {
        name: "fal-ai/flux-lora-fast-training",
        platform: "Fal.ai",
        link: "https://fal.ai/models/fal-ai/flux-lora-fast-training",
        cost: "$0.05 per megapixel ($1 for 20 times)"
      }
    ]
  },
  {
    id: 15,
    name: "OpenAI",
    enum: 'openai',
    models: [
      {
        name: "gpt-image-1",
        platform: "OpenAI",
        link: "https://openai.com/api/models/gpt-image-1",
        cost: "$0.05 per megapixel ($1 for 20 times)"
      }
    ]
  }
] as const;

export type PromptCategory = typeof PROMPT_CATEGORIES[number]; 