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
    __slots__ = ("call_type",)
    CALL_TYPE_FIELD_NUMBER: _ClassVar[int]
    call_type: int
    def __init__(self, call_type: _Optional[int] = ...) -> None: ...

class CallResponse(_message.Message):
    __slots__ = ()
    def __init__(self) -> None: ...
