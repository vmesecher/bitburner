import { setTimeoutRef } from "./utils/SetTimeoutRef";

import { isString } from "../utils/helpers/isString";
import { AllServers } from "./Server/AllServers";

export function netscriptDelay(time, workerScript) {
  return new Promise(function (resolve) {
    workerScript.delay = setTimeoutRef(() => {
      workerScript.delay = null;
      resolve();
    }, time);
    workerScript.delayResolve = resolve;
  });
}

export function makeRuntimeRejectMsg(workerScript, msg, exp = null) {
  var lineNum = "";
  if (exp != null) {
    var num = getErrorLineNumber(exp, workerScript);
    lineNum = " (Line " + num + ")";
  }
  const server = AllServers[workerScript.serverIp];
  if (server == null) {
    throw new Error(
      `WorkerScript constructed with invalid server ip: ${this.serverIp}`,
    );
  }

  return "|" + server.hostname + "|" + workerScript.name + "|" + msg + lineNum;
}

export function resolveNetscriptRequestedThreads(
  workerScript,
  functionName,
  requestedThreads,
) {
  const threads = workerScript.scriptRef.threads;
  if (!requestedThreads) {
    return isNaN(threads) || threads < 1 ? 1 : threads;
  }
  const requestedThreadsAsInt = requestedThreads | 0;
  if (isNaN(requestedThreads) || requestedThreadsAsInt < 1) {
    throw makeRuntimeRejectMsg(
      workerScript,
      `Invalid thread count passed to ${functionName}: ${requestedThreads}. Threads must be a positive number.`,
    );
  }
  if (requestedThreads > threads) {
    throw makeRuntimeRejectMsg(
      workerScript,
      `Too many threads requested by ${functionName}. Requested: ${requestedThreads}. Has: ${threads}.`,
    );
  }
  return requestedThreadsAsInt;
}

export function getErrorLineNumber(exp, workerScript) {
  var code = workerScript.scriptRef.codeCode();

  //Split code up to the start of the node
  try {
    code = code.substring(0, exp.start);
    return (code.match(/\n/g) || []).length + 1;
  } catch (e) {
    return -1;
  }
}

export function isScriptErrorMessage(msg) {
  if (!isString(msg)) {
    return false;
  }
  let splitMsg = msg.split("|");
  if (splitMsg.length != 4) {
    return false;
  }
  return true;
}
