# Blicket Task PC game

Play the [3D browser game](https://georgefejer91.github.io/VR-Blicket-Task-Web/). Choose English or German, then test three colliding gray objects on the detector. Answer with on-screen quiz buttons. All task objects share the same matte gray material. The complete session JSON downloads automatically after the last answer; no session data is uploaded.

The machine's dark body and red platform follow [original university video references](For-AI/machine-references.md). Its platform sinks into a well, a cyan ray scans the partly submerged object, and the larger BLICKET sign and side lamps light up with the result. Bucket and object handling have sound effects, with a tune for activation. Narration uses local English and German MP3 assets; the [audio inventory and voice credit](audio/README.md) list every cue and trigger. Sound on/off controls voice and effects. After each result, Next moves the tested object onto the adjacent table. All three objects stay visible through the final questions and completion.

Built with HTML, CSS, JavaScript, and locally bundled Three.js. Serve locally with `python -m http.server 8878 --bind 127.0.0.1`, then open `http://127.0.0.1:8878/`. Run collision and full session checks with `node --test tests/*.test.mjs`.

Start development at [For-AI/README.md](For-AI/README.md). This public repository contains browser code, tests, current agent guidance, and the [German terminology and shapes research brief](docs/research/german-blicket-terminology-and-shapes.md). Private correspondence and source archives are excluded. This is not a validated research instrument; German comprehension, shape and order still need evaluation for experimental use.
