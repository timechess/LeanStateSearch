from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Theorem(_message.Message):
    __slots__ = ("id", "name", "code", "rev", "module", "formal_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    CODE_FIELD_NUMBER: _ClassVar[int]
    REV_FIELD_NUMBER: _ClassVar[int]
    MODULE_FIELD_NUMBER: _ClassVar[int]
    FORMAL_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    code: str
    rev: str
    module: str
    formal_type: str
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., code: _Optional[str] = ..., rev: _Optional[str] = ..., module: _Optional[str] = ..., formal_type: _Optional[str] = ...) -> None: ...

class GetAllRevRequest(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class GetAllRevResponse(_message.Message):
    __slots__ = ("revs",)
    REVS_FIELD_NUMBER: _ClassVar[int]
    revs: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, revs: _Optional[_Iterable[str]] = ...) -> None: ...

class SearchTheoremRequest(_message.Message):
    __slots__ = ("query", "nresult", "rev")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    NRESULT_FIELD_NUMBER: _ClassVar[int]
    REV_FIELD_NUMBER: _ClassVar[int]
    query: str
    nresult: int
    rev: str
    def __init__(self, query: _Optional[str] = ..., nresult: _Optional[int] = ..., rev: _Optional[str] = ...) -> None: ...

class SearchTheoremResponse(_message.Message):
    __slots__ = ("results",)
    RESULTS_FIELD_NUMBER: _ClassVar[int]
    results: _containers.RepeatedCompositeFieldContainer[Theorem]
    def __init__(self, results: _Optional[_Iterable[_Union[Theorem, _Mapping]]] = ...) -> None: ...

class FeedbackRequest(_message.Message):
    __slots__ = ("query", "theorem_id", "relevant", "update", "rank")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    THEOREM_ID_FIELD_NUMBER: _ClassVar[int]
    RELEVANT_FIELD_NUMBER: _ClassVar[int]
    UPDATE_FIELD_NUMBER: _ClassVar[int]
    RANK_FIELD_NUMBER: _ClassVar[int]
    query: str
    theorem_id: str
    relevant: bool
    update: bool
    rank: int
    def __init__(self, query: _Optional[str] = ..., theorem_id: _Optional[str] = ..., relevant: bool = ..., update: bool = ..., rank: _Optional[int] = ...) -> None: ...

