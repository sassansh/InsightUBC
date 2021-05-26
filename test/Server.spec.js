"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/rest/Server");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const chai = require("chai");
const chaiHttp = require("chai-http");
const chai_1 = require("chai");
const Util_1 = require("../src/Util");
const fs = require("fs");
describe("Facade D3", function () {
    let facade = null;
    let server = null;
    chai.use(chaiHttp);
    before(function () {
        facade = new InsightFacade_1.default();
        server = new Server_1.default(4321);
        server.start().then(() => {
            Util_1.default.info("Server starts successfully!");
        }).catch((err) => {
            Util_1.default.error("Error:" + err);
        });
    });
    after(function () {
        server.stop().then(() => {
            Util_1.default.info("Server stops successfully!");
        }).catch((err) => {
            Util_1.default.error("Error:" + err);
        });
    });
    beforeEach(function () {
        Util_1.default.error("Errors in errors in errors");
    });
    afterEach(function () {
    });
    it("list datasets", function () {
        return chai.request("http://localhost:4321")
            .get("/datasets")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch((err) => {
            chai_1.expect.fail();
        });
    });
    it("put datasets rooms", function () {
        let files = process.cwd();
        let file2 = files + "/test/data/rooms.zip";
        return chai.request("http://localhost:4321")
            .put("/dataset/rooms/rooms")
            .attach("body", fs.readFileSync(file2), "rooms.zip")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch((err) => {
            chai_1.expect.fail();
        });
    });
    it("put datasets courses", function () {
        let files = process.cwd();
        let file2 = files + "/test/data/courses.zip";
        return chai.request("http://localhost:4321")
            .put("/dataset/courses/courses")
            .attach("body", fs.readFileSync(file2), "courses.zip")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch(() => {
            chai_1.expect.fail();
        });
    });
    it("delete dataset courses", function () {
        return chai.request("http://localhost:4321")
            .del("/dataset/courses")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch(() => {
            chai_1.expect.fail();
        });
    });
    it("delete dataset courses with 404", function () {
        return chai.request("http://localhost:4321")
            .del("/dataset/courses")
            .then(function () {
            chai_1.expect.fail();
        }).catch((err) => {
            chai_1.expect(err.status).to.equal(404);
        });
    });
    it("delete dataset courses with 400", function () {
        return chai.request("http://localhost:4321")
            .del("/dataset/").then(function () {
            chai_1.expect.fail();
        }).catch((err) => {
            chai_1.expect(err.status).to.equal(400);
        });
    });
    it("put datasets courses", function () {
        let files = process.cwd();
        let file2 = files + "/test/data/courses.zip";
        return chai.request("http://localhost:4321")
            .put("/dataset/courses/courses").attach("body", fs.readFileSync(file2), "courses.zip").then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch(() => {
            chai_1.expect.fail();
        });
    });
    it("post 400", function () {
        let files = process.cwd();
        let file2 = files + "/test/queries/q2.json";
        let query = fs.readFileSync(file2).toString();
        return chai.request("http://localhost:4321").post("/query").send(query).then(function (res) {
            chai_1.expect.fail();
        }).catch((err) => {
            chai_1.expect(err.status).to.equal(400);
        });
    });
    it("echo with 400", function () {
        return chai.request("http://localhost:4321")
            .get("/echo")
            .then(function () {
            chai_1.expect.fail();
        }).catch((err) => {
            chai_1.expect(err.status).to.equal(500);
        });
    });
    it("echo with 200", function () {
        return chai.request("http://localhost:4321")
            .get("/echo/hello")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch((err) => {
            chai_1.expect.fail();
        });
    });
    it("put datasets courses with 400", function () {
        let files = process.cwd();
        let file2 = files + "/test/data/courses.zip";
        return chai.request("http://localhost:4321")
            .put("/dataset/courses/rooms")
            .attach("body", fs.readFileSync(file2), "rooms.zip")
            .then(function () {
            chai_1.expect.fail();
        }).catch((e) => {
            chai_1.expect(e.status).to.equal(400);
        });
    });
    it("delete dataset rooms", function () {
        return chai.request("http://localhost:4321")
            .del("/dataset/rooms")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch(() => {
            chai_1.expect.fail();
        });
    });
    it("delete dataset courses 2", function () {
        return chai.request("http://localhost:4321")
            .del("/dataset/courses")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch(() => {
            chai_1.expect.fail();
        });
    });
    it("put post 200", function () {
        let files = process.cwd();
        let file2 = files + "/test/queries/q2.json";
        return chai.request("http://localhost:4321").post("/query")
            .attach("body", fs.readFileSync(file2), "q2.json")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch((e) => {
            chai_1.expect.fail();
        });
    });
    it("load something", function () {
        return chai.request("http://localhost:4321")
            .get("/index.html")
            .then(function (res) {
            chai_1.expect(res.status).to.equal(200);
        }).catch(() => {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=Server.spec.js.map