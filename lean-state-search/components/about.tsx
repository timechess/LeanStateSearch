export function AboutPage() {
  return (
    <div className="w-full mx-auto p-6 bg-white text-left">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4">News</h2>
        <p className="text-2xl">
          March 2025 Update: Lean State Search is now publicly available!
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4">About</h2>
        <div className="space-y-4 text-2xl">
          <p>
            Lean State Search is an innovative search engine powered by a
            pretrained model, specifically designed to help mathematicians and
            Lean4 users efficiently search Mathlib theorems using proof states.
            It is developed by the AI4Math team at Renmin University of China.
          </p>
          <p>
            We collect user feedbacks to improve our model. These feedbacks will
            also be publicly available and continuously updated.
          </p>
        </div>
      </div>

      {/* Usage Section */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4">Usage</h2>
        <div className="space-y-4 text-2xl">
          <p>
            Our search engine will parse the proof states from the Lean infoview
            into arguments and goals. The special token{" "}
            <code className="bg-gray-100 px-1 rounded">⊢</code> is required.
            Here is a valid query example:
          </p>

          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap font-mono text-xl">
              {`n : ℕ
ih : ∀ m < n, 2 ≤ m → ¬Nat.Prime m → ∃ p, Nat.Prime p ∧ p ∣ m
h : 2 ≤ n
np : ¬Nat.Prime n
⊢ ∃ p, Nat.Prime p ∧ p ∣ n`}
            </pre>
          </div>

          <p>
            You can copy the proof states directly from the infoview. It is also
            recommended to only keep the relevant hypotheses for better
            accuracy.
          </p>
        </div>
      </div>

      {/* Resources Section */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-4">Resources</h2>
        <div className="space-y-2 text-2xl">
          <p className="font-medium">Model & Code:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <a
                href="https://huggingface.co/ruc-ai4math/Lean_State_Search_Random"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Hugging Face Model Hub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/ruc-ai4math/Premise-Retrieval"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository
              </a>
            </li>
          </ul>
          <p className="font-medium mt-4">Research Paper:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>
              <a
                href="https://arxiv.org/abs/2501.13959"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                arXiv Preprint
              </a>
            </li>
          </ul>
          <p className="mt-8 italic text-gray-600">
            Coming Soon: Self-hosting and custom deployment options for the
            search engine!
          </p>
        </div>
      </div>

      {/* Citation Section */}
      <div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Citation</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap font-mono text-xl">
            {`@misc{tao2025assistingmathematicalformalizationlearningbased,
      title={Assisting Mathematical Formalization with A Learning-based Premise Retriever},
      author={Yicheng Tao and Haotian Liu and Shanwen Wang and Hongteng Xu},
      year={2025},
      eprint={2501.13959},
      archivePrefix={arXiv},
      primaryClass={cs.CL},
      url={https://arxiv.org/abs/2501.13959},
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
