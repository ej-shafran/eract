function TODO() {
  throw new Error("Not yet implemented!");
}

function INVALID(debug) {
  console.error(
    `Invalid state reached; should not have gotten here! :(\n\t%c Debug Info: %c ${debug}`,
    "font-weight:bold;",
    "font-family:monospace;background-color:#222;padding:1px 4px;border-radius:3px;"
  );

  throw new Error("INVALID");
}

console.log("Hello, world!");

// HOT MODULE RELOADING - makes sure the page refreshes when we save the files
import "./hmr";
