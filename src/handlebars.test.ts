import { assertEquals, describe, it } from "./deps.ts";
import { render, renderPath } from "./handlebars.ts";

describe("replace helper", () => {
  it("should work", () => {
    assertEquals(render(`{{#replace 'a' 'b'}}abc{{/replace}}`, {}), "bbc");
  });

  it("should allow variables in arguments", () => {
    assertEquals(
      render(`{{#replace var 'b'}}abc{{/replace}}`, { var: "a" }),
      "bbc",
    );
  });

  it("should allow variables in blocks", () => {
    assertEquals(
      render(`{{#replace 'a' 'b'}}{{var}}{{/replace}}`, { var: "abc" }),
      "bbc",
    );
  });

  it("should be a no-op if there are no matches", () => {
    assertEquals(render(`{{#replace 'd' 'e'}}abc{{/replace}}`, {}), "abc");
  });
});

describe("ifCond helper", () => {
  it("should work (equal)", () => {
    assertEquals(
      render(`{{#ifCond 'a' '==' 'a'}}abc{{/ifCond}}`, {}),
      "abc",
    );
  });

  it("should work (not equal)", () => {
    assertEquals(render(`{{#ifCond 'a' '==' 'b'}}abc{{/ifCond}}`, {}), "");
  });

  it("should allow variables in arguments", () => {
    assertEquals(
      render(`{{#ifCond var '==' 'a'}}abc{{/ifCond}}`, { var: "a" }),
      "abc",
    );
    assertEquals(
      render(`{{#ifCond 'a' '==' var}}abc{{/ifCond}}`, { var: "a" }),
      "abc",
    );
    assertEquals(
      render(`{{#ifCond var '==' var}}abc{{/ifCond}}`, { var: "a" }),
      "abc",
    );
    assertEquals(
      render(`{{#ifCond 'a' var 'a'}}abc{{/ifCond}}`, { var: "==" }),
      "abc",
    );
  });

  it("should allow variables in blocks", () => {
    assertEquals(
      render(`{{#ifCond 'a' '==' 'a'}}{{var}}{{/ifCond}}`, {
        var: "abc",
      }),
      "abc",
    );
  });

  it("should support this cursedness", () => {
    assertEquals(
      render(`{{#ifCond var var var}}abc{{/ifCond}}`, {
        var: "==",
      }),
      "abc",
    );
  });
});

describe("path", () => {
  it("should work for paths", () => {
    assertEquals(renderPath(`{{var}}`, { var: "abc" }), "abc");
  });

  it("should allow helpers", () => {
    assertEquals(renderPath(`{{#if var}}abc{{%%if}}`, { var: true }), "abc");
  });
});
