import { isClient } from "@flux/utils/runtime";

export const IS_MAC = isClient && /Mac|iPhone|iPad/.test(navigator.userAgent);
