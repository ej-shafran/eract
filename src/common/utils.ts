export function TODO(): never {
  throw new Error("Not yet implemented!");
}

export function INVALID(debug?: unknown): never {
  console.error(
    `Invalid state reached; should not have gotten here! :(\n\t%c Debug Info: %c ${debug}`,
    "font-weight:bold;",
    "font-family:monospace;background-color:#222;padding:1px 4px;border-radius:3px;"
  );

  throw new Error("INVALID");
}

export function NEVER(arg: never): never {
  console.error(
    `Expected never! :(\n\t%c Got: %c ${arg}`,
    "font-weight:bold;",
    "font-family:monospace;background-color:#222;padding:1px 4px;border-radius:3px;"
  );

  throw new Error("NEVER");
}
