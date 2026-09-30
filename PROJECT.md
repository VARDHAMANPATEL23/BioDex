# 🧬 BioDex Engineering Manifest

> **Biological Intelligence Pipeline · Spectral Species Engine**
> **Team of 3:** Neel, Vardhman, Soham | CGPIT, Uka Tarsadia University

---

## 📌 Project Restructuring & Current State (Revised Pivot)

Originally conceptually pitched as a standard Mobile React Native Application deploying a basic frozen Convolutional Neural Network (EfficientNet/ResNet), the BioDex project architecture underwent a **massive strategic pivot**.

Instead of constraining the identification logic to narrow, hardcoded 50-class static `.h5` files, the pipeline was upgraded to utilize **State-Of-The-Art Multimodal Vision-Language Models (VLMs)** running on accelerated GPU cloud engines, interfaced securely via a newly constructed FastAPI architecture. The front-end mobile boundaries were scrapped in favor of a vastly superior **Next.js WebGL glassmorphic interface**.

### 💡 Core Pivot Advantages:
1. **Zero-Shot Scale:** By using the PaliGemma-3B API via NVIDIA NIM, BioDex identifies virtually *any* known organic matter, obliterating the previous 40-50 class constraints.
2. **WebGL Integration:** A browser-native environment allowed the deployment of robust Three.js canvas manipulations, yielding our responsive 3D procedural DNA helix visualizations based on genome telemetry configurations.
3. **Database Modernization:** Moved away from rigid local SQLite configurations, fully adopting **MongoDB Atlas** with PyJWT-based encryption security, allowing researchers to have seamless, cloud-persistent telemetry history logs.

---

## 🏗️ Technical Architecture Details

### Backend Logic Map (`/backend`)
- **Gateway Framework:** FastAPI serves as our ultra-low latency routing plane.
- **`paligemma_service.py`:** Handles image processing logic. Strips the incoming binary/URL data and mounts requests against the NIM endpoint requesting morphology taxonomy mapping. Contains robust string-parsing syntax to repair disjointed API responses.
- **`biology_engine.py`:** Parses raw NLP classifications and synthesizes a full phylogenetic taxonomic structure (Kingdom, Phylum, Class, Order, Family, Genus) leveraging systemic heuristics.
- **`history_routes.py` & `auth_routes.py`:** Utilizes `pymongo` and `passlib.bcrypt` to enforce B-Crypt hash salting upon researcher authentication and securely mapping JSON-based histories mapped via active JWT session dependencies.

### Frontend Rendering Module (`/frontend`)
- **React App Router Strategy:** All rendering operates on the Next.js framework allowing React Server/Client delineation natively.
- **`lib/themeDetector.ts`:** Inspects taxonomic payloads provided by the backend to identify whether the scanned entity is an Insect, Arachnid, Avian, Flora, or Fauna, overriding centralized CSS `--theme-primary` variables.
- **`components/BackgroundParticles.tsx`:** Floating Framer Motion components rendering SVG biological molecules intersecting smoothly under completely customized `backdrop-blur-2xl` transparent glass widgets.
- **`components/DNAHelix3D.tsx`:** An encapsulated Three.js canvas utilizing coordinate mathematics (`y = (t-0.5)*height, angle = t*PI*2 * Twist`) to render dual-axis chromosomal rings matching the taxonomic class. Hook handlers listen for both Mouse and Mobile-Touch to orbit the model seamlessly.

---

## ✅ Delivery Accomplishments
- [x] Integrate PaliGemma Vision model successfully instead of CNN deployments.
- [x] Configure biology heuristic engine for parsing visual tags to Linnaean logic.
- [x] Bind PyJWT MongoDB authentication flows to allow guest/active user separation.
- [x] Craft ultra-modern, interactive Glassmorphism CSS layers (`bg-[#121216]/40 backdrop-blur-2xl`).
- [x] Develop fully fluid CSS parameters binding flawlessly to Mobile Docks and Desktop Navigation forms.
- [x] Procedural background generative effects matching ecosystem identity.
- [x] Vector SVG Icon Branding implementation matching Next metadata constraints.
- [x] Resolve TUI curses overlapping overlapping bounds securely handling wide-eastern characters inside terminal testing loggers safely.

## 🔮 Future Scalability Path
- Integration with Genomic Sequencing APIs to fetch actual verified physical chromosomal strand length variants.
- Real-time video buffering integration allowing the engine to scan active frame drops from environmental cameras against the Vision-Language Model.
- Native Desktop wrapper via Tauri or Electron.

---
*End of Documentation.*
