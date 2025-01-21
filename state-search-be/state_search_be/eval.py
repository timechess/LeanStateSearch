from typing import List, Optional
import numpy as np
from tqdm import tqdm
from flag_model import FlagModel


def index(
    model: FlagModel,
    corpus: Optional[List[str]],
    batch_size: int = 256,
    max_length: int = 512,
    save_path: str = None,
    save_embedding: bool = False,
    load_embedding: bool = False,
):
    """
    1. Encode the entire corpus into dense embeddings;
    2. Create faiss index;
    3. Optionally save embeddings.
    """
    if load_embedding:
        test = model.encode("test")
        dtype = test.dtype
        dim = len(test)

        corpus_embeddings = np.memmap(save_path, mode="r", dtype=dtype).reshape(-1, dim)

    else:
        corpus_embeddings = model.encode_corpus(
            corpus, batch_size=batch_size, max_length=max_length
        )
        dim = corpus_embeddings.shape[-1]

        if save_embedding:
            memmap = np.memmap(
                save_path,
                shape=corpus_embeddings.shape,
                mode="w+",
                dtype=corpus_embeddings.dtype,
            )

            length = corpus_embeddings.shape[0]
            # add in batch
            save_batch_size = 10000
            if length > save_batch_size:
                for i in tqdm(
                    range(0, length, save_batch_size),
                    leave=False,
                    desc="Saving Embeddings",
                ):
                    j = min(i + save_batch_size, length)
                    memmap[i:j] = corpus_embeddings[i:j]
            else:
                memmap[:] = corpus_embeddings

    corpus_embeddings = corpus_embeddings.astype(np.float32)
    return corpus_embeddings


def search(
    model: FlagModel,
    query,
    corpus_embeddings_context,
    corpus_embeddings_goal,
    k: int = 10,
    batch_size: int = 256,
    max_length: int = 512,
):
    """
    1. Encode queries into dense embeddings;
    2. Search through faiss index
    """
    query_embeddings = model.encode_queries(
        query, batch_size=batch_size, max_length=max_length
    )
    """
    memmap = np.memmap(
        'query_64.memmap',
        shape=query_embeddings.shape,
        mode="w+",
        dtype=query_embeddings.dtype
    )
    length = query_embeddings.shape[0]
    # add in batch
    save_batch_size = 10000
    if length > save_batch_size:
        for i in tqdm(range(0, length, save_batch_size), leave=False, desc="Saving Embeddings"):
            j = min(i + save_batch_size, length)
            memmap[i: j] = query_embeddings[i: j]
    else:
        memmap[:] = query_embeddings

    test = model.encode("test")
    dtype = test.dtype
    dim = len(test)
    query_embeddings_e = np.memmap(
        'query_64.memmap',
        mode="r",
        dtype=dtype
    ).reshape(-1, dim)
    """
    # query_embeddings_goal = model.encode_queries(queries["goal"], batch_size=batch_size, max_length=max_length)

    # print(i, j)
    # print(query_embeddings.shape)
    # score, indice = faiss_index.search(query_embedding.astype(np.float32), k=k)
    similarities_context = np.dot(query_embeddings, corpus_embeddings_context.T)
    similarities_goal = np.dot(query_embeddings, corpus_embeddings_goal.T)
    # print(similarities_goal.shape)
    # print(similarities_context.shape)
    similarities = (similarities_context + similarities_goal) / 2
    # print(similarities.shape)
    # 获取每个 query 对应的前 k 个最相似结果
    indices = np.argsort(similarities, axis=1)[:, ::-1][:, :k]  # 每行排序，取前 k 个
    # print(indices)
    scores = np.take_along_axis(similarities, indices, axis=1)  # 获取对应的相似度分数

    return indices, scores


# def load_corpus(corpus_path):
#     corpus = []
#     with open(corpus_path, 'r', encoding='utf-8') as f:
#         for line in f:
#             data = json.loads(line)
#             context = data['context']
#             modified_context = map(lambda x: f"<VAR>{x}", context)
#             corpus[data['id']] = "".join(modified_context) + "<GOAL>" + data['goal']
#     return corpus