class FeedbackResponse(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class ClickRequest(_message.Message):
    __slots__ = ("query", "theorem_id", "rank")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    THEOREM_ID_FIELD_NUMBER: _ClassVar[int]
    RANK_FIELD_NUMBER: _ClassVar[int]
    query: str
    theorem_id: str
    rank: int
    def __init__(self, query: _Optional[str] = ..., theorem_id: _Optional[str] = ..., rank: _Optional[int] = ...) -> None: ...

class ClickResponse(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class CallRequest(_message.Message):
    __slots__ = ("call_type", "query")
    CALL_TYPE_FIELD_NUMBER: _ClassVar[int]
    QUERY_FIELD_NUMBER: _ClassVar[int]
    call_type: int
    query: str
    def __init__(self, call_type: _Optional[int] = ..., query: _Optional[str] = ...) -> None: ...

class CallResponse(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...

class LeanNode(_message.Message):
    __slots__ = ("name", "const_category", "const_type", "module", "doc_string", "informal_name", "informal_statement")
    NAME_FIELD_NUMBER: _ClassVar[int]
    CONST_CATEGORY_FIELD_NUMBER: _ClassVar[int]
    CONST_TYPE_FIELD_NUMBER: _ClassVar[int]
    MODULE_FIELD_NUMBER: _ClassVar[int]
    DOC_STRING_FIELD_NUMBER: _ClassVar[int]
    INFORMAL_NAME_FIELD_NUMBER: _ClassVar[int]
    INFORMAL_STATEMENT_FIELD_NUMBER: _ClassVar[int]
    name: str
    const_category: str
    const_type: str
    module: str
    doc_string: str
    informal_name: str
    informal_statement: str
    def __init__(self, name: _Optional[str] = ..., const_category: _Optional[str] = ..., const_type: _Optional[str] = ..., module: _Optional[str] = ..., doc_string: _Optional[str] = ..., informal_name: _Optional[str] = ..., informal_statement: _Optional[str] = ...) -> None: ...

class LeanEdge(_message.Message):
    __slots__ = ("id", "source", "target", "edge_type")
    ID_FIELD_NUMBER: _ClassVar[int]
    SOURCE_FIELD_NUMBER: _ClassVar[int]
    TARGET_FIELD_NUMBER: _ClassVar[int]
    EDGE_TYPE_FIELD_NUMBER: _ClassVar[int]
    id: str
    source: str
    target: str
    edge_type: str
    def __init__(self, id: _Optional[str] = ..., source: _Optional[str] = ..., target: _Optional[str] = ..., edge_type: _Optional[str] = ...) -> None: ...

class GetDependencyNodesAndEdgesRequest(_message.Message):
    __slots__ = ("name",)
    NAME_FIELD_NUMBER: _ClassVar[int]
    name: str
    def __init__(self, name: _Optional[str] = ...) -> None: ...

class GetDependencyNodesAndEdgesResponse(_message.Message):
    __slots__ = ("nodes", "edges", "sampling_info")
    NODES_FIELD_NUMBER: _ClassVar[int]
    EDGES_FIELD_NUMBER: _ClassVar[int]
    SAMPLING_INFO_FIELD_NUMBER: _ClassVar[int]
    nodes: _containers.RepeatedCompositeFieldContainer[LeanNode]
    edges: _containers.RepeatedCompositeFieldContainer[LeanEdge]
    sampling_info: SamplingInfo
    def __init__(self, nodes: _Optional[_Iterable[_Union[LeanNode, _Mapping]]] = ..., edges: _Optional[_Iterable[_Union[LeanEdge, _Mapping]]] = ..., sampling_info: _Optional[_Union[SamplingInfo, _Mapping]] = ...) -> None: ...

class GetDependentNodesAndEdgesRequest(_message.Message):
    __slots__ = ("name",)
    NAME_FIELD_NUMBER: _ClassVar[int]
    name: str
    def __init__(self, name: _Optional[str] = ...) -> None: ...

class GetDependentNodesAndEdgesResponse(_message.Message):
    __slots__ = ("nodes", "edges", "sampling_info")
    NODES_FIELD_NUMBER: _ClassVar[int]
    EDGES_FIELD_NUMBER: _ClassVar[int]
    SAMPLING_INFO_FIELD_NUMBER: _ClassVar[int]
    nodes: _containers.RepeatedCompositeFieldContainer[LeanNode]
    edges: _containers.RepeatedCompositeFieldContainer[LeanEdge]
    sampling_info: SamplingInfo
    def __init__(self, nodes: _Optional[_Iterable[_Union[LeanNode, _Mapping]]] = ..., edges: _Optional[_Iterable[_Union[LeanEdge, _Mapping]]] = ..., sampling_info: _Optional[_Union[SamplingInfo, _Mapping]] = ...) -> None: ...

class SamplingInfo(_message.Message):
    __slots__ = ("was_sampled", "original_node_count", "sampled_node_count")
    WAS_SAMPLED_FIELD_NUMBER: _ClassVar[int]
    ORIGINAL_NODE_COUNT_FIELD_NUMBER: _ClassVar[int]
    SAMPLED_NODE_COUNT_FIELD_NUMBER: _ClassVar[int]
    was_sampled: bool
    original_node_count: int
    sampled_node_count: int
    def __init__(self, was_sampled: bool = ..., original_node_count: _Optional[int] = ..., sampled_node_count: _Optional[int] = ...) -> None: ...
