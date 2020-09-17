import { selector } from "recoil";
import { errorAtom } from "./atoms";

// TODO: refactor this type, it's dumb
import { Props as MessageProps } from "components/basic/display/Message";

export const messagesSelector = selector({
  key: "messages",
  get: ({ get }): null | MessageProps[] => {
    const error = get(errorAtom);

    return (
      error && [
        {
          type: "error",
          label: error.label,
          children: error.body,
        },
      ]
    );
  },
});
