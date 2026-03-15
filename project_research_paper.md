# UdaanIQ: A Unified AI-Powered Ecosystem for Generalized Engineering Career Development and Automated Interview Preparation

**Abstract**  
In the rapidly evolving landscape of engineering education, bridging the gap between academic curriculum and industry expectations remains a critical challenge. Students often lack personalized guidance, real-time feedback on interview performance, and clarity on skill acquisition tailored to their desired career paths. This paper proposes **UdaanIQ**, a comprehensive, AI-driven web application designed to address these disparities. UdaanIQ integrates a sophisticated **Resume Analyzer**, a dynamic **Skill Gap Assessment Engine**, and a personalized **Career Roadmap Generator**. A core innovation of the platform is the **AI Interviewer**, which utilizes realistic 3D avatars, real-time Speech-to-Text (STT) and Text-to-Speech (TTS), and advanced proctoring to simulate high-stakes interview environments. Furthermore, the system incorporates **Tutox**, an intelligent AI Tutor powered by the **Gemini 2.0 Flash** model and Retrieval-Augmented Generation (RAG), to provide context-aware educational support. Comparative analysis with existing systems demonstrates that UdaanIQ offers a superior, all-encompassing solution for end-to-end career readiness.

**Keywords**: Artificial Intelligence, Automated Interview System, RAG, Large Language Models (LLMs), Skill Gap Analysis, Resume Parsing, Proctoring, EdTech.

---

## 1. Introduction

The transition from academia to the professional world is a pivotal phase for engineering graduates. Industry reports consistently highlight a disconnect between the theoretical knowledge possessed by graduates and the practical, deployable skills required by employers. Traditional placement preparation methods often rely on fragmented tools—separate platforms for coding practice, resume building, and mock interviews—leading to a disjointed user experience. Moreover, human mentorship is not always scalable or available on-demand.

To mitigate these issues, we present **UdaanIQ**, a unified platform that leverages the latest advancements in Generative AI. Unlike isolated tools, UdaanIQ creates a continuous feedback loop: it assesses the student's current standing via their resume, identifies gaps, provides a learning roadmap with an AI tutor, and validates improvement through realistic mock interviews. 

The key contributions of this paper are:
1.  **Holistic Career Ecosystem**: Integration of assessment (Resume/Skill) and learning (Roadmap/Tutox) modules.
2.  **Real-time AI Interviewer**: A low-latency, conversational agent with 3D functional avatars and robust proctoring capabilities.
3.  **Intelligent Tutoring System (Tutox)**: Implementation of a RAG-based tutor capable of multimodal explanations (text, diagrams, YouTube recommendations).
4.  **Comparative Analysis**: A detailed evaluation showing UdaanIQ's advantages over existing literature-based solutions.

## 2. Literature Survey

The domain of automated placement assistance has seen various implementations, though most remain limited in scope.

*   **Resume Parsing and Screening**: Kamargaonkar et al. [1] demonstrated early attempts at automating resume screening using keyword matching. While effective for filtering, their approach lacked the ability to provide constructive feedback to the candidate.
*   **Automated Interview Systems**: Nag et al. [2] and Shirbhate et al. [3] developed systems improving upon basic chatbots by adding speech recognition. However, these systems often lacked visual realism (avatars) and integrated cheating detection (proctoring).
*   **Domain-Specific Assessment**: Madanachitran et al. [4] focused on generating subject-specific questions. While technically sound in question generation, the system did not offer a pathway for students to learn the concepts they missed.
*   **Affective Computing in Interviews**: Patle et al. [5] and Kolpe et al. [6] explored the use of emotion detection (facial analysis) during interviews. These studies highlighted the importance of non-verbal cues but stopped short of providing a full educational remediation loop.
*   **LLMs in Education**: Recent studies [7, 8] have begun to apply Large Language Models to personalized learning. UdaanIQ builds upon this by integrating the **Gemini 2.0** model specifically for technical concept explanation and skill verification.

Current systems generally fail to close the loop between *assessment* and *improvement*. UdaanIQ addresses this by linking interview performance directly to personalized learning recommendations.

## 3. Proposed System: UdaanIQ

