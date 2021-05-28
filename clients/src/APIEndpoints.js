export default {
    base: "https://roundtablefinder.com",
    testbase: "https://localhost:4000",
    handlers: {
        users: "/v1/users",
        myuser: "/v1/users/",
        myuserAvatar: "/v1/users/me/avatar",
        sessions: "/v1/sessions",
        sessionsMine: "/v1/sessions/mine",
        resetPasscode: "/v1/resetcodes",
        passwords: "/v1/passwords/",
        groups: "/v1/groups",
        thisgroup: "/v1/groups/"
    }
}