import * as HttpApi from "@effect/platform/HttpApi"
import { V1ApiGroup } from "./V1ApiGroup.ts"

export class Api extends HttpApi.make("api").add(V1ApiGroup) {}
