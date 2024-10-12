const roomName = "test/fishing";
const roomType = "private";

const response = await fetch("https://talkomatic.co/create-and-join-room", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Cookie: "updatePopupClosed1=true; userColor=darkTurquoise; connect.sid=s%3ATTw_3S9yiLjLTGqgn-8q_NvMVyZeKbzL.8s6fsBX70UGA2joKD60nW3pm9XmCELWT4io%2FIfv1yd4"
    },
    credentials: "include",
    body: JSON.stringify({ roomName, roomType })
});

console.log(response);
console.log(
    new TextDecoder().decode((await response.body?.getReader().read())?.value)
);