# def main():
#     parser_config = argparse.ArgumentParser()
#     parser_config.add_argument(
#         "--config_path", required=True, type=str, help="Path to the config file"
#     )
#     args_config = parser_config.parse_args()
#     config = toml.load(args_config.config_path)
#     args_list = []
#     for key, value in config["eval"].items():
#         args_list.append(f"--{key}")
#         args_list.append(str(value))

#     parser = HfArgumentParser([Args])
#     args: Args = parser.parse_args_into_dataclasses(args_list)[0]

#     eval_data = datasets.load_dataset('json', data_files=args.eval_file,
#                                       split='train[:10000]')
#     corpus = datasets.load_dataset('json', data_files=args.corpus_file,
#                                    split='train')
#     print(args.encoder)
#     model = FlagModel(
#         args.encoder,
#         query_instruction_for_retrieval="Represent this sentence for searching relevant passages: " if args.add_instruction else None,
#         use_fp16=args.fp16,
#         model_type=args.model_type,
#         # pooling_method='mean'
#     )
#     corpus_context = []
#     for item in corpus["context"]:
#         modified_context = map(lambda x: f"<VAR>{x}", item)
#         combine = "".join(modified_context)
#         corpus_context.append(combine)

#     corpus_goal = []
#     for item in corpus["goal"]:
#         corpus_goal.append("<GOAL>" + item)


#     corpus_embeddings_context = index(
#         model=model,
#         corpus=corpus_context,
#         batch_size=args.batch_size,
#         max_length=args.max_passage_length,
#         save_path=args.save_path_context,
#         save_embedding=args.save_embedding,
#         load_embedding=args.load_embedding
#     )

#     corpus_embeddings_goal = index(
#         model=model,
#         corpus=corpus_goal,
#         batch_size=args.batch_size,
#         max_length=args.max_passage_length,
#         save_path=args.save_path_goal,
#         save_embedding=args.save_embedding,
#         load_embedding=args.load_embedding
#     )

#     scores, indices = search(
#         model=model,
#         queries=eval_data,
#         corpus_embeddings_context=corpus_embeddings_context,
#         corpus_embeddings_goal=corpus_embeddings_goal,
#         k=args.k,
#         batch_size=args.batch_size,
#         max_length=args.max_query_length
#     )

#     retrieval_results = []
#     for indice in indices:
#         # filter invalid indices
#         indice = indice[indice != -1].tolist()
#         retrieval_results.append(corpus[indice]["id"])

#     ground_truths = []
#     for sample in eval_data:
#         ground_truths.append(sample["positive"])

#     metrics = evaluate(retrieval_results, scores, ground_truths)
#     wandb.log(metrics)
#     print(metrics)


# if __name__ == "__main__":
#     main()

# # ['<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X₁ : C<VAR>X₂ : C<VAR>X₃ : C<VAR>Y₁ : C<VAR>Y₂ : C<VAR>Y₃ : C', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X₁ : C<VAR>X₂ : C<VAR>X₃ : C<VAR>Y₁ : C<VAR>Y₂ : C<VAR>Y₃ : C<VAR>Z : C<VAR>h : CategoryTheory.MonoidalCategory.tensorObj (CategoryTheory.MonoidalCategory.tensorObj X₁ Y₁)\n(CategoryTheory.MonoidalCategory.tensorObj (CategoryTheory.MonoidalCategory.tensorObj X₂ Y₂)\n(CategoryTheory.MonoidalCategory.tensorObj X₃ Y₃)) ⟶ Z', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X : C<VAR>Y : C', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X : Cᵒᵖ<VAR>Y : Cᵒᵖ', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X : C<VAR>Y : C', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X : Cᵒᵖ<VAR>Y : Cᵒᵖ', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X : C<VAR>Y : C', '<VAR>C : Type u₁<VAR>inst : CategoryTheory.Category.{v₁, u₁} C<VAR>inst : CategoryTheory.MonoidalCategory C<VAR>inst : CategoryTheory.BraidedCategory C<VAR>X : Cᴹᵒᵖ<VAR>Y : Cᴹᵒᵖ']
