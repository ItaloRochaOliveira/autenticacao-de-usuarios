import { v4 } from "uuid";

export class IdGerator {
  public gerate = (): string => {
    return v4();
  };
}
