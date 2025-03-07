"use server";

import {
  createGrpcTransport,
  GrpcTransportOptions,
} from "@connectrpc/connect-node";
import { createClient, Client } from "@connectrpc/connect";

import { toPlainMessage, type PlainMessage } from "@bufbuild/protobuf";

import { LeanStateSearchService } from "./gen/state_search/v1/state_search_connect";

import type {
  GetAllRevRequest,
  GetAllRevResponse,
  SearchTheoremRequest,
  SearchTheoremResponse,
  FeedbackRequest,
  FeedbackResponse,
} from "./gen/state_search/v1/state_search_pb";

const grpcOptions: GrpcTransportOptions = {
  baseUrl: "http://localhost:7720",
  httpVersion: "2",
};

const transport = createGrpcTransport(grpcOptions);

const leanStateSearchServicer: Client<typeof LeanStateSearchService> =
  createClient(LeanStateSearchService, transport);

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
