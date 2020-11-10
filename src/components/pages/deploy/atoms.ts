import { atom } from "recoil";
import { ValidationErrors } from "validators/types";

export const warningsAtom = atom<ValidationErrors>({
  key: "warnings",
  default: {},
});
