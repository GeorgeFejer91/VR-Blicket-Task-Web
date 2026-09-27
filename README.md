# Blicket Task PC game

Play the [3D browser game](https://georgefejer91.github.io/VR-Blicket-Task-Web/). One bucket carries three colliding gray objects onto the table. Put each on the detector, observe its result, then make your choices. All task objects share the same matte gray material. Session data stays local until you choose to download JSON.

Built with HTML, CSS, JavaScript, and locally bundled Three.js. Serve locally with `python -m http.server 8878 --bind 127.0.0.1`, then open `http://127.0.0.1:8878/`. Run collision checks with `node --test tests/bucket-physics.test.mjs`.

Start development at [For-AI/README.md](For-AI/README.md). This public repository contains browser code, tests, current agent guidance, and the [German terminology and shapes research brief](docs/research/german-blicket-terminology-and-shapes.md). Private correspondence and source archives are excluded. The game remains English and is not a validated research instrument; shape and order still need counterbalancing for experimental use.
