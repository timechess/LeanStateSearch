"use server";

import {
  createGrpcTransport,
  GrpcTransportOptions,
} from "@connectrpc/connect-node";
import { createClient, Client } from "@connectrpc/connect";

import { toPlainMessage, type PlainMessage } from "@bufbuild/protobuf";

import { LeanGraphService, LeanStateSearchService } from "./gen/state_search/v1/state_search_connect";

import type {
  GetAllRevRequest,
  GetAllRevResponse,
  SearchTheoremRequest,
  SearchTheoremResponse,
  FeedbackRequest,
  FeedbackResponse,
  ClickRequest,
  ClickResponse,
  CallRequest,
  CallResponse,
  GetNodesAndEdgesResponse,
  GetNodesAndEdgesRequest,
} from "./gen/state_search/v1/state_search_pb";

const grpcOptions: GrpcTransportOptions = {
  baseUrl:
    process.env.MODE === "docker"
      ? "http://backend:7720"
      : `http://localhost:${process.env.BACKEND_PORT ?? "7720"}`,
  httpVersion: "2",
};

const transport = createGrpcTransport(grpcOptions);

const leanStateSearchServicer: Client<typeof LeanStateSearchService> =
  createClient(LeanStateSearchService, transport);

const leanGraphServicer: Client<typeof LeanGraphService> =
  createClient(LeanGraphService, transport);

export const getAllRev: (
  request: PlainMessage<GetAllRevRequest>,
) => Promise<PlainMessage<GetAllRevResponse>> = async (request) =>
  toPlainMessage(await leanStateSearchServicer.getAllRev(request));

export const searchTheorem: (
  request: PlainMessage<SearchTheoremRequest>,
) => Promise<PlainMessage<SearchTheoremResponse>> = async (request) =>
  toPlainMessage(await leanStateSearchServicer.searchTheorem(request));

export const feedback: (
  request: PlainMessage<FeedbackRequest>,
) => Promise<PlainMessage<FeedbackResponse>> = async (request) =>
  toPlainMessage(await leanStateSearchServicer.feedback(request));

export const click: (
  request: PlainMessage<ClickRequest>,
) => Promise<PlainMessage<ClickResponse>> = async (request) =>
  toPlainMessage(await leanStateSearchServicer.click(request));

export const call: (
  request: PlainMessage<CallRequest>,
) => Promise<PlainMessage<CallResponse>> = async (request) =>
  toPlainMessage(await leanStateSearchServicer.call(request));

export const getNodesAndEdges: (
  request: PlainMessage<GetNodesAndEdgesRequest>,
) => Promise<PlainMessage<GetNodesAndEdgesResponse>> = async (request) =>
  toPlainMessage(await leanGraphServicer.getNodesAndEdges(request));