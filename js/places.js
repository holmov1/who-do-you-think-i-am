// Places on the Chapter I map. Each place is one paper.
// x, y are in the map's viewBox (1500 x 680). `anchor` sets label side.
// Notes paraphrase how the preprint's §2 describes each work.

window.MAP_PLACES = [
  // ── Western island: the user as bias ─────────────────
  {
    id: "rbp", region: "bias", x: 125, y: 297, anchor: "start",
    label: "Reading Between the Prompts", year: 2025,
    title: "Reading Between the Prompts: How Stereotypes Shape LLM’s Implicit Personalization",
    authors: "Neplenbroek, Bisazza & Fernández", venue: "EMNLP 2025",
    url: "https://arxiv.org/abs/2505.16467",
    note: "Models infer a user’s demographics from stereotypical cues such as names and interests, even against what the user states; the bias can be reduced by intervening on internal representations.",
  },
  {
    id: "yan", region: "bias", x: 125, y: 349, anchor: "start",
    label: "Locating Personalization", year: 2026,
    title: "Locating and Controlling Implicit Personalization in Large Language Models",
    authors: "Yan, Wu & Le", venue: "arXiv 2026",
    url: "https://arxiv.org/abs/2608.11735",
    note: "Activation signals track how outputs shift under implicit demographic cues; removing them suppresses a cue’s influence better than prompting does.",
  },
  {
    id: "weeber", region: "bias", x: 125, y: 401, anchor: "start",
    label: "One Persona, Many Cues", year: 2026,
    title: "One Persona, Many Cues, Different Results: How Sociodemographic Cues Impact LLM Personalization",
    authors: "Weeber, Neplenbroek, Batzner & Padó", venue: "ACL 2026",
    url: "https://aclanthology.org/2026.acl-long.2079/",
    note: "Six commonly used persona cues, from names to explicit statements, agree overall yet vary enough to change conclusions about bias; some rarely occur in real chats.",
  },
  {
    id: "talktuner", region: "bias", x: 125, y: 453, anchor: "start",
    label: "TalkTuner", year: 2024,
    title: "Designing a Dashboard for Transparency and Control of Conversational AI",
    authors: "Chen, Wu, DePodesta, … Wattenberg & Viégas", venue: "arXiv 2024",
    url: "https://arxiv.org/abs/2406.07882",
    note: "Probes a chatbot’s internal model of the user’s age, gender, education and socioeconomic status, and shows it in a dashboard where the user can also adjust it.",
  },
  {
    id: "ghand", region: "bias", x: 125, y: 505, anchor: "start",
    label: "Who’s Asking?", year: 2024,
    title: "Who’s asking? User personas and the mechanics of latent misalignment",
    authors: "Ghandeharioun, Yuan, Guerard, Reif, Lepori & Dixon", venue: "NeurIPS 2024",
    url: "https://arxiv.org/abs/2406.12094",
    note: "How a model perceives its user changes whether it shares harmful content; steering the user persona bypasses safety more effectively than steering refusal directly.",
  },
  {
    id: "zhong", region: "bias", x: 125, y: 557, anchor: "start",
    label: "User Awareness", year: 2026,
    title: "User awareness in frontier models",
    authors: "Zhong, Raghunathan, Laidlaw & Steinhardt", venue: "Transluce 2026",
    url: "https://transluce.org/user-awareness",
    note: "Frontier models change their behaviour toward people they recognise, for instance giving known AI researchers more help on borderline requests, while rarely saying so.",
  },

  {
    id: "eloundou", region: "bias", x: 405, y: 349, anchor: "start",
    label: "First-Person Fairness", year: 2024,
    title: "First-Person Fairness in Chatbots",
    authors: "Eloundou, Beutel, Robinson et al.", venue: "arXiv 2024",
    url: "https://arxiv.org/abs/2410.19803",
    note: "Measures whether chatbot answers change with the user’s name, as a proxy for their demographic group.",
  },
  {
    id: "sharma", region: "bias", x: 405, y: 297, anchor: "start",
    label: "Sycophancy", year: 2024,
    title: "Towards Understanding Sycophancy in Language Models",
    authors: "Sharma, Tong, Korbak et al.", venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
    note: "Assistants tend to tell users what they want to hear, a behaviour linked to human preference data.",
  },
  {
    id: "staab", region: "bias", x: 405, y: 401, anchor: "start",
    label: "Beyond Memorization", year: 2024,
    title: "Beyond Memorization: Violating Privacy via Inference with Large Language Models",
    authors: "Staab, Vero, Balunović & Vechev", venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.07298",
    note: "Models can infer personal attributes such as location, income and age from ordinary text a user writes.",
  },
  {
    id: "lamp", region: "bias", x: 405, y: 453, anchor: "start",
    label: "LaMP", year: 2024,
    title: "LaMP: When Large Language Models Meet Personalization",
    authors: "Salemi, Mysore, Bendersky & Zamani", venue: "ACL 2024",
    url: "https://arxiv.org/abs/2304.11406",
    note: "A benchmark for personalization in which the user is supplied to the model as a profile of past documents.",
  },
  {
    id: "liu", region: "bias", x: 405, y: 505, anchor: "start",
    label: "Personalized LLMs", year: 2025,
    title: "A Survey of Personalized Large Language Models: Progress and Future Directions",
    authors: "Liu, Qiu, Li et al.", venue: "arXiv 2025",
    url: "https://arxiv.org/abs/2502.11528",
    note: "Surveys how models are personalized: through prompts, user-specific adapters and preference alignment.",
  },
  {
    id: "jin", region: "bias", x: 320, y: 557, anchor: "start",
    label: "Implicit Personalization", year: 2024,
    title: "Implicit Personalization in Language Models: A Systematic Study",
    authors: "Jin, Heil, Liu et al.", venue: "Findings of EMNLP 2024",
    url: "https://arxiv.org/abs/2405.14808",
    note: "Studies how models infer a user’s background from implicit cues and adapt their answers to it.",
  },

  // ── Eastern island: the model as persona ─────────────
  {
    id: "pv", region: "persona", x: 1155, y: 303, anchor: "start",
    label: "Persona Vectors", year: 2025,
    title: "Persona Vectors: Monitoring and Controlling Character Traits in Language Models",
    authors: "Chen, Arditi, Sleight, Evans & Lindsey", venue: "arXiv 2025",
    url: "https://arxiv.org/abs/2507.21509",
    note: "Linear directions for assistant traits such as evil, sycophancy and hallucination, used to monitor the persona, steer it, prevent unwanted shifts in finetuning and flag training data.",
  },
  {
    id: "polylogue", region: "persona", x: 1155, y: 483, anchor: "start",
    label: "An Internal Polylogue", year: 2026,
    title: "Do LLMs Experience an Internal Polylogue? Investigating Reasoning through the Lens of Personas",
    authors: "Herrmann, Girrbach, Bykov & Akata", venue: "arXiv 2026",
    url: "https://arxiv.org/abs/2605.09159",
    note: "Tracks how persona directions align with activations as a model reasons; these signals help predict whether the answer will be correct.",
  },

  {
    id: "serapio", region: "persona", x: 1155, y: 258, anchor: "start",
    label: "Personality Traits", year: 2023,
    title: "Personality Traits in Large Language Models",
    authors: "Serapio-García, Safdari, Crepy et al.", venue: "arXiv 2023",
    url: "https://arxiv.org/abs/2307.00184",
    note: "Measures personality in language models with validated psychometric tests and shapes it through prompting.",
  },
  {
    id: "wang", region: "persona", x: 1155, y: 348, anchor: "start",
    label: "Emergent Misalignment", year: 2025,
    title: "Persona Features Control Emergent Misalignment",
    authors: "Wang, Dupré la Tour, Watkins et al.", venue: "arXiv 2025",
    url: "https://arxiv.org/abs/2506.19823",
    note: "Finds persona-like features that control emergent misalignment after narrow finetuning.",
  },
  {
    id: "shah", region: "persona", x: 1155, y: 393, anchor: "start",
    label: "Persona Jailbreaks", year: 2023,
    title: "Scalable and Transferable Black-Box Jailbreaks for Language Models via Persona Modulation",
    authors: "Shah, Feuillade-Montixi, Pour et al.", venue: "arXiv 2023",
    url: "https://arxiv.org/abs/2311.03348",
    note: "Steers a model into a persona that is more willing to comply with harmful requests.",
  },
  {
    id: "lu", region: "persona", x: 1155, y: 438, anchor: "start",
    label: "The Assistant Axis", year: 2026,
    title: "The Assistant Axis: Situating and Stabilizing the Default Persona of Language Models",
    authors: "Lu, Gallagher, Michala, Fish & Lindsey", venue: "arXiv 2026",
    url: "https://arxiv.org/abs/2601.10387",
    note: "Finds a direction for the default assistant persona and tracks how models drift away from it.",
  },

  // ── The rock in the strait: the first crossing ───────
  {
    id: "choi", region: "crossing", x: 830, y: 330, anchor: "middle", labelDy: -52,
    label: "Latent Representations", label2: "of Users", year: 2025,
    title: "Scalably Extracting Latent Representations of Users",
    authors: "Choi, Huang, Schwettmann & Steinhardt", venue: "Transluce 2025",
    url: "https://transluce.org/user-modeling",
    note: "A LatentQA decoder, a copy of the model finetuned to answer questions about its activations, reads mostly demographic user attributes and can steer them. On real conversations it agrees with what the model reveals about the user more than with the users’ own survey answers.",
  },
];

// The bridge itself is the preprint.
window.MAP_BRIDGE = {
  label: "Belief Self-Distillation",
  title: "User Model Extraction via Belief Self-Distillation",
  authors: "Holmov, Huang, Bykov & Akata", venue: "arXiv 2026",
  url: "https://arxiv.org/abs/2609.31603",
  note: "A single linear bottleneck, trained on real conversations with the model as its own teacher, that can both read the user model and write it back.",
};
