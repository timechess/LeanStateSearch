from google.protobuf import timestamp_pb2 as _timestamp_pb2
from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Iterable as _Iterable, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class Theorem(_message.Message):
    __slots__ = ("id", "name", "code", "rev", "module")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    CODE_FIELD_NUMBER: _ClassVar[int]
    REV_FIELD_NUMBER: _ClassVar[int]
    MODULE_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    code: str
    rev: str
    module: str
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., code: _Optional[str] = ..., rev: _Optional[str] = ..., module: _Optional[str] = ...) -> None: ...

class SearchTheoremRequest(_message.Message):
    __slots__ = ("query", "nresult", "rerank", "rev")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    NRESULT_FIELD_NUMBER: _ClassVar[int]
    RERANK_FIELD_NUMBER: _ClassVar[int]
    REV_FIELD_NUMBER: _ClassVar[int]
    query: str
    nresult: int
    rerank: bool
    rev: str
    def __init__(self, query: _Optional[str] = ..., nresult: _Optional[int] = ..., rerank: bool = ..., rev: _Optional[str] = ...) -> None: ...

class SearchTheoremResponse(_message.Message):
    __slots__ = ("results",)
    RESULTS_FIELD_NUMBER: _ClassVar[int]
    results: _containers.RepeatedCompositeFieldContainer[Theorem]
    def __init__(self, results: _Optional[_Iterable[_Union[Theorem, _Mapping]]] = ...) -> None: ...

class FeedbackRequest(_message.Message):
    __slots__ = ("query", "theorem_id", "relevant", "update")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    THEOREM_ID_FIELD_NUMBER: _ClassVar[int]
    RELEVANT_FIELD_NUMBER: _ClassVar[int]
    UPDATE_FIELD_NUMBER: _ClassVar[int]
    query: str
    theorem_id: str
    relevant: bool
    update: bool
    def __init__(self, query: _Optional[str] = ..., theorem_id: _Optional[str] = ..., relevant: bool = ..., update: bool = ...) -> None: ...

class FeedbackResponse(_message.Message):
    __slots__ = ("update_time",)
    UPDATE_TIME_FIELD_NUMBER: _ClassVar[int]
    update_time: _timestamp_pb2.Timestamp
    def __init__(self, update_time: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...) -> None: ...
