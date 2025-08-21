export function AboutPage() {
  return (
    <div className="w-full p-8 lg:p-12">
      {/* News Section */}
      <div className="mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
          News
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-lg lg:text-xl text-gray-800">
              <span className="font-semibold text-gray-900">
                2025/08/22 Update:
              </span>{" "}
              Add dependency graph visualization!
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-lg lg:text-xl text-gray-800">
              <span className="font-semibold text-gray-900">
                2025/04/05 Update:
              </span>{" "}
              <a
                href="https://github.com/ruc-ai4math/LeanStateSearch"
                className="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Self-host Lean State Search
              </a>{" "}
              is available!
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-lg lg:text-xl text-gray-800">
              <span className="font-semibold text-gray-900">
                2025/03/07 Update:
              </span>{" "}
              <a
                href="https://github.com/leanprover-community/LeanSearchClient"
                className="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                LeanSearchClient
              </a>{" "}
              now supports query Lean State Search from within Lean.
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-lg lg:text-xl text-gray-800">
              <span className="font-semibold text-gray-900">
                2025/03/05 Update:
              </span>{" "}
              Lean State Search is now publicly available!
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
          About
        </h2>
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
          <div className="space-y-6 text-lg lg:text-xl text-gray-700 leading-relaxed">
            <p>
              <span className="font-semibold text-gray-900">
                Lean State Search
              </span>{" "}
              is an innovative search engine powered by a pretrained model,
              specifically designed to help mathematicians and Lean4 users
              efficiently search Mathlib theorems using proof states. It is
              developed by the{" "}
              <span className="font-semibold text-gray-900">AI4Math team</span>{" "}
              at Renmin University of China.
            </p>
            <p>
              We collect user feedbacks to improve our model. These feedbacks
              will also be publicly available and continuously updated.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Section */}
      <div className="mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
          Usage
        </h2>
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
          <div className="space-y-6 text-lg lg:text-xl text-gray-700">
            <p>
              Our search engine will parse the proof states from the Lean
              infoview into arguments and goals. The special token{" "}
              <code className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-mono font-semibold border border-gray-300">
                ⊢
              </code>{" "}
              is required. Here is a valid query example:
            </p>

            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <pre className="whitespace-pre-wrap font-mono text-base lg:text-lg text-gray-800 leading-relaxed">
                {`n : ℕ
ih : ∀ m < n, 2 ≤ m → ¬Nat.Prime m → ∃ p, Nat.Prime p ∧ p ∣ m
h : 2 ≤ n
np : ¬Nat.Prime n
⊢ ∃ p, Nat.Prime p ∧ p ∣ n`}
              </pre>
            </div>

            <p>
              You can copy the proof states directly from the infoview. It is
              also recommended to only keep the relevant hypotheses for better
              accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
          Resources
        </h2>
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Model & Code
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <a
                    href="https://huggingface.co/ruc-ai4math/Lean_State_Search_Random"
                    className="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Hugging Face Model Hub
                  </a>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <a
                    href="https://github.com/ruc-ai4math/Premise-Retrieval"
                    className="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repository
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Research Paper
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                  <a
                    href="https://arxiv.org/abs/2501.13959"
                    className="text-blue-600 hover:text-blue-800 underline decoration-1 underline-offset-2 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    arXiv Preprint
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Citation Section */}
      <div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
          Citation
        </h2>
        <div className="bg-white p-6 rounded-lg border border-gray-300">
          <pre className="whitespace-pre-wrap font-mono text-sm lg:text-base text-gray-800 leading-relaxed overflow-x-auto">
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
