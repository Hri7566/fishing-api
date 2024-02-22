import {
    checkToken,
    createToken,
    deleteToken,
    tokenToID
} from "@server/data/token";
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

test("Token can be digested into ID", async () => {
    const token = await createToken();
    expect(token).toBeString();

    const id = tokenToID(token);
    expect(id).toBeString();
    expect(id).toHaveLength(24);

    await deleteToken(token);
});