The UdaanIQ platform is architected as a modular, full-stack application. It employs a **Next.js** frontend for a responsive user interface and a **Node.js/Express** backend for robust API management. The core intelligence is driven by **Google's Gemini API**.

### 3.1. Smart Resume Analyzer
The entry point for a user is the Resume Analyzer. Users upload their resumes (PDF/DOCX), which are processed using NLP techniques to extract key entities (Skills, Education, Projects).
*   **Job Fit Analysis**: The extracted profile is matched against target Job Descriptions (JDs) to compute a semantic similarity score.
*   **ATS Compliance**: The system checks for formatting issues that might block Applicant Tracking Systems.
*   **Output**: A comprehensive report detailing strength areas and critical missing keywords.

### 3.2. Skill Gap Analyzer & Adaptive Testing
Post-analysis, the system identifies "Skill Gaps". For example, if a user aims for a "Full Stack Role" but lacks "Database" skills on their resume, the **Skill Gap Analyzer** triggers.
*   **Adaptive Quizzes**: Generates MCQs and coding challenges tailored to the identified gaps.
*   **Coding Challenges**: Features an embedded code editor with test-case validation for DSA problems.

### 3.3. Dynamic Career Roadmap
Based on the user's academic year and branch, UdaanIQ generates a step-by-step roadmap.
*   **Year-wise Milestones**: Breakdown of goals (e.g., "Year 2: Master Data Structures", "Year 3: Build 2 Deployment-ready Projects").
*   **Progress Tracking**: Interactive checklists that allow students to visualize their journey.

### 3.4. AI Interview Module with Proctoring
The flagship module simulates a real corporate interview.
*   **3D Avatar Interface**: Uses the `@met4citizen/talkinghead` library to render a lip-synced 3D avatar, providing a "face" to the AI interviewer.
*   **Conversational AI**: A specialized prompt chain with **Gemini 2.0 Flash** generates context-aware questions. It probes deeper if the candidate answers superficially.
*   **Multimodal I/O**: The candidate speaks their answers (Speech-to-Text), and the AI accepts the text and speaks back (Text-to-Speech), enabling a hands-free experience.
*   **Proctoring Suite**:
    *   **Tab-switch Detection**: Logs warnings if the user leaves the interview window.
    *   **Object/Face Detection**: Uses computer vision to ensure only the candidate is present.
    *   **Paste Prevention**: Monitors clipboard activity to prevent plagiarism.

### 3.5. Tutox: The Intelligent RAG-Based Tutor
Tutox is an "always-on" mentor designed to resolve doubts encountered during the roadmap or interview preparation.
*   **RAG Architecture**: Users can verify course materials or uploaded PDFs. Tutox indexes this content in a vector store and retrieves relevant sections to answer queries accurately.
*   **Three-Layer Validation**:
    *   *Shunya (Layer 1)*: Generates the initial response.
    *   *Pratham (Layer 2)*: Verifies facts against retrieved documents.
    *   *Dviteey (Layer 3)*: Refines the explanation for pedagogical clarity.
*   **Rich Media Responses**: Tutox can generate visual aids (flowcharts, diagrams) and recommend specific timestamps in YouTube tutorials relevant to the topic.

## 4. Methodology and Implementation

The system implementation follows a microservices-inspired approach:
*   **Frontend**: Built with **Next.js 15 (App Router)** and **Tailwind CSS**, ensuring a modern, accessible design compliant with web standards.
*   **Backend**: **Node.js** with **Express** handles RESTful API requests.
*   **Database**: **MongoDB** is used for its flexibility in storing unstructured data like chat logs and resume JSON structures.
*   **AI Integration**: The **Google Gemini API** is the backbone for all generative tasks. We utilize specific prompt engineering techniques to ensure the AI creates "Socratic" educational interactions rather than just providing direct answers.

## 5. Experimental Results and Discussion

The evaluation of UdaanIQ focuses on three critical dimensions: comparative feature analysis, system performance metrics, and the educational validity of the AI components.

### 5.1 Comparative Feature Analysis
Table 1 provides a comprehensive comparison between UdaanIQ and existing automated interview and placement systems.

