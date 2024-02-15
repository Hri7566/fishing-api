import { checkToken, createToken, deleteToken } from "@server/data/token";
import { test, expect } from "bun:test";

test("Token can be created and deleted", async () => {
    const token = await createToken();
    expect(token).toBeString();
    await deleteToken(token);
});

test("Token can be validated", async () => {
    const token = await createToken();
    expect(token).toBeString();

    const checked = await checkToken(token);
    expect(checked).toBeTruthy();

    await deleteToken(token);
});

test("Token can be invalidated", async () => {
    const token = await createToken();
    expect(token).toBeString();

    await deleteToken(token);

    const checked = await checkToken(token);
    expect(checked).toBeFalsy();
});
