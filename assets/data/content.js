/* Site content: the single source of truth for every word, number, date and link.
   Edit this object, then reload. */
window.JM_CONTENT = {
 "_rules": "Single source of truth for all text on the site. Do not add, round, or embellish any claim, metric, date or skill. If something is missing, leave it out.",
 "person": {
  "name": "Justin Mascarenhas",
  "email": "jmascarenhas1998@gmail.com",
  "linkedin": "https://www.linkedin.com/in/justinmascarenhas/",
  "github": "https://github.com/Jkdxbns",
  "location": "Dallas–Fort Worth, TX",
  "domain": "justinmascarenhas.com",
  "degree_line": "M.S. Computer Engineering, Rochester Institute of Technology (graduated May 2026)",
  "contact_intro": "Open to embedded firmware, robotics and edge AI roles: building systems where the model, the firmware and the arm work as one. Based in Dallas–Fort Worth, TX.",
  "photo": "/assets/img/me.webp",
  "contact_form": {
   "provider": "web3forms",
   "endpoint": "https://api.web3forms.com/submit",
   "access_key": "",
   "topics": [
    "Full-time role",
    "Contract",
    "Just saying hi"
   ]
  }
 },
 "about": "I am a computer engineer who works where models meet hardware: bare-metal firmware on Cortex-M, TensorRT and CUDA on NVIDIA Jetson, and robots that close the loop between the two. I finished my M.S. in Computer Engineering at RIT in May 2026.",
 "tracks": {
  "system": {
   "label": "System",
   "path": "/",
   "order": [
    "coffin",
    "stm32-temp",
    "cuda-vgg16",
    "qat-mnist",
    "ros-arm",
    "carla",
    "slm-compression",
    "turret",
    "asr",
    "frame-sim",
    "gpt2",
    "robocon"
   ],
   "resume_pdf": "/assets/resume/Justin_Mascarenhas_Resume_System.pdf",
   "headline": "I build robots end to end: the model that sees, the firmware that drives, the actuators that move.",
   "sub": "M.S. Computer Engineering, RIT. One system from my capstone, COFFIN: a model decides what to pick, firmware turns that into servo pulses, and the arm moves. Every panel is live: draw a digit, tune the firmware, steer the arm."
  },
  "embedded": {
   "label": "Embedded",
   "path": "/embedded/",
   "headline": "I build robots end to end: the model that sees, the firmware that drives, the actuators that move.",
   "sub": "Firmware focus: bare-metal C on Cortex-M, timers, interrupts and serial buses. You control the firmware: change joint speed and angle limits and watch the arm, its workspace and the servo pulses follow. The other panels run on their own.",
   "order": [
    "stm32-temp",
    "coffin",
    "turret",
    "robocon",
    "cuda-vgg16",
    "qat-mnist",
    "ros-arm",
    "carla",
    "slm-compression",
    "asr",
    "frame-sim",
    "gpt2"
   ],
   "resume_pdf": "/assets/resume/Justin_Mascarenhas_Resume_Embedded.pdf"
  },
  "robotics": {
   "label": "Robotics",
   "path": "/robotics/",
   "headline": "I build robots end to end: the model that sees, the firmware that drives, the actuators that move.",
   "sub": "Robotics focus: inverse kinematics, collision checks and pick planning. You control the arm: steer it, push it into the table, click a block to pick it. Perception and firmware run on their own.",
   "order": [
    "coffin",
    "ros-arm",
    "carla",
    "turret",
    "stm32-temp",
    "frame-sim",
    "asr",
    "cuda-vgg16",
    "qat-mnist",
    "slm-compression",
    "gpt2",
    "robocon"
   ],
   "resume_pdf": "/assets/resume/Justin_Mascarenhas_Resume_Robotics.pdf"
  },
  "edge-ai": {
   "label": "Edge AI",
   "path": "/edge-ai/",
   "headline": "I build robots end to end: the model that sees, the firmware that drives, the actuators that move.",
   "sub": "Edge AI focus: quantization, CUDA and TensorRT on Jetson. You control perception: draw a digit and my own INT8 network, running in your browser, tells the arm which block to pick.",
   "order": [
    "coffin",
    "cuda-vgg16",
    "qat-mnist",
    "slm-compression",
    "asr",
    "gpt2",
    "carla",
    "turret",
    "stm32-temp",
    "ros-arm",
    "frame-sim",
    "robocon"
   ],
   "resume_pdf": "/assets/resume/Justin_Mascarenhas_Resume_Edge_AI.pdf"
  }
 },
 "default_track": "system",
 "projects": [
  {
   "id": "coffin",
   "title": "COFFIN: Voice-Controlled Robotic Arm",
   "period": "M.S. Capstone · RIT · Apr 2026",
   "tags": [
    "robotics",
    "edge-ai",
    "firmware"
   ],
   "blurb": "Speak a command on a phone; a Jetson finds the object with TensorRT YOLO and an Arduino-driven arm picks it, closing the gripper on ToF sensing.",
   "spec": [
    [
     "YOLO latency, eager PyTorch",
     "56.7",
     "ms"
    ],
    [
     "YOLO latency, TensorRT",
     "10.9",
     "ms"
    ],
    [
     "Throughput",
     "17.6 → 92",
     "FPS"
    ],
    [
     "Pick success",
     "10/10",
     "trials"
    ],
    [
     "Voice to picked",
     "~11.5",
     "s"
    ]
   ],
   "bars": [
    {
     "title": "YOLO inference latency (lower is better)",
     "unit": "ms",
     "lower_is_better": true,
     "rows": [
      [
       "Eager PyTorch",
       56.7
      ],
      [
       "TensorRT",
       10.9
      ]
     ]
    },
    {
     "title": "YOLO throughput",
     "unit": "FPS",
     "lower_is_better": false,
     "rows": [
      [
       "Eager PyTorch",
       17.6
      ],
      [
       "TensorRT",
       92
      ]
     ]
    }
   ],
   "bullets": [
    "Built a voice-controlled, vision-guided robotic pick-and-place system over a three-layer distributed pipeline: Flutter mobile client, Flask-SocketIO edge server, and Jetson+Arduino controller linked by a unified WebSocket fabric.",
    "Integrated faster-whisper STT (1.0–1.4s), Gemini intent classification (<500ms), TensorRT-optimized YOLO (5.2× speedup: 56.7→10.9 ms, 17.6→92 FPS vs eager PyTorch) for visual servoing, and dual VL53L0X ToF sensors (camera range-gate + gripper-ToF-triggered close at 25 mm) for contact-aware grasping via TCA9548A I2C mux.",
    "Resolved 11 integration failures (false-positive detections, servo brown-out, stale-frame capture); achieved 100% pick reliability (10/10 trials) at ~11.5s end-to-end voice-to-picked latency.",
    "Built a LeRobot-structured data collection pipeline using multiprocessing for multi-camera frame capture.",
    "Implemented two-link IK on Arduino in C++; drove five servos with range-gated contact detection.",
    "Deployed the Jetson-side arm bridge as a systemd service (Type=simple, auto-restart with backoff, non-root user/group isolation, environment-file-based config) with static IP networking for reliable multi-device WebSocket registration; configured XRDP for remote desktop administration of the headless Jetson."
   ],
   "stack": [
    "faster-whisper",
    "Gemini",
    "YOLO",
    "TensorRT",
    "NVIDIA Jetson",
    "Arduino",
    "VL53L0X",
    "TCA9548A",
    "Flask-SocketIO",
    "Flutter",
    "systemd",
    "LeRobot"
   ],
   "github": "https://github.com/Jkdxbns/voice-controlled-robotic-arm",
   "note": "Live demo: the system board in the hero is built on this project (vision → firmware → arm)."
  },
  {
   "id": "stm32-temp",
   "title": "STM32 Bare-Metal Temperature Monitor",
   "period": "Cortex-M4 · embedded C",
   "tags": [
    "firmware"
   ],
   "blurb": "Register-level firmware: a timer triggers ADC scans of two sensors, an interrupt captures them, and a hand-written I2C driver updates an OLED.",
   "spec": [
    [
     "Flash",
     "3.68",
     "KB"
    ],
    [
     "RAM",
     "1.58",
     "KB"
    ],
    [
     "Update rate",
     "1",
     "Hz"
    ],
    [
     "Peripherals",
     "GPIO · TIM2 · ADC1 · I2C1",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Built a Cortex-M4 temperature monitoring firmware in embedded C with timer-synchronized sensing and real-time display.",
    "Implemented timer-triggered ADC scan conversions, interrupt-driven sample capture, and a low-level I2C driver.",
    "Programmed peripherals directly in bare-metal C (GPIO, TIM2, ADC1, I2C1); achieved 3.68 KB Flash / 1.58 KB RAM at deterministic 1 Hz update rate; verified in Proteus."
   ],
   "stack": [
    "Bare-metal C",
    "STM32",
    "TIM2",
    "ADC1",
    "I2C1",
    "Proteus"
   ],
   "github": "https://github.com/Jkdxbns/stm32-temperature-monitor-bare-metal"
  },
  {
   "id": "cuda-vgg16",
   "title": "CUDA Kernels for VGG16 Inference",
   "period": "CUDA C++",
   "tags": [
    "edge-ai",
    "hpc"
   ],
   "blurb": "Replaced VGG16's convolution layers with custom CUDA kernels using coalesced access, constant memory and preallocated buffers.",
   "spec": [
    [
     "CPU TorchScript",
     "77.5",
     "ms"
    ],
    [
     "Naive GPU kernel",
     "73.3",
     "ms"
    ],
    [
     "Coalesced GPU kernel",
     "49.2",
     "ms"
    ]
   ],
   "bars": [
    {
     "title": "Inference time (lower is better)",
     "unit": "ms",
     "lower_is_better": true,
     "rows": [
      [
       "CPU TorchScript",
       77.5
      ],
      [
       "Naive GPU",
       73.3
      ],
      [
       "Coalesced GPU",
       49.2
      ]
     ]
    }
   ],
   "bullets": [
    "Replaced TorchScript conv layers in VGG16 with custom CUDA C++ kernels using memory coalescing, constant memory for weights/biases, and preallocated global buffers to eliminate per-layer allocation overhead.",
    "Coalesced kernel ran at 49.2ms vs 73.3ms (uncoalesced) and 77.5ms (CPU TorchScript) — ~35% speedup over naive GPU with identical classification accuracy.",
    "Achieved 1.5–2× speedup in convolution operations through efficient global memory utilization."
   ],
   "stack": [
    "CUDA C++",
    "Memory coalescing",
    "Constant memory",
    "PyTorch",
    "TorchScript"
   ],
   "github": "https://github.com/Jkdxbns/VGG16-Memory-Optimization"
  },
  {
   "id": "slm-compression",
   "title": "SLM Compression for Edge Deployment",
   "period": "TinyLlama 1.1B · 8-bit",
   "tags": [
    "edge-ai",
    "ml"
   ],
   "blurb": "Quantized TinyLlama 1.1B to 8-bit and profiled VRAM and latency to see what an edge device would actually pay.",
   "spec": [
    [
     "GPU memory",
     "−55",
     "%"
    ],
    [
     "Accuracy change",
     "<1",
     "%"
    ],
    [
     "Perplexity change",
     "+0.09",
     ""
    ],
    [
     "Benchmarks",
     "HellaSwag · GSM8K · ARC",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Reduced GPU memory footprint by ~55% via 8-bit quantization (bitsandbytes LLM.int8()) on TinyLlama 1.1B; profiled peak VRAM and inference latency across prompt types using pynvml and psutil.",
    "Benchmarked across HellaSwag, GSM8K, and ARC; <1% accuracy degradation with +0.09 perplexity increase — near-lossless compression.",
    "Evaluated trade-offs between model efficiency and task performance for edge deployment constraints."
   ],
   "stack": [
    "PyTorch",
    "bitsandbytes",
    "Hugging Face",
    "pynvml",
    "psutil"
   ],
   "github": null
  },
  {
   "id": "qat-mnist",
   "title": "Quantization-Aware Training for Integer-Only Inference",
   "period": "May 2026",
   "tags": [
    "edge-ai",
    "ml"
   ],
   "blurb": "Trained a bias-free 256-64-10 MLP with INT8 weights and UINT8 activations so it survives integer-only inference.",
   "spec": [
    [
     "MNIST test accuracy",
     "97.43",
     "%"
    ],
    [
     "Weights",
     "17,024",
     "INT8"
    ],
    [
     "Weight memory",
     "16.6 vs 66.5",
     "KB (INT8 vs FP32)"
    ],
    [
     "Input",
     "16×16",
     "UINT8"
    ]
   ],
   "bars": [],
   "bullets": [
    "Implemented quantization-aware training (QAT) in PyTorch for a bias-free 256-64-10 MLP using straight-through-estimator fake quantization, INT8 per-layer symmetric weights, and UINT8 activations; integer-only inference reaches 97.43% on the 10,000-image MNIST test set at 16×16.",
    "Calibrated the hidden-activation scale with an EMA observer and froze it for the final 25% of training so weights adapt to the deployed scale."
   ],
   "stack": [
    "PyTorch",
    "QAT",
    "Straight-through estimator",
    "INT8",
    "EMA observer"
   ],
   "github": null,
   "note": "Live demo: the Perceive panel in the hero runs this trained network.",
   "claim_rule": "Claim only the training; never claim the hardware export, requantization constants or FPGA side. Internal rule, never render."
  },
  {
   "id": "asr",
   "title": "Whisper-Style ASR from Scratch",
   "period": "COFFIN speech stack",
   "tags": [
    "ml",
    "edge-ai"
   ],
   "blurb": "End-to-end speech recognition: mel-spectrogram encoder, causal Transformer decoder and a custom Cython-accelerated BPE tokenizer.",
   "spec": [
    [
     "Word error rate",
     "15",
     "%"
    ],
    [
     "Tokenizer speedup (Cython)",
     "4–5.5",
     "×"
    ],
    [
     "Training loss",
     "~0.51",
     ""
    ],
    [
     "Dataset",
     "NPTEL 2020 Indian-English",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Built an end-to-end ASR pipeline: 80-channel mel spectrogram encoder, 4-block causal Transformer decoder with cross-attention, trained on 1,000 Indian-English samples (NPTEL 2020) achieving training loss ~0.51.",
    "Designed a custom BPE tokenizer with a Cython-accelerated backend achieving 4–5.5× speedup over pure Python, processing 6M characters in 15 minutes.",
    "Achieved 15% WER on the NPTEL 2020 Indian-English dataset while reducing preprocessing latency via optimized tokenization."
   ],
   "stack": [
    "PyTorch",
    "Transformers",
    "Cython",
    "BPE",
    "Mel spectrograms"
   ],
   "github": "https://github.com/Jkdxbns/ASR"
  },
  {
   "id": "gpt2",
   "title": "GPT-2 Style Language Model from Scratch",
   "period": "PyTorch",
   "tags": [
    "ml",
    "edge-ai"
   ],
   "blurb": "A GPT-2 style Transformer written from scratch: attention, MLP blocks, weight tying, a TikToken wrapper and a custom training loop.",
   "spec": [
    [
     "Architecture",
     "decoder-only Transformer",
     ""
    ],
    [
     "Tokenizer",
     "TikToken",
     ""
    ],
    [
     "Evaluation",
     "perplexity, early stopping",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Implemented a GPT-2 style Transformer from scratch in PyTorch: multi-head self-attention, MLP blocks, residual connections, layer norm, and weight tying.",
    "Built a TikToken-based tokenizer wrapper and custom training loop with early stopping and perplexity evaluation.",
    "Trained on a small fantasy-themed text corpus; validated text generation and model understanding of Transformer architecture fundamentals."
   ],
   "stack": [
    "PyTorch",
    "TikToken",
    "Transformers"
   ],
   "github": "https://github.com/Jkdxbns/GPT2"
  },
  {
   "id": "ros-arm",
   "title": "ROS-Based Robotic Arm (AL5B & UR5e)",
   "period": "ROS 2 Humble · ROS Noetic",
   "tags": [
    "robotics"
   ],
   "blurb": "Hand-derived DH tables and forward kinematics for a 6-DoF UR5e and a 5-DoF AL5B, validated in MoveIt and run on the physical UR5e.",
   "spec": [
    [
     "AL5B repeatability",
     "<2",
     "mm"
    ],
    [
     "Trials",
     "10",
     ""
    ],
    [
     "Arms",
     "UR5e (6-DoF) · AL5B (5-DoF)",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Derived DH tables and hand-computed full forward kinematic chains (0T6) for a 6-DoF UR5e and a 5-DoF AL5B; validated against MoveIt and RViz URDF models in ROS 2 Humble and ROS Noetic.",
    "Planned and executed collision-free pick-and-place trajectories on physical UR5e via UR ROS 2 driver; AL5B repeatability measured at <2mm over 10 trials."
   ],
   "stack": [
    "ROS 2",
    "MoveIt",
    "RViz",
    "URDF",
    "DH parameters"
   ],
   "github": null
  },
  {
   "id": "carla",
   "title": "Autonomous Driving in CARLA",
   "period": "Perception · control",
   "tags": [
    "robotics",
    "ml"
   ],
   "blurb": "Auto-labelled training data from the simulator, trained detection and lane models, and drove laps in traffic with zero collisions.",
   "spec": [
    [
     "YOLO11n mAP50",
     "~0.85",
     ""
    ],
    [
     "Auto-labelled frames",
     "~5,000 + ~3,000",
     "YOLO + UFLD"
    ],
    [
     "Collisions",
     "0",
     "Town02"
    ]
   ],
   "bars": [],
   "bullets": [
    "Built automated data generation pipelines using CARLA's semantic segmentation and raycast occlusion filtering to produce ~5,000 YOLO and ~3,000 UFLD training frames with zero manual annotation.",
    "Trained YOLO11n (mAP50~0.85) and fine-tuned UFLD (ResNet-18) with SoftmaxFocalLoss + ParsingRelationLoss; integrated into an adaptive control stack with lane-following and waypoint fallback.",
    "Validated in Town02 with 30 vehicles and 10 pedestrians; achieved zero collisions and correct traffic light compliance across multiple laps."
   ],
   "stack": [
    "CARLA",
    "YOLO11n",
    "UFLD",
    "ResNet-18",
    "PyTorch"
   ],
   "github": "https://github.com/Jkdxbns/autonomous-driving-carla"
  },
  {
   "id": "turret",
   "title": "Object Tracking Turret",
   "period": "Jetson + STM32",
   "tags": [
    "firmware",
    "robotics",
    "edge-ai"
   ],
   "blurb": "YOLOv8 on a Jetson tracks an object and sends commands over UART to STM32 firmware driving the servos under FreeRTOS.",
   "spec": [
    [
     "Link",
     "UART",
     ""
    ],
    [
     "Scheduler",
     "FreeRTOS + mutexes",
     ""
    ],
    [
     "Range sensor",
     "VL53L0X ToF",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Used YOLOv8 on NVIDIA Jetson to detect and track objects, sending control commands to STM32 over UART.",
    "Implemented multi-servo PWM control with interrupt-driven UART commands and user override.",
    "Used FreeRTOS with mutexes for shared-memory task coordination; integrated VL53L0X ToF sensing and OLED distance visualization."
   ],
   "stack": [
    "YOLOv8",
    "NVIDIA Jetson",
    "STM32",
    "FreeRTOS",
    "PWM",
    "VL53L0X",
    "OLED"
   ],
   "github": null
  },
  {
   "id": "robocon",
   "title": "Robocon Robot: Holonomic Drive & Odometry",
   "period": "Arduino Due · 2022–2024",
   "tags": [
    "firmware",
    "robotics"
   ],
   "blurb": "Closed-loop heading correction for a four-wheel holonomic robot from quadrature-encoder odometry decoded in interrupts.",
   "spec": [
    [
     "Encoder resolution",
     "2400",
     "CPR"
    ],
    [
     "Motor PWM",
     "15",
     "kHz"
    ],
    [
     "Stage 1 score",
     "99/100",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Built closed-loop heading correction for a 4-wheel holonomic robot on Arduino Due: derived actual heading from dual-axis quadrature encoder odometry (2400 CPR, 2.9 cm wheels) and fed angular error back into rotation PWM, holding course during translation.",
    "Implemented interrupt-driven quadrature decoding from first principles — a 4-bit A/B transition state machine on hardware interrupts — and drove four motor channels at 15 kHz PWM via DuePWM.",
    "Derived angle-weighted joystick-to-wheel mixing from atan2 to eliminate PWM saturation at 45° diagonals, where naive vector summation clipped at 2x full scale.",
    "Integrated Xbox 360 control over USB Host Shield with 4x Cytron motor drivers, dual claw subsystems with per-claw IR sensing, and a catapult thrower; added a fail-safe state machine halting all motors on controller disconnect.",
    "Led the coding team to Stage 3 of DD Robocon 2023, scoring 99/100 in Stage 1; owned wiring, interfacing, and integration across mechanical and design teams."
   ],
   "stack": [
    "Arduino Due",
    "Quadrature encoders",
    "Interrupts",
    "PWM",
    "Odometry"
   ],
   "github": null,
   "note": "Never place this project first in any list."
  },
  {
   "id": "frame-sim",
   "title": "Frame Simulator: 3D Coordinate-Frame Visualizer",
   "period": "Oct 2025",
   "tags": [
    "robotics",
    "tools"
   ],
   "blurb": "A desktop tool for seeing SE(3) frame hierarchies: a small DSL, a transform engine and a live OpenGL viewport.",
   "spec": [
    [
     "Math",
     "SE(3) composition",
     ""
    ],
    [
     "UI",
     "PySide6 + VisPy",
     ""
    ]
   ],
   "bars": [],
   "bullets": [
    "Built a PySide6/Qt desktop GUI with an OpenGL-backed VisPy 3D viewport to visualize coordinate-frame hierarchies, parent-child transform chains, and SE(3) poses in real time.",
    "Wrote a custom DSL parser and SE(3) math engine (math_se3.py) supporting local/world rotation and translation composition, recursive world-transform chaining, and live 4x4 matrix inspection per frame.",
    "Decoupled data model, math, visuals, and UI into separate modules (frames_model.py, dsl_parser.py, frame_visual.py, ui_main_window.py) with a mix-in pattern centralizing transform-apply, matrix-refresh, and animation logic."
   ],
   "stack": [
    "Python",
    "PySide6",
    "VisPy",
    "OpenGL"
   ],
   "github": "https://github.com/Jkdxbns/Frame-Simulator"
  }
 ],
 "in_progress": [
  {
   "id": "telemetry-gateway",
   "title": "Edge Telemetry Gateway",
   "status": "In progress",
   "tags": [
    "firmware"
   ],
   "blurb": "An IMU on a BeagleBone Black, read through my own C kernel driver, streamed by a C++ epoll gateway over TCP/IP on the LAN to a Jetson (Ethernet) and a laptop (Wi-Fi). Multi-arch Docker images and GitHub Actions CI/CD.",
   "stack": [
    "C (kernel driver)",
    "C++",
    "epoll",
    "TCP/IP",
    "Docker",
    "GitHub Actions",
    "BeagleBone Black",
    "MPU6050"
   ],
   "github": "https://github.com/Jkdxbns/telemetry-gateway",
   "wording_rules": "Say 'in progress'. No metrics. Never name a C++ standard version. Say 'streamed over TCP/IP on the LAN, Ethernet + Wi-Fi'; never 'broadcast', 'Internet' or 'Ethernet driver'."
  }
 ],
 "archive": [
  {
   "id": "serial-data-plotter",
   "title": "Serial Data Plotter",
   "blurb": "PyQt5 desktop app: device discovery, multi-threaded serial capture, CSV logging and per-tab live Matplotlib plots, with oscilloscope integration.",
   "github": "https://github.com/Jkdxbns/Serial-Data-Plotter"
  },
  {
   "id": "mpi-neuron",
   "title": "MPI Hodgkin-Huxley Neuron Simulation",
   "blurb": "Distributed dendrite computation across MPI workers on a SLURM cluster, with scaling and load-imbalance analysis.",
   "github": null
  },
  {
   "id": "mpi-raytracer",
   "title": "Parallel Ray Tracer with MPI Scheduling",
   "blurb": "Four MPI work-distribution strategies (static strip, block and cyclic, plus a dynamic task queue) for a 5000×5000 render, benchmarked against each other.",
   "github": null
  },
  {
   "id": "2fa-lock",
   "title": "Fingerprint + SMS OTP Two-Factor Lock",
   "blurb": "An Arduino matches a fingerprint, then a Python host texts a one-time password that the user types on a keypad. Unknown fingers and wrong codes trigger SMS alerts, and repeated failures lock the system.",
   "github": "https://github.com/Jkdxbns/2FA_smart_briefcase"
  }
 ],
 "experience": [
  {
   "title": "Research Fellowship",
   "company": "Teesside University",
   "location": "Middlesbrough, United Kingdom",
   "dates": "Jun 2023 – Jul 2023",
   "bullets": [
    "Engineered a custom data pipeline for the BraTS 2020 multi-modal MRI dataset with medical imaging augmentation and batch-loading memory management for large-scale 3D volumetric inputs.",
    "Trained U-Net segmentation with VGG-16, VGG-19, and ResNet-50 backbones; evaluated on Dice Score and IoU; reported accuracy-latency trade-offs for deployment.",
    "Led a cross-cultural team of 7 as the sole ML-experienced student; took over as team lead mid-project to restructure task distribution and deliver the full pipeline within the 6-week window."
   ]
  },
  {
   "title": "Research Intern (Capstone)",
   "company": "Bhabha Atomic Research Centre (BARC)",
   "location": "Mumbai, India",
   "dates": "Jul 2023 – Apr 2024",
   "bullets": [
    "Developed a custom image-stitching pipeline for high-resolution generation using bit manipulation and averaging, achieving a PSNR of 65 compared to homography-based stitching baseline.",
    "Designed a custom wavelet bank (alpha-blended sym6+bior3.5) to suppress low-frequency noise; combined with optimized homography stitching and concurrency to achieve a PSNR of 86.",
    "Deployed ZoeDepth monocular depth estimation for crack-depth profiling with ±8% error on 3D surface reconstruction.",
    "Architected a full metal surface inspection pipeline for microscopic crack analysis using custom image stitching, wavelet denoising, and depth estimation."
   ]
  },
  {
   "title": "Embedded Systems Intern",
   "company": "Planctech Innovations",
   "location": "Mumbai, India",
   "dates": "Jul 2022 – Nov 2022",
   "bullets": [
    "Architected a Mixed Reality headset concept using AI-based real-time chroma keying without a green screen; produced full claims documentation and BOM.",
    "Developed a wearable gesture-recognition glove for hands-free cursor control integrating ADXL345 accelerometers with Raspberry Pi and HC-05 Bluetooth to translate 3-DoF hand motion into HID commands via Python.",
    "Implemented a custom tap-detection algorithm using z-axis differential thresholding; resolved sensor jitter through software calibration and resolution tuning."
   ]
  },
  {
   "title": "AI/ML Intern",
   "company": "Indian Institute of Technology Bombay",
   "location": "Mumbai, India",
   "dates": "Jan 2024 – Mar 2024",
   "bullets": [
    "Fine-tuned DONUT (OCR-free visual document understanding transformer) on a custom medical billing dataset for structured field extraction.",
    "Built preprocessing and training pipelines in PyTorch using HuggingFace VisionEncoderDecoder API; added domain-specific special tokens and resized decoder embedding layer accordingly.",
    "Improved validation accuracy from 55% to 93% via improved preprocessing and model tuning."
   ]
  },
  {
   "title": "Deep Learning Intern",
   "company": "Tusk",
   "location": "Mumbai, India",
   "dates": "Dec 2023 – Feb 2024",
   "bullets": [
    "Curated and annotated a custom toothbrush detection dataset for health-level classification using YOLOv8.",
    "Trained YOLOv8n on 1,133 annotated images achieving 83% mAP@50 on held-out validation; exported to ONNX and TFLite for mobile deployment."
   ]
  },
  {
   "title": "Python Developer Intern",
   "company": "Bhabha Atomic Research Centre (BARC)",
   "location": "Mumbai, India",
   "dates": "Jan 2023 – May 2023",
   "bullets": [
    "Developed a Python GUI using PyQt and Matplotlib for real-time data acquisition and experimental visualization in a laboratory environment.",
    "Used GitLab for version control and JupyterHub for collaborative data analysis and technical documentation."
   ]
  },
  {
   "title": "General Secretary",
   "company": "Agnel Robotics Club (ARC), F.C.R.I.T.",
   "location": "Mumbai, India",
   "dates": "Jul 2023 – May 2024",
   "bullets": [
    "Led a 25-member robotics team across national-level competitions, owning mechanical design, PCB fabrication, and AI/ML integration end-to-end.",
    "Organized 10+ exhibitions and technical workshops covering Arduino, PCB design, and SolidWorks.",
    "Designed and fabricated custom single-layer PCBs in EAGLE for locomotive robots; implemented sensor communication over UART and I2C with closed-loop feedback.",
    "Built ball detection by training a YOLOv3 model from scratch on webcam video, then used color masks on the detections to generate and transmit motor commands for closed-loop visual servoing of the competition robot.",
    "Guided the coding team in training object detection models for competition robots; authored and taught a Python course (syllabus, syntax booklet, coursework) for club member onboarding."
   ],
   "placement_rule": "Student club leadership: list it last, under a 'Leadership' label."
  }
 ],
 "education": [
  {
   "degree": "M.S., Computer Engineering",
   "school": "Rochester Institute of Technology",
   "location": "Rochester, NY",
   "dates": "Aug 2024 – May 2026",
   "gpa": "3.3/4.0",
   "courses": [
    "High Performance Architecture",
    "Machine Intelligence",
    "Deep Learning",
    "Robot Perception",
    "Multiple Processor Systems",
    "Principles of Robotics"
   ]
  },
  {
   "degree": "B.E., Electronics & Telecommunication",
   "school": "University of Mumbai (F.C.R.I.T.)",
   "location": "Mumbai, India",
   "dates": "2020 – 2024",
   "gpa": "7.9/10.0",
   "courses": [
    "Digital Signal Processing",
    "Artificial Neural Networks & Fuzzy Logic",
    "Image Processing",
    "Random Signal Analysis",
    "Digital Electronics"
   ]
  }
 ],
 "awards": [
  "1st Prize, Poster Presentation — 2D and 3D Image Mosaicing of Microscopic Images, F.C.R.I.T. (2024)",
  "1st Prize, CanSat Workshop — Arduino Nano atmospheric data collection during free fall (2023)",
  "Ranked 10th, Robocon — National-level robotics competition among 45 universities (2022)"
 ],
 "skills": {
  "Languages & Systems": [
   "Python",
   "C/C++",
   "CUDA",
   "Cython",
   "ROS2",
   "Bash"
  ],
  "ML / Deep Learning": [
   "PyTorch",
   "NumPy",
   "Pandas",
   "scikit-learn",
   "TensorFlow",
   "Keras",
   "Hugging Face Transformers",
   "TensorRT",
   "Quantization (8-bit)",
   "pynvml Profiling",
   "Model evaluation"
  ],
  "Edge AI / CV / Speech": [
   "OpenCV",
   "YOLO",
   "TensorRT",
   "faster-whisper",
   "ASR pipelines",
   "Tokenization"
  ],
  "Robotics & Perception": [
   "ROS/ROS2",
   "MoveIt",
   "RViz",
   "YOLO",
   "Visual servoing",
   "Forward kinematics",
   "DH parameters",
   "Odometry (Dead Reckoning)"
  ],
  "Embedded": [
   "STM32 (Bare-Metal C)",
   "FreeRTOS",
   "NVIDIA Jetson",
   "Raspberry Pi",
   "Arduino",
   "UART/I2C/SPI",
   "ADC/DAC",
   "Bluetooth (BLE/Classic)",
   "EAGLE PCB Design",
   "Quadrature Encoders",
   "PWM Motor Control",
   "BLDC Motors",
   "Stepper Motors",
   "Closed-Loop Feedback Control"
  ],
  "HPC / Parallel": [
   "CUDA C++",
   "MPI",
   "SLURM",
   "Memory coalescing",
   "Kernel optimization"
  ],
  "Tools": [
   "Linux",
   "Git",
   "Flask",
   "CMake",
   "SolidWorks",
   "Proteus",
   "Oscilloscopes",
   "Logic Analyzers",
   "Multimeters",
   "Spectrum Analyzers"
  ],
  "Linux Administration": [
   "systemd service management (unit files, auto-restart, non-root isolation)",
   "Static IP / network configuration",
   "XRDP remote desktop administration",
   "Environment-based secrets/config separation"
  ]
 },
 "filters": [
  "Firmware",
  "Edge AI",
  "Robotics",
  "ML"
 ],
 "filter_tag_map": {
  "Firmware": "firmware",
  "Edge AI": "edge-ai",
  "Robotics": "robotics",
  "ML": "ml"
 },
 "filter_order": {
  "firmware": [
   "stm32-temp",
   "turret",
   "coffin"
  ],
  "edge-ai": [
   "cuda-vgg16",
   "slm-compression",
   "coffin",
   "turret",
   "qat-mnist",
   "asr",
   "gpt2"
  ]
 },
 "images": {
  "ready": [
   "coffin",
   "stm32-temp",
   "cuda-vgg16",
   "slm-compression",
   "qat-mnist",
   "asr",
   "gpt2",
   "ros-arm",
   "carla",
   "turret",
   "robocon",
   "frame-sim",
   "telemetry-gateway",
   "serial-data-plotter",
   "mpi-neuron",
   "mpi-raytracer"
  ],
  "pending": [],
  "path": "/assets/img/projects/<id>.webp",
  "og": "/assets/img/og-image.png",
  "videos": {
   "cuda-vgg16": "/assets/video/cuda-vgg16.mp4"
  }
 },
 "hero_hint": "A very simple browser model of COFFIN, my capstone project merged with QAT trained model and controllable arm-joint speed and constraints. Draw a digit and my QAT model will infer it then the arm will locate the box with your labelled digit and pick and drop it. Feel free to manually click any box to instruct the arm to pick or move your mouse to control the arm. Be careful or you might just crash the arm.",
 "hero_hint_actions": [
  "Draw a digit",
  "click any box",
  "move your mouse"
 ],
 "about_site": "The home page runs a live browser model of COFFIN, my M.S. capstone arm. Draw a digit and my QAT-trained INT8 network tells the arm which block to pick; tune the firmware or steer the arm yourself.",
 "featured": [
  "coffin",
  "stm32-temp",
  "qat-mnist",
  "turret",
  "cuda-vgg16",
  "slm-compression"
 ]
};