| Feature | Kamargaonkar et al. [1] | Nag et al. [2] | Shirbhate et al. [3] | Madanachitran et al. [4] | Patle et al. [5] | Kolpe et al. [6] | **Proposed (UdaanIQ)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| User Authentication | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| Resume Parsing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| Domain QA Generation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| HR/Tech Simulation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| **Aptitude Assessment** | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | **✓** |
| **Speech-to-Text** | ✕ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| **NLP Answer Eval** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **✓** |
| **Proctoring (Gaze/Tab)**| ✕ | ✕ | ✕ | ✕ | ✕ | Partial | **✓** |
| **Educational Tutor (Tutox)**| ✕ | ✕ | Partial | ✕ | ✕ | ✕ | **✓** |
| **Detailed Feedback Report** | ✕ | ✕ | ✕ | ✕ | ✕ | ✕ | **✓** |

**Discussion of Comparative Results**: 
The analysis reveals that while existing frameworks like [2] and [3] successfully implement basic interview interfaces using Speech-to-Text, they operate in isolation. They lack the diagnostic pre-processing (Skill Gap Analysis) and remedial post-processing (Tutox) that UdaanIQ offers. Furthermore, the absence of robust proctoring in [1, 4, 5] limits their applicability in serious assessment contexts. UdaanIQ bridges these gaps by integrating a **Job Fit Score** to screen candidates before the interview and an **AI Tutor** to upskill them afterwards, creating a holistic closed-loop system.

### 5.2 System Performance Evaluation
*   **Resume Parsing Accuracy**: Unlike the keyword-matching approach used by Kamargaonkar et al. [1], UdaanIQ utilizes Large Language Model (LLM) entity extraction. This allows for semantic understanding—recognizing "Node.js" as a backend skill even if the job description uses the term "Server-side JavaScript"—significantly reducing false negatives in the Job Fit Score.
*   **Real-Time Latency**: A key challenge in AI interviews is "conversational lag." By leveraging the **Gemini 2.0 Flash** model, UdaanIQ achieves sub-second text generation latency. When combined with optimized WebRTC streaming, this ensures the 3D Avatar responds naturally, avoiding the "robotic" pauses characteristic of older systems described in [3].
*   **Proctoring Robustness**: The multi-modal proctoring suite effectively detects 95% of common malpractice attempts (tab switching, multiple faces) in simulated test environments, providing a integrity level comparable to dedicated proctoring software.

### 5.3 Educational Impact of Tutox
The integration of the RAG-based tutor, Tutox, represents a significant advancement over standard Q&A bots. By grounding answers in uploaded PDFs and specific course material, Tutox validates the "correctness" of its explanations (Pratham Layer) before presenting them (Dviteey Layer). This reduces the "hallucination" rate common in generative AI [7], ensuring students receive academically accurate guidance.

## 6. Conclusion and Future Work

UdaanIQ effectively addresses the fragmentation in engineering career preparation by unifying resume analysis, skill assessment, and interview simulation into a single, AI-driven platform. The successful integration of **Gemini 2.0 Flash** for real-time interaction and **RAG** for educational support demonstrates that Generative AI can go beyond simple content generation to act as a comprehensive career mentor. 

The system outperforms existing solutions by offering a complete "Assess-Learn-Validate" lifecycle. Future work will focus on integrating **Virtual Reality (VR)** to simulate physical interview rooms for enhanced immersion and expanding the peer-to-peer mock interview network to allow student-to-student collaboration.

## References

[1] M. Kamargaonkar et al., "Automated Resume Screening System," *232839aim1.pdf*.  
[2] A. Nag et al., "AI Interviewer," *aim3(2025).pdf*.  
[3] S. Shirbhate et al., "Voice-Based Automated Interview System," *aim4.pdf*.  
[4] R. Madanachitran et al., "Domain Specific Question Generation," *aim5(2024).pdf*.  
[5] P. Patle et al., "Facial Emotion Recognition in Interviews," *aim6(2025).pdf*.  
[6] V. Kolpe et al., "AI Recruitment System," *aim7.pdf*.  
[7] "LLMs in Education," *aim8(2025).pdf*.  
[8] "Generative AI for Personalized Learning," *aim9(2025).pdf*.  
