import { fromPairs } from "lodash";

interface DecoderValue {
  operation: number;
  to: string;
  value: number | string;
  data: string;
  dataDecoded: DecoderNode;
}

interface DecoderParameter {
  name: string;
  type: string;
  value: number | string;
  valueDecoded?: DecoderValue[] | DecoderNode;
}

interface DecoderNode {
  method: string;
  parameters: DecoderParameter[];
}

export interface TransactionMethodCall {
  method: string;
  target?: string;
  params: Record<string, any>;
}

export const flattenMultiSend = (
  rootNode: DecoderNode
): TransactionMethodCall[] => {
  if (rootNode.method !== "multiSend") {
    throw new Error("Can only flatten multiSend transactions");
  }

  const methodCalls = [];

  const walkTransaction = (
    node: DecoderNode,
    parentValue?: DecoderValue
  ): void => {
    methodCalls.push({
      method: node.method,
      target: parentValue?.to,
      params: fromPairs(
        node.parameters.map((value: DecoderParameter): any => [
          value.name,
          value.value,
        ])
      ),
    });

    node.parameters.forEach((parameter: DecoderParameter): void => {
      if (parameter != null && parameter.valueDecoded != null) {
        if (Array.isArray(parameter.valueDecoded)) {
          // valueDecoded.parameters contains the next node
          parameter.valueDecoded.forEach(
            (parameterValue: DecoderValue): void => {
              if (parameterValue && parameterValue.dataDecoded) {
                walkTransaction(
                  parameterValue.dataDecoded as DecoderNode,
                  parameterValue
                );
              }
            }
          );
        } else {
          // valueDecoded is next node
          walkTransaction(parameter.valueDecoded as DecoderNode, parentValue);
        }
      }
    });
  };

  walkTransaction(rootNode);
  return methodCalls;
};
