# German Blicket terminology and stimulus shapes

Research date: 2026-09-27. Sources: Consensus MCP paper discovery and fetched records, followed by primary articles and German academic texts on the web. This is an adaptation brief, not a claim of instrument validation.

## German category word

Provisional recommendation: retain **Blicket**, with **ein Blicket**, **kein Blicket**, and plural **Blickets**, using one consistent pronunciation and grammatical form in the script. A Blicket is an invented causal category, not the name of a particular geometric shape. I did not find a standardized, empirically validated German detector-task replacement or a published German normative test during this search. That is a search limitation, not proof that none exists.

An indexed German dissertation excerpt uses *Blicket*, *Blicket-Maschine*, and *Blicket-Detektor* ([causal-knowledge section](https://d-nb.info/1180032985/34)); direct retrieval was rate-limited, so this is terminology context only. Schmid et al. (2024) used the novel label *blicket* with monolingual German children ([primary paper, read in full](https://www.psych.uni-goettingen.de/de/development/pdfs/schmid_bleijlevens_mani_behne_2024-the-cognitive-underpinnings-and-early-development-of-childrens-selective-trust.pdf/), Materials, Study 1). Their selective-trust/word-learning task supports linguistic feasibility; it is not a German Blicket-detector validation.

Three documented label precedents, ordered by fit for this project:

| Label | Evidence | Implication for German adaptation |
| --- | --- | --- |
| **Blicket** | Original detector paradigm; German academic usage and German-speaking word-learning sample | Best-supported starting point; pilot comprehension and unintended associations |
| **Flipo** | Wente et al. replaced Blicket with a Spanish-compatible invented word in Peru | Plausible candidate to pilot if a new word is needed, not an established German translation |
| **Fonkel** | Beckers et al. (2009) called the Dutch task a *fonkel machine* and the category *fonkels* | Dutch precedent, not German; resemblance to German *funkeln* may suggest light and deserves screening |

Sources for alternatives: [Wente primary manuscript, Procedure and Translation](https://www.pure.ed.ac.uk/ws/portalfiles/portal/39857102/Wente_et_al_2017_1.pdf); [Beckers paper, author-uploaded full text](https://www.researchgate.net/publication/24177628_Three-Year-Olds%27_Retrospective_Revaluation_in_the_Blicket_Detector_Task), [university bibliographic record](https://biblio.ugent.be/publication/684313). *Dax* and *wug* also occur as labels in pretests; they should not be mistaken for a documented German replacement of the causal category ([Sobel et al., pretest](https://www.alisongopnik.com/Papers_Alison/backwards_blocking.pdf)).

Prefer an unfamiliar, pronounceable pseudoword over an ordinary word such as *Magnet*, *Zauberstein*, or *Leuchtstein*, which could suggest a mechanism. This is a design recommendation. Retaining Blicket also needs screening: its similarity to *Blick/blicken* may carry associations for some German speakers. None of the candidates is guaranteed bias-free.

## Proposed German wording

These are newly drafted instructions, not quotations from a validated German protocol. Substitute the chosen category word consistently after piloting.

- Introduction: “Hier sind verschiedene Objekte und eine Maschine. Manche dieser Objekte sind Blickets, andere sind keine Blickets. Wir wollen herausfinden, welche Objekte Blickets sind.”
- Test action: “Lege dieses Objekt auf die Maschine und beobachte, was passiert.”
- Judgment: “Glaubst du, dass dieses Objekt ein Blicket oder kein Blicket ist?”
- Intervention for designs allowing combinations: “Was würdest du tun, damit die Maschine angeht?”

The last question avoids imposing a singular answer. For an AND/OR protocol, do not teach that every Blicket necessarily activates the detector alone, and allow selecting combinations. For this existing one-cause demo, a single-object final choice is coherent but does not test conjunction learning. Use *Objekt* for adult instructions or pilot *Teil* with children; neutral reference words are not replacements for the category label.

Before experimental use, have German-speaking researchers review and independently back-translate the full script, then pilot understanding with the target age group. Preserve explanation, feedback, question order, noun/adjective usage, and number cues across conditions. Wente's translation methods illustrate why singular/plural wording can change a task ([Translation section](https://www.pure.ed.ac.uk/ws/portalfiles/portal/39857102/Wente_et_al_2017_1.pdf)).

## Typical shapes and materials

There is no universal canonical shape set; stimulus choice depends on the causal contrast.

| Study | Documented stimuli | Relevance |
| --- | --- | --- |
| Sobel, Tenenbaum & Gopnik (2004) | Sixteen wooden blocks differing in shape and color; a separate base-rate experiment used 18 blue wooden cylinders | Mixed geometric blocks are common, but uniform appearance is also used for specific questions |
| Lucas, Bridgers, Griffiths & Gopnik (2014) | Three differently shaped gray ceramic objects; participants named shapes, e.g. triangle. Other sets varied by color; object identities and set order were counterbalanced | Direct precedent for gray shapes; the current demo is not a replication of their full design |
| Wente et al. (2017 online; 2019 journal issue) | Fifteen similarly sized 3D clay shapes painted gray, around three inches; examples included square, circle, star | Especially close precedent for removing color variation |

Primary sources: [Sobel et al., Materials in Experiments 1 and 3](https://www.alisongopnik.com/Papers_Alison/backwards_blocking.pdf); [Lucas et al., Methods 2.2.1](https://cocosci.princeton.edu/papers/WhenChildrenAreBetter.pdf); [Wente et al., Materials](https://www.pure.ed.ac.uk/ws/portalfiles/portal/39857102/Wente_et_al_2017_1.pdf).

Keep this game's cube, cylinder, and rectangular block for the present loop; use one matte neutral gray material without colored marks, textures, or different gloss. Future study sets can use distinctive silhouettes such as triangular and star-shaped solids, with comparable scale and viewing conditions. That proposed asset selection is an implementation recommendation, not a claim that these exact meshes are standardized.

Uniform gray removes one intended stimulus variable. It does not eliminate shape preferences, size/surface differences, shading, position, trial order, or color signals on the detector/answer pads. The current meshes differ in dimensions and the cube always activates. A full validation should preregister balanced mappings of shape to causal role, stimulus and response positions, and evidence order where the selected protocol permits it; log the realized assignment. Standardize material, lighting, camera, manipulation, and feedback across conditions. Add a comprehension check that does not reveal test identities.

## Current implementation and validation boundary

`scenario.json` now uses matte `#808080` for every object, neutral labels and IDs, and scenario ID `v1_gray_object_types`. The runtime already uses the same object-material roughness. The fixed cause and English interface are unchanged. Older colored sessions have a different scenario ID and color-coded object IDs; analyze stimulus versions explicitly.

Gray stimuli, successful software tests, and publication do not establish reliability, construct validity, or German/English measurement equivalence. Select the target protocol and age group, preregister sampling/exclusions/outcomes and an appropriate power analysis, pilot translated comprehension and interaction demands, then compare the digital task with the intended reference task and evaluate the relevant causal-inference pattern. A three-trial deterministic demonstration alone does not validate broader Blicket mechanisms.

## Evidence ledger

All sources below were checked on 2026-09-27. Metadata publication dates are separated from web crawl dates.

| Claim | Primary source / year | Confidence and limit |
| --- | --- | --- |
| Novel causal category can conflict with visible appearance | [Gopnik & Sobel, 2000](https://doi.org/10.1111/1467-8624.00224) | High for original paradigm; not German validation |
| Blicket label used with German speakers | [Schmid et al., 2024](https://doi.org/10.1111/cdev.14073) | High for word-learning usage; indirect for detector task |
| Gray objects and identity/order counterbalancing | [Lucas et al., 2014](https://doi.org/10.1016/j.cognition.2013.12.010) | High, directly described in methods |
| Gray clay shapes, Flipo, translation care | [Wente et al., online 2017 / issue 2019](https://doi.org/10.1111/cdev.12943) | High for Spanish adaptation; not German |
| Shape/color-varied wood and uniform cylinders | [Sobel et al., 2004](https://doi.org/10.1207/s15516709cog2803_1) | High; distinct experimental purposes |
| Fonkel label | [Beckers et al., 2009](https://doi.org/10.1027/1618-3169.56.1.27) | High for Dutch script; not German |
| Standard German replacement or validated instrument | Targeted English/German searches in Consensus and web | Not found; evidence insufficient, not a negative existence claim |

Search refinement: broad Blicket/German/material searches, then exact German terms, German-speaking samples, Flipo/Fonkel and source-specific method checks. General word-learning, finance/DAX, author-surname “German,” and unsourced summary hits were excluded from detector-validation claims. Follow-up evidence needed: a specific German lab's full detector script, target-population comprehension results, and empirical equivalence data.

Consensus records fetched before citation:

1. [Gopnik & Sobel (2000)](https://consensus.app/papers/detecting-blickets-how-young-children-use-information-gopnik-sobel/3cb759eb747456218a7874d810ce4556/?utm_source=chatgpt).
2. [Lucas et al. (2014)](https://consensus.app/papers/when-children-are-better-or-at-least-more-openminded-lucas-bridgers/fe0e849170f05fdba528e91a9e7f07fc/?utm_source=chatgpt).
3. [Wente et al. (2019 issue)](https://consensus.app/papers/causal-learning-across-culture-and-socioeconomic-status-wente-kimura/d8e5975de96650c9bea5c20f0b9f9478/?utm_source=chatgpt).
