import { executeBehavior, registerBehavior } from "@server/behavior";
import { test, expect } from "bun:test";

test("Behavior registering works", async () => {
    try {
        registerBehavior("fish:eat", async ctx => {
            return {
                success: true,
                state: {
                    shouldRemove: true
                }
            };
        });

        registerBehavior("hamburger:yeet", async ctx => {
            return {
                success: true,
                state: {
                    shouldRemove: false,
                    and: "the hamburger rolled away"
                }
            };
        });
    } catch (err) {
        expect(err).toBeUndefined();
    }
});

test("Behavior execution is correct", async () => {
    registerBehavior<"eat", { cooked: boolean }, { shouldRemove: boolean }>(
        "hamburger:eat",
        async ctx => {
            if (ctx.cooked === false) {
                return {
                    success: false,
                    err: "the hamburgers are not cooked yet"
                };
            } else {
                return {
                    success: true,
                    state: {
                        shouldRemove: true
                    }
                };
            }
        }
    );

    let response = await executeBehavior("hamburger:eat", {
        cooked: false
    });

    expect(response.success).toBeFalse();

    response = await executeBehavior("hamburger:eat", {
        cooked: true
    });

    expect(response.success).toBeTrue();
});
