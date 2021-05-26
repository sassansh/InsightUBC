"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const IInsightFacade_1 = require("../src/controller/IInsightFacade");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const Util_1 = require("../src/Util");
const TestUtil_1 = require("./TestUtil");
describe("InsightFacade Add/Remove Dataset", function () {
    const datasetsToLoad = {
        courses: "./test/data/courses.zip",
        coursesOne: "./test/data/courses_one.zip",
        coursesEmpty: "./test/data/courses_empty.zip",
        coursesHTML: "./test/data/courses_html.zip",
        coursesBlank: "./test/data/courses_blank.zip",
        coursesOnevalid: "./test/data/courses_onevalid.zip",
        coursesNofolder: "./test/data/courses_nofolder.zip",
        coursesWrong: "./test/data/courses_wrong.zip",
        coursesInvalid: "./test/data/courses_invalid.zip",
        coursesNoJS: "./test/data/courses_notjs.zip",
        coursesBroken: "./test/data/courses_broken.zip",
        coursesTwo: "./test/data/courses_two.zip",
        coursesDouble: "./test/data/courses_double.zip",
        rooms: "./test/data/rooms.zip",
    };
    let insightFacade;
    let datasets;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            Util_1.default.test(`Before: ${this.test.parent.title}`);
            try {
                const loadDatasetPromises = [];
                for (const [id, path] of Object.entries(datasetsToLoad)) {
                    loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
                }
                const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                    return { [Object.keys(datasetsToLoad)[i]]: buf.toString("base64") };
                });
                datasets = Object.assign({}, ...loadedDatasets);
                chai_1.expect(Object.keys(datasets)).to.have.length.greaterThan(0);
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
            }
            try {
                insightFacade = new InsightFacade_1.default();
            }
            catch (err) {
                Util_1.default.error(err);
            }
            finally {
                chai_1.expect(insightFacade).to.be.instanceOf(InsightFacade_1.default);
            }
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("Should add rooms", () => __awaiter(this, void 0, void 0, function* () {
        const id = "rooms";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Rooms);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([id]);
        }
    }));
    it("Should add courses", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([id, "rooms"]);
        }
    }));
    it("Should remove rooms dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "rooms";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should remove course dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should list 0 datasets before add uno", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(0);
    }));
    it("Should add a valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([id]);
        }
    }));
    it("Should list 1 datasets", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(1);
    }));
    it("Should add a valid dataset dos tres", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesTwo";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should list 2 datasets", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(2);
    }));
    it("Should add a valid dataset dos cuatro", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesDouble";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should list 3 datasets", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(3);
    }));
    it("Should remove the courses dataset uno", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should list 1 datasets before add uno", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(2);
    }));
    it("Should add a valid dataset dos tres", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should list 1 datasets before add uno courses same", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(3);
    }));
    it("Should remove the courses dataset uno", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should get a not found error removing twice", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("Should list 0 datasets after remove 1 last", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(0);
    }));
    it("Should list 0 datasets before add", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        chai_1.expect(response).to.have.lengthOf(0);
    }));
    it("Should not remove when dataset was not in", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("Should add a valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.deep.equal([id]);
        }
    }));
    it("Should list 1 datasets after add", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        finally {
            chai_1.expect(response).to.be.lengthOf(1);
        }
    }));
    it("Should add another valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesNoJS";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should list 2 datasets after", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        finally {
            chai_1.expect(response).to.be.lengthOf(2);
        }
    }));
    it("Should not add an empty dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesEmpty";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add wrong dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesWrong";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add an empty string", () => __awaiter(this, void 0, void 0, function* () {
        const id = "";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add an no json string", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add an empty empty string", () => __awaiter(this, void 0, void 0, function* () {
        const id = "";
        let response;
        try {
            response = yield insightFacade.addDataset("", datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add an empty empty empty string", () => __awaiter(this, void 0, void 0, function* () {
        const id = "";
        let response;
        try {
            response = yield insightFacade.addDataset("", "", IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add null null null", () => __awaiter(this, void 0, void 0, function* () {
        const id = null;
        let response;
        try {
            response = yield insightFacade.addDataset(null, null, null);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add null", () => __awaiter(this, void 0, void 0, function* () {
        const id = null;
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add invalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesInvalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add not added ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesHello";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add null null", () => __awaiter(this, void 0, void 0, function* () {
        const id = null;
        let response;
        try {
            response = yield insightFacade.addDataset(id, null, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add undefined undefined undefined", () => __awaiter(this, void 0, void 0, function* () {
        const id = undefined;
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, undefined, undefined);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add undefined ", () => __awaiter(this, void 0, void 0, function* () {
        const id = undefined;
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add undefined undefined", () => __awaiter(this, void 0, void 0, function* () {
        const id = undefined;
        let response;
        try {
            response = yield insightFacade.addDataset(undefined, undefined, IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not add a blank dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesBlank";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add the valid dataset from invalid sets ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesOnevalid";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.contain("coursesOnevalid");
        }
    }));
    it("Should not add an invalid dataset (html)", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesHTML";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("should not update a valid dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal([id]);
        }
    }));
    it("should not add if no courses", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesNofolder";
        let response;
        try {
            yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal([id]);
        }
    }));
    it("Should remove the courses dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should list 2 datasets after", () => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield insightFacade.listDatasets();
        }
        catch (err) {
            chai_1.expect.fail("Should not fail");
        }
        finally {
            chai_1.expect(response).to.be.lengthOf(1);
        }
    }));
    it("Should remove the blank dataset", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesBlank";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should not remove empty string", () => __awaiter(this, void 0, void 0, function* () {
        const id = "";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("Should not remove not added", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesHello";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.NotFoundError);
        }
    }));
    it("Should not remove null string", () => __awaiter(this, void 0, void 0, function* () {
        const id = null;
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not remove invalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesInvalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should not remove undef string", () => __awaiter(this, void 0, void 0, function* () {
        const id = undefined;
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add a valid bool", () => __awaiter(this, void 0, void 0, function* () {
        const id = false;
        let response;
        try {
            response = yield insightFacade.addDataset("", "", IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(InsightFacade_1.default);
        }
    }));
    it("Should add a valid bool", () => __awaiter(this, void 0, void 0, function* () {
        const id = true;
        let response;
        try {
            response = yield insightFacade.addDataset("", "", IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(InsightFacade_1.default);
        }
    }));
    it("Should not add a valid broken", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesBroken";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(InsightFacade_1.default);
        }
    }));
    it("Should not remove invalid", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesBroken";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
        }
    }));
    it("Should add test smaller sets ", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesOne";
        let response;
        try {
            response = yield insightFacade.addDataset(id, datasets[id], IInsightFacade_1.InsightDatasetKind.Courses);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.contain("coursesOne");
        }
    }));
    it("Should remove the courses dataset uno", () => __awaiter(this, void 0, void 0, function* () {
        const id = "courses";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should remove the courses dataset uno", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesOnevalid";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
    it("Should remove the courses dataset uno", () => __awaiter(this, void 0, void 0, function* () {
        const id = "coursesOne";
        let response;
        try {
            response = yield insightFacade.removeDataset(id);
        }
        catch (err) {
            response = err;
        }
        finally {
            chai_1.expect(response).to.equal(id);
        }
    }));
});
describe("InsightFacade PerformQuery", () => {
    const datasetsQuery = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
    };
    let insightFacade;
    let testQueries = [];
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            Util_1.default.test(`Before: ${this.test.parent.title}`);
            try {
                testQueries = yield TestUtil_1.default.readTestQueries();
                chai_1.expect(testQueries).to.have.length.greaterThan(0);
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more test queries. ${JSON.stringify(err)}`);
            }
            try {
                insightFacade = new InsightFacade_1.default();
            }
            catch (err) {
                Util_1.default.error(err);
            }
            finally {
                chai_1.expect(insightFacade).to.be.instanceOf(InsightFacade_1.default);
            }
            try {
                const loadDatasetPromises = [];
                for (const [id, path] of Object.entries(datasetsQuery)) {
                    loadDatasetPromises.push(TestUtil_1.default.readFileAsync(path));
                }
                const loadedDatasets = (yield Promise.all(loadDatasetPromises)).map((buf, i) => {
                    return { [Object.keys(datasetsQuery)[i]]: buf.toString("base64") };
                });
                chai_1.expect(loadedDatasets).to.have.length.greaterThan(0);
                const responsePromises = [];
                const datasets = Object.assign({}, ...loadedDatasets);
                responsePromises.push(insightFacade.addDataset("courses", datasets["courses"], IInsightFacade_1.InsightDatasetKind.Courses));
                responsePromises.push(insightFacade.addDataset("rooms", datasets["rooms"], IInsightFacade_1.InsightDatasetKind.Rooms));
                try {
                    const responses = yield Promise.all(responsePromises);
                    responses.forEach((response) => chai_1.expect(response).to.be.an("array"));
                }
                catch (err) {
                    Util_1.default.warn(`Ignoring addDataset errors. For D1, you should allow errors to fail the Before All hook.`);
                }
            }
            catch (err) {
                chai_1.expect.fail("", "", `Failed to read one or more datasets. ${JSON.stringify(err)}`);
            }
        });
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    after(function () {
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    afterEach(function () {
        Util_1.default.test(`AfterTest: ${this.currentTest.title}`);
    });
    it("Should run test queries", () => {
        describe("Dynamic InsightFacade PerformQuery tests", () => {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, () => __awaiter(this, void 0, void 0, function* () {
                    let response;
                    try {
                        response = yield insightFacade.performQuery(test.query);
                    }
                    catch (err) {
                        response = err;
                    }
                    finally {
                        if (test.isQueryValid) {
                            chai_1.expect(response).to.deep.equal(test.result);
                        }
                        else {
                            chai_1.expect(response).to.be.instanceOf(IInsightFacade_1.InsightError);
                        }
                    }
                }));
            }
        });
    });
});
//# sourceMappingURL=InsightFacade.spec.js.map