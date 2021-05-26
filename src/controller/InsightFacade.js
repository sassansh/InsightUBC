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
const Util_1 = require("../Util");
const IInsightFacade_1 = require("./IInsightFacade");
const JSZip = require("jszip");
const fs = require("fs");
const decimal_js_1 = require("decimal.js");
const http = require("http");
const parse5 = require("parse5");
const COURSES = IInsightFacade_1.InsightDatasetKind.Courses;
const ROOMS = IInsightFacade_1.InsightDatasetKind.Rooms;
class InsightFacade {
    constructor() {
        this.nameArray1 = [];
        this.addressArray1 = [];
        this.numberArray1 = [];
        this.typeArray1 = [];
        this.furnArray1 = [];
        this.sizeArray1 = [];
        this.hrefArray1 = [];
        this.mixArray1 = [];
        this.latlonArray1 = [];
        this.kepler = [];
        Util_1.default.trace("InsightFacadeImpl::init()");
        this.mydatasets = new Map();
        this.coursesMap = new Map();
        this.roomsMap = new Map();
        this.linksMap = new Map();
        this.nameArray1 = [];
        this.addressArray1 = [];
        this.numberArray1 = [];
        this.typeArray1 = [];
        this.furnArray1 = [];
        this.sizeArray1 = [];
        this.hrefArray1 = [];
        this.mixArray1 = [];
        this.latlonArray1 = [];
        this.kepler = [];
    }
    static getInstance() {
        return InsightFacade.instancefacade;
    }
    addRoomLinks(data, code) {
        let document = parse5.parse(data);
        let dataNodes = document.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === "html") {
                this.getDataLinks(childnode);
            }
        });
    }
    getDataLinks(data) {
        let dataNodes = data.childNodes;
        let classVal = "building-info";
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === null || childnode.tagName === undefined) {
            }
            else if (childnode.nodeName !== "tbody") {
                this.getDataLinks(childnode);
            }
            else {
                this.getDataLinks2(childnode);
            }
        });
    }
    getDataLinks2(data) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === null || childnode.tagName === undefined) {
            }
            else if (childnode.nodeName !== "a") {
                this.getDataLinks2(childnode);
            }
            else {
                this.getLinks(childnode.attrs);
            }
        });
    }
    getLinks(data) {
        let res = [];
        let regex = /.\/campus\/discover\/buildings-and-classrooms\/.*/;
        data.forEach((obj) => {
            if (obj.value.match(regex)) {
                res.push(obj.value);
            }
        });
        this.removeDuplicates(res);
    }
    removeDuplicates(data) {
        let sub = data[0].substring(43, 47);
        let elem = data[0];
        this.linksMap.set(sub, data);
        let merged = [].concat.apply([], data);
    }
    placeData(id, codearr) {
        return new Promise((resolve, reject) => {
            let that = this;
            let arr = [];
            let numarr = [];
            let hrefarr = [];
            let mixarr = [];
            let mixarr2 = [];
            let chunks = [];
            let adr = [];
            let mixarr3 = [];
            let resul = [];
            this.nameArray1.forEach((data1) => {
                arr.push(data1);
            });
            this.numberArray1.forEach((data1) => {
                numarr.push(data1);
            });
            arr.forEach((data1, i) => {
                let full = data1.replace(/.*:/, "");
                let short = data1.replace(/:.*!/, "");
                this.hrefArray1.forEach((data2) => {
                    data2.forEach((x) => {
                        let shortref = x.replace(/.*room/, "");
                        let shortref2 = short.replace("/", "");
                        if (x.indexOf(short) === 0) {
                            mixarr.push([data1, x, shortref2]);
                        }
                    });
                });
            });
            let uniq = this.addressArray1.reduce((a, b) => {
                if (a.indexOf(b) < 0) {
                    a.push(b);
                }
                return a;
            }, []);
            uniq.forEach((x) => {
                if (x.includes("Formerly known") || x.includes("Opening hours") || x.includes("TBD")) {
                }
                else {
                    adr.push(x);
                }
            });
            this.mixArray1.forEach((data1) => {
                data1.forEach((x, i) => {
                    if (x.includes("http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/")) {
                        mixarr2.push([x]);
                    }
                });
                mixarr2.forEach((y) => {
                    data1.forEach((t, c) => {
                        if (y[0] === data1[c]) {
                            chunks.push([data1[c], data1[c + 2], data1[c + 3], data1[c + 4]]);
                        }
                    });
                });
            });
            arr.forEach((data1, i) => {
                let full = data1.replace(/.*:/, "");
                let short = data1.replace(/:.*/, "");
                let adrarr = [];
                adr.forEach((x) => {
                    let sub = x.substring(0, 4);
                    let sub2 = x.substring(0, 3);
                    if (short === sub || short === sub2) {
                        mixarr3.push(data1 + " -- " + x);
                    }
                });
            });
            that.putData(mixarr3, chunks, id).then((x) => {
                return resolve(x);
            });
        });
    }
    getGeo(url, fu2, st, r2, r3, a2, s2, te, fn, hf) {
        return new Promise((resolve, reject) => {
            http.get(url, (result) => {
                result.setEncoding("utf8");
                let body = "";
                result.on("data", (chunk) => {
                    body += chunk;
                }).on("error", (err) => {
                    return reject("GEO ERROR: " + err);
                });
                result.on("end", () => {
                    let resultVal = JSON.parse(body);
                    let latlon = JSON.parse(JSON.stringify(resultVal));
                    let lati = latlon.lat;
                    let longi = latlon.lon;
                    let obj = {
                        rooms_fullname: fu2,
                        rooms_shortname: st,
                        rooms_number: r2,
                        rooms_name: r3,
                        rooms_address: a2,
                        rooms_lat: lati,
                        rooms_lon: longi,
                        rooms_seats: s2,
                        rooms_type: te,
                        rooms_furniture: fn,
                        rooms_href: "http:" + hf
                    };
                    let roomsobj = JSON.parse(JSON.stringify(obj));
                    return resolve(roomsobj);
                });
            });
        });
    }
    putData(mixarr3, chunks, id) {
        return new Promise((resolve, reject) => {
            let that = this;
            let latlonarr = [];
            let latlonarr2 = [];
            let fx = [];
            let short = "";
            let full = "";
            let full2 = "";
            mixarr3.forEach((data1) => {
                short = data1.replace(/:.*/, "");
                let addrs = data1.replace(/.* --/, "");
                let addrs2 = addrs.replace(/.*--/, "");
                let addr = addrs2.replace(/ /g, "%20");
                full = data1.replace(/.*:/, "");
                full2 = full.replace(/ --.*/, "");
                let url = "http://cs310.ugrad.cs.ubc.ca:11316/api/v1/project_e6y0b_s5c1b/" + addr;
                chunks.forEach((data2) => {
                    let correctCode = data2[0].replace(/:.*/, "");
                    if (correctCode === short) {
                        let regex = /.*\//;
                        let roomname = data2[0].replace(regex, "");
                        let roomname2 = roomname.replace(/.*-/, "");
                        let roomname3 = short + "_" + roomname2;
                        let seats = data2[1].replace(/.*:/, "");
                        let seats2 = Number(seats);
                        let type = data2[3].replace(/.*:/, "");
                        let furn = data2[2].replace(/.*:/, "");
                        let href = data2[0].replace(/.*:/, "");
                        fx.push(that.getGeo(url, full2, short, roomname2, roomname3, addrs2, seats2, type, furn, href));
                    }
                });
            });
            let fxarray = [];
            Promise.all(fx).then((j) => {
                fxarray.push(j);
                return resolve(fxarray);
            }).catch((err) => {
            });
        });
    }
    getDataNames(data, code) {
        let promises = [];
        let document = parse5.parse(data);
        let dataNodes = document.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === "html") {
                this.getDataName(childnode, code);
                this.getDataAddress(childnode, code);
            }
        });
    }
    getDataName(data, code) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === null || childnode.tagName === undefined) {
            }
            else if (childnode.tagName !== "h2") {
                this.getDataName(childnode, code);
            }
            else {
                this.getDataName2(childnode, code);
            }
        });
    }
    getDataName2(data, code) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === "span") {
                this.getDataName3(childnode, code);
            }
        });
    }
    getDataName3(data, code) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.nodeName === "#text") {
                this.nameArray1.push(code + ":" + childnode.value);
            }
        });
    }
    getDataAddress(data, code) {
        let dataNodes = data.childNodes;
        let classVal = "building-info";
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === null || childnode.tagName === undefined) {
            }
            else if (childnode.tagName !== "div") {
                this.getDataAddress(childnode, code);
            }
            else {
                if (typeof childnode.attrs !== "undefined") {
                    childnode.attrs.forEach((at) => {
                        if (childnode.attrs.length >= 1) {
                            if (at.value === classVal) {
                                this.getDataAddress5(childnode, code);
                            }
                            else {
                                this.getDataAddress(childnode, code);
                            }
                        }
                    });
                }
            }
        });
    }
    getDataAddress5(data, code) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === "div") {
                this.getDataAddress6(childnode, code);
            }
        });
    }
    getDataAddress6(data, code) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === "div") {
                this.getDataAddress7(childnode, code);
            }
        });
    }
    getDataAddress7(data, code) {
        let dataNodes = data.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.nodeName === "#text") {
                if (childnode.value.substring(0, 8) === "Building") {
                }
                else {
                    this.addressArray1.push(code + "--" + childnode.value);
                }
            }
        });
    }
    getDataRoomNumInfo(data, code) {
        let document = parse5.parse(data);
        let dataNodes = document.childNodes;
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === "html") {
                this.getAll(childnode, code);
            }
        });
    }
    getAll(data, code) {
        let dataNodes = data.childNodes;
        let res = [];
        dataNodes.forEach((childnode) => {
            if (childnode.tagName === null || childnode.tagName === undefined || childnode.length === 0) {
            }
            else if (childnode.tagName !== "tr") {
                this.getAll(childnode, code);
            }
            else {
                res.push(childnode);
            }
        });
        if (res.length !== 0) {
            if (res === undefined) {
            }
            else {
                this.getAll2(res, code);
            }
        }
    }
    getAll2(prom, code) {
        let c1 = "odd";
        let c2 = "even";
        let c3 = "even views-row-last";
        let c4 = "odd views-row-last";
        let c5 = "even views-row-first";
        let c6 = "odd views-row-first";
        let c7 = "odd views-row-first views-row-last";
        let res = [];
        prom.forEach((datatr) => {
            if (typeof datatr.attrs !== "undefined") {
                datatr.attrs.forEach((at) => {
                    if (datatr.attrs.length >= 1) {
                        let x = at.value;
                        if (x === c1 || x === c2 || x === c3 || x === c4 || x === c5 || x === c6 || x === c7) {
                            res.push(datatr);
                        }
                    }
                });
            }
        });
        if (res.length !== 0) {
            if (res === undefined) {
            }
            else {
                this.getAll3(res, code);
            }
        }
    }
    getAll3(prom, code) {
        let l1 = "views-field views-field-field-room-number";
        let l2 = "views-field views-field-field-room-capacity";
        let l3 = "views-field views-field-field-room-type";
        let l4 = "views-field views-field-field-room-furniture";
        let promises = [];
        let promises2 = [];
        prom.forEach((datar) => {
            let x = datar.childNodes;
            x.forEach((dats) => {
                if (dats.tagName === "td") {
                    if (typeof dats.attrs !== "undefined") {
                        dats.attrs.forEach((atr) => {
                            if (atr.value === l1 || atr.value === l2 || atr.value === l3 || atr.value === l4) {
                                promises.push(dats);
                            }
                        });
                    }
                }
            });
        });
        if (promises.length !== 0) {
            if (promises === undefined) {
            }
            else {
                this.getAll4(promises, code);
            }
        }
    }
    getAll4(prom, code) {
        let res = [];
        prom.forEach((data2) => {
            let hreftex = "";
            let x = data2.childNodes;
            x.forEach((cnodes) => {
                if (cnodes.tagName === "a") {
                    let y = cnodes.attrs;
                    let z = cnodes.childNodes;
                    z.forEach((tex2) => {
                        if (tex2.nodeName === "#text") {
                            res.push(code + "-" + tex2.value);
                        }
                    });
                    y.forEach((tex) => {
                        if (tex.name === "href") {
                            res.push(code + ":" + tex.value);
                        }
                    });
                }
                else {
                    let str = cnodes.value.replace(/\s/g, "");
                    let str2 = cnodes.value.trim();
                    res.push(code + ":" + str2);
                }
            });
        });
        if (res.length !== 0) {
            if (res === undefined) {
            }
            else {
                res.forEach((x) => {
                    let regex = /.*:/;
                    if (x === regex) {
                    }
                    else {
                    }
                });
                this.mixArray1.push(res);
            }
        }
    }
    addRooms(data, code, shortCodeArray, id) {
        let that = this;
        that.getDataNames(data, code);
        that.getDataRoomNumInfo(data, code);
    }
    addDataset(id, content, kind) {
        let that = this;
        let promises = [];
        return new Promise(function (resolve, reject) {
            if (typeof id !== "string" || typeof content !== "string" || kind === undefined || kind === null) {
                reject(new IInsightFacade_1.InsightError("Invalid params"));
            }
            if (that.coursesMap.has(id) || that.roomsMap.has(id)) {
                return reject(new IInsightFacade_1.InsightError("Id is already added"));
            }
            if (!id || id.length === 0 || id === "") {
                return reject(new IInsightFacade_1.InsightError("Invalid Id"));
            }
            if (kind === IInsightFacade_1.InsightDatasetKind.Rooms) {
                that.roomsMap.set(id, []);
                JSZip.loadAsync(content, { base64: true }).then((zipRooms) => __awaiter(this, void 0, void 0, function* () {
                    let promiseRooms = yield zipRooms.file("index.htm").async("text");
                    that.addRoomLinks(promiseRooms, id);
                    let resultSaver = [];
                    let shortCodeArray = [];
                    let roomCodes = Array.from(that.linksMap.keys());
                    roomCodes.forEach((code) => {
                        shortCodeArray.push(code);
                        let value = that.linksMap.get(code);
                        let subs = value[0].slice(2, 47);
                        resultSaver.push(zipRooms.file(subs).async("text").then((datax) => {
                            that.addRooms(datax, code, shortCodeArray, id);
                        }).catch((e) => {
                            return reject(new IInsightFacade_1.InsightError("Error in adding roomsdataset " + e));
                        }));
                    });
                    Promise.all(resultSaver).then((t) => __awaiter(this, void 0, void 0, function* () {
                        let res = yield that.placeData(id, shortCodeArray);
                        res.forEach((x) => {
                            x.forEach((y) => {
                                that.roomsMap.get(id).push(y);
                            });
                        });
                        let toSaveOnDisk = that.roomsMap.get(id);
                        fs.writeFile("data/" + id + ".json", JSON.stringify(toSaveOnDisk), function (e) {
                            return reject(new IInsightFacade_1.InsightError("Error Saving Files " + e));
                        });
                        let result = [];
                        that.roomsMap.forEach(function (value, key) {
                            result.push(key);
                        });
                        let poth = process.cwd() + "/data";
                        let k = fs.readdirSync(poth);
                        k.forEach((rex) => {
                            if (rex.match(/.*json/) && !rex.match(id + ".json")) {
                                let dat = rex.replace(/\.json/, "");
                                result.push(dat);
                            }
                        });
                        return resolve(result);
                    })).catch((e) => {
                    });
                })).catch((e) => {
                    that.roomsMap.delete(id);
                    return reject(new IInsightFacade_1.InsightError("Error decoding contents of rooms: Invalid Zip " + e));
                });
            }
            else if (kind === IInsightFacade_1.InsightDatasetKind.Courses) {
                that.coursesMap.set(id, []);
                JSZip.loadAsync(content, { base64: true }).then((unzipped) => {
                    let filesPromise = [];
                    if (unzipped.files.hasOwnProperty("courses/") || unzipped.length > 0) {
                        unzipped.forEach((function (relativePath, fileObject) {
                            filesPromise.push(fileObject.async("text").then((data) => {
                                try {
                                    let parsedInfo = JSON.parse(data);
                                    if ((parsedInfo.result.length === 0)) {
                                        throw new Error("None to store");
                                    }
                                    parsedInfo.result.forEach(function (section) {
                                        let dept = section.Subject;
                                        let iid = section.Course;
                                        let avg = section.Avg;
                                        let instructor = section.Professor;
                                        let title = section.Title;
                                        let pass = section.Pass;
                                        let fail = section.Fail;
                                        let audit = section.Audit;
                                        let uuid = section.id.toString();
                                        let year = Number(section.Year);
                                        let sec = section.Section;
                                        if (sec === "overall") {
                                            let validCourse = {
                                                dept: String,
                                                id: String,
                                                avg: Number,
                                                instructor: String,
                                                title: String,
                                                pass: Number,
                                                fail: Number,
                                                audit: Number,
                                                uuid: String,
                                                year: Number
                                            };
                                            validCourse.dept = dept;
                                            validCourse.id = iid;
                                            validCourse.avg = avg;
                                            validCourse.instructor = instructor;
                                            validCourse.title = title;
                                            validCourse.pass = pass;
                                            validCourse.fail = fail;
                                            validCourse.audit = audit;
                                            validCourse.uuid = uuid;
                                            validCourse.year = 1900;
                                            that.coursesMap.get(id).push(validCourse);
                                            that.mydatasets.set(id, validCourse);
                                        }
                                        else {
                                            let validCourse = {
                                                dept: String,
                                                id: String,
                                                avg: Number,
                                                instructor: String,
                                                title: String,
                                                pass: Number,
                                                fail: Number,
                                                audit: Number,
                                                uuid: String,
                                                year: Number
                                            };
                                            validCourse.dept = dept;
                                            validCourse.id = iid;
                                            validCourse.avg = avg;
                                            validCourse.instructor = instructor;
                                            validCourse.title = title;
                                            validCourse.pass = pass;
                                            validCourse.fail = fail;
                                            validCourse.audit = audit;
                                            validCourse.uuid = uuid;
                                            validCourse.year = year;
                                            that.coursesMap.get(id).push(validCourse);
                                            that.mydatasets.set(id, validCourse);
                                        }
                                    });
                                }
                                catch (e) {
                                }
                            }).catch((e) => {
                                return reject(new IInsightFacade_1.InsightError("Error in adding coursesdataset " + e));
                            }));
                        }));
                    }
                    else {
                        that.coursesMap.delete(id);
                        return reject(new IInsightFacade_1.InsightError("Desired folder for the dataset kind does not exist"));
                    }
                    Promise.all(filesPromise).then(function () {
                        let toSaveOnDisk = that.coursesMap.get(id);
                        fs.writeFile("data/" + id + ".json", JSON.stringify(toSaveOnDisk), function (e) {
                            return reject(new IInsightFacade_1.InsightError("Error Saving Files " + e));
                        });
                        let result = [];
                        that.coursesMap.forEach(function (value, key) {
                            result.push(key);
                        });
                        let poth = process.cwd() + "/data";
                        let x = fs.readdirSync(poth);
                        x.forEach((res) => {
                            if (res.match(/.*json/) && !res.match(id + ".json")) {
                                let dat = res.replace(/\.json/, "");
                                result.push(dat);
                            }
                        });
                        return resolve(result);
                    });
                }).catch((e) => {
                    that.coursesMap.delete(id);
                    return reject(new IInsightFacade_1.InsightError("Error decoding contents of courses: Invalid Zip " + e));
                });
            }
        });
    }
    removeDataset(id) {
        let that = this;
        return new Promise(function (resolve, reject) {
            let x = process.cwd() + "/data/" + id + ".json";
            if (id === "") {
                return reject(new IInsightFacade_1.InsightError("Invalid ID"));
            }
            else if (id === null || !id) {
                return reject(new IInsightFacade_1.InsightError("Invalid ID"));
            }
            else if (id === "rooms") {
                if ((!that.roomsMap.has(id))) {
                    return reject(new IInsightFacade_1.NotFoundError("NotFound: Id not in Map"));
                }
            }
            else if (id === "courses") {
                if (!that.coursesMap.has(id)) {
                    return reject(new IInsightFacade_1.NotFoundError("NotFound: Id not in Map"));
                }
            }
            if (that.roomsMap.has(id)) {
                fs.unlink(x, function (err) {
                    if (err) {
                        return reject(new IInsightFacade_1.NotFoundError("NotFound: Dataset has not yet been loaded"));
                    }
                    else {
                        that.roomsMap.delete(id);
                        return resolve(id);
                    }
                });
            }
            else if (that.coursesMap.has(id)) {
                fs.unlink(x, function (err) {
                    if (err) {
                        return reject(new IInsightFacade_1.NotFoundError("NotFound: Dataset has not yet been loaded"));
                    }
                    else {
                        that.coursesMap.delete(id);
                        return resolve(id);
                    }
                });
            }
        });
    }
    performQuery(query) {
        let that = this;
        return new Promise(function (resolve, reject) {
            try {
                let filter = query.WHERE;
                let options = query.OPTIONS;
                let order = options.ORDER;
                let columns = options.COLUMNS;
                let transformations = query.TRANSFORMATIONS;
                let id = columns[0].split("_")[0];
                let dataset;
                let result;
                if (id === COURSES) {
                    if (Object.keys(filter).length === 0) {
                        result = that.coursesMap.get(id);
                        if (result.length > 5000) {
                            throw new IInsightFacade_1.InsightError("Too many sections in result");
                        }
                    }
                    else {
                        let thisResult = [];
                        for (let section of that.coursesMap.get(id)) {
                            if (InsightFacade.isSectionValid(filter, section, id)) {
                                thisResult.push(section);
                            }
                        }
                        if (thisResult.length > 5000) {
                            throw new IInsightFacade_1.InsightError("Result exceeds 5000 limit");
                        }
                        dataset = thisResult;
                    }
                }
                else if (id === ROOMS) {
                    if (Object.keys(filter).length === 0) {
                        result = that.roomsMap.get(id);
                        if (result.length > 5000) {
                            throw new IInsightFacade_1.InsightError("Too many sections in result");
                        }
                    }
                    else {
                        let thisResult = [];
                        for (let room of that.roomsMap.get(id)) {
                            if (InsightFacade.isSectionValid(filter, room, id)) {
                                thisResult.push(room);
                            }
                        }
                        if (thisResult.length > 5000) {
                            throw new IInsightFacade_1.InsightError("Result exceeds 5000 limit");
                        }
                        dataset = thisResult;
                    }
                }
                for (let q of Object.keys(query)) {
                    if (q !== "WHERE") {
                        if (q !== "OPTIONS") {
                            if (q !== "TRANSFORMATIONS") {
                                throw new IInsightFacade_1.InsightError("Now this should work");
                            }
                        }
                    }
                }
                if (transformations !== undefined && transformations !== null) {
                    let keys = Object.keys(query);
                    if (!Object.keys(transformations).includes("GROUP", 0)) {
                        throw new IInsightFacade_1.InsightError("must have GROUP spelled");
                    }
                    if (!Object.keys(transformations).includes("APPLY")) {
                        throw new IInsightFacade_1.InsightError("must have APPLY spelled");
                    }
                    let transformedDataset = [];
                    let groups = new Map();
                    if (transformations.GROUP === undefined || transformations.GROUP.length === 0) {
                        throw new IInsightFacade_1.InsightError("GROUP must be non-empty array");
                    }
                    if (id === COURSES) {
                        for (let values of dataset) {
                            let groupingVal = "";
                            for (let pair of transformations.GROUP) {
                                if (!query.OPTIONS.COLUMNS.includes(pair) &&
                                    !InsightFacade.validCourseKeyHelper(pair, id)) {
                                    throw new IInsightFacade_1.InsightError("invalid key in GROUP");
                                }
                                let key = pair.split("_")[1];
                                let value = values[key];
                                if (values) {
                                    groupingVal += value;
                                }
                                else {
                                    throw new IInsightFacade_1.InsightError("the pair was not a valid key");
                                }
                            }
                            if (!groups.get(groupingVal)) {
                                groups.set(groupingVal, []);
                            }
                            groups.get(groupingVal).push(values);
                        }
                        for (let group of groups.values()) {
                            let entry = {};
                            for (let pair of transformations.GROUP) {
                                let key = pair.split("_")[1];
                                entry[key] = group[0][key];
                            }
                            let applyKeys = [];
                            for (let object of transformations.APPLY) {
                                let applyKey = Object.keys(object)[0];
                                if (!applyKey.includes("_")) {
                                    if (!applyKeys.includes(applyKey)) {
                                        applyKeys.push(applyKey);
                                    }
                                    else {
                                        throw new IInsightFacade_1.InsightError("Duplicated apply key not allowed");
                                    }
                                }
                                else {
                                    throw new IInsightFacade_1.InsightError("applyKey cannot contain underscore");
                                }
                                let applyToken = Object.keys(object[applyKey])[0];
                                let pair = object[applyKey][applyToken];
                                let key = pair.split("_")[1];
                                let setVal = [];
                                for (let element of group) {
                                    setVal.push(element[key]);
                                }
                                let value;
                                if (applyToken === "MAX") {
                                    value = setVal[0];
                                    value = that.applyMaxHelper(value, setVal);
                                }
                                else if (applyToken === "MIN") {
                                    value = setVal[0];
                                    value = that.applyMinHelper(value, setVal);
                                }
                                else if (applyToken === "SUM") {
                                    let total = new decimal_js_1.Decimal(0);
                                    value = that.applySumHelper(total, setVal);
                                }
                                else if (applyToken === "AVG") {
                                    let sum = new decimal_js_1.Decimal(0);
                                    value = that.applyAverageHelper(sum, setVal);
                                }
                                else if (applyToken === "COUNT") {
                                    let unique = setVal.filter((values, index, self) => {
                                        return self.indexOf(values) === index;
                                    });
                                    value = unique.length;
                                }
                                else {
                                    throw new IInsightFacade_1.InsightError("Token does not exist");
                                }
                                entry[applyKey] = value;
                            }
                            transformedDataset.push(entry);
                        }
                    }
                    else if (id === ROOMS) {
                        for (let values of dataset) {
                            let groupingVal = "";
                            for (let pair of transformations.GROUP) {
                                if (!query.OPTIONS.COLUMNS.includes(pair) &&
                                    !InsightFacade.validCourseKeyHelper(pair, id)) {
                                    throw new IInsightFacade_1.InsightError("invalid key in GROUP");
                                }
                                let value = values[pair];
                                if (values) {
                                    groupingVal += value;
                                }
                                else {
                                    throw new IInsightFacade_1.InsightError("the pair was not a valid key");
                                }
                            }
                            if (!groups.get(groupingVal)) {
                                groups.set(groupingVal, []);
                            }
                            groups.get(groupingVal).push(values);
                        }
                        for (let group of groups.values()) {
                            let entry = {};
                            for (let pair of transformations.GROUP) {
                                entry[pair] = group[0][pair];
                            }
                            let applyKeys = [];
                            for (let object of transformations.APPLY) {
                                let applyKey = Object.keys(object)[0];
                                if (!applyKey.includes("_")) {
                                    if (!applyKeys.includes(applyKey)) {
                                        applyKeys.push(applyKey);
                                    }
                                    else {
                                        throw new IInsightFacade_1.InsightError("Duplicated apply key not allowed");
                                    }
                                }
                                else {
                                    throw new IInsightFacade_1.InsightError("applyKey cannot contain underscore");
                                }
                                let applyToken = Object.keys(object[applyKey])[0];
                                let pair = object[applyKey][applyToken];
                                let setVal = [];
                                for (let element of group) {
                                    setVal.push(element[pair]);
                                }
                                let value;
                                if (applyToken === "MAX") {
                                    value = setVal[0];
                                    value = that.applyMaxHelper(value, setVal);
                                }
                                else if (applyToken === "MIN") {
                                    value = setVal[0];
                                    value = that.applyMinHelper(value, setVal);
                                }
                                else if (applyToken === "SUM") {
                                    let total = new decimal_js_1.Decimal(0);
                                    value = that.applySumHelper(total, setVal);
                                }
                                else if (applyToken === "AVG") {
                                    let sum = new decimal_js_1.Decimal(0);
                                    value = that.applyAverageHelper(sum, setVal);
                                }
                                else if (applyToken === "COUNT") {
                                    let unique = setVal.filter((values, index, self) => {
                                        return self.indexOf(values) === index;
                                    });
                                    value = unique.length;
                                }
                                else {
                                    throw new IInsightFacade_1.InsightError("Token does not exist");
                                }
                                entry[applyKey] = value;
                            }
                            transformedDataset.push(entry);
                        }
                    }
                    dataset = transformedDataset;
                }
                if (columns && columns.length !== 0) {
                    let columnResult = [];
                    if (id === COURSES) {
                        dataset.forEach(function (section) {
                            let columnSection = {};
                            columns.forEach(function (key) {
                                let cols;
                                if (query.TRANSFORMATIONS !== undefined) {
                                    if (key.includes("_")) {
                                        if (query.TRANSFORMATIONS.GROUP !== undefined) {
                                            for (let b of query.TRANSFORMATIONS.GROUP) {
                                                if (b === key) {
                                                    cols = key.split("_")[1];
                                                    break;
                                                }
                                            }
                                            if (cols === undefined) {
                                                throw new IInsightFacade_1.InsightError("Columns didnt map to any GROUP key");
                                            }
                                        }
                                    }
                                    else if (query.TRANSFORMATIONS.APPLY !== undefined) {
                                        for (let a of query.TRANSFORMATIONS.APPLY) {
                                            if (Object.keys(a)[0] === key) {
                                                cols = key;
                                                break;
                                            }
                                        }
                                        if (cols !== key) {
                                            throw new IInsightFacade_1.InsightError("Columns didnt map to any apply key");
                                        }
                                    }
                                    else {
                                        throw new IInsightFacade_1.InsightError("Columns key not in apply");
                                    }
                                }
                                else {
                                    if (key.includes("_")) {
                                        cols = key.split("_")[1];
                                    }
                                    else {
                                        cols = key;
                                    }
                                }
                                columnSection[key] = section[cols];
                            });
                            columnResult.push(columnSection);
                        });
                        result = columnResult;
                    }
                    else if (id === ROOMS) {
                        dataset.forEach(function (room) {
                            let columnRoom = {};
                            columns.forEach(function (key) {
                                let cols;
                                if (query.TRANSFORMATIONS !== undefined) {
                                    if (key.includes("_")) {
                                        if (query.TRANSFORMATIONS.GROUP !== undefined) {
                                            for (let b of query.TRANSFORMATIONS.GROUP) {
                                                if (b === key) {
                                                    cols = key;
                                                    break;
                                                }
                                            }
                                            if (cols === undefined) {
                                                throw new IInsightFacade_1.InsightError("Columns didnt map to any GROUP key");
                                            }
                                        }
                                    }
                                    else if (query.TRANSFORMATIONS.APPLY !== undefined) {
                                        for (let a of query.TRANSFORMATIONS.APPLY) {
                                            if (Object.keys(a)[0] === key) {
                                                cols = key;
                                                break;
                                            }
                                        }
                                        if (cols !== key) {
                                            throw new IInsightFacade_1.InsightError("Columns didnt map to any apply key");
                                        }
                                    }
                                    else {
                                        throw new IInsightFacade_1.InsightError("Columns key not in apply");
                                    }
                                }
                                else {
                                    if (key.includes("_")) {
                                        cols = key;
                                    }
                                    else {
                                        throw new IInsightFacade_1.InsightError("Incorrect KEY format");
                                    }
                                }
                                columnRoom[key] = room[cols];
                            });
                            columnResult.push(columnRoom);
                        });
                        result = columnResult;
                    }
                }
                if (order !== undefined && order !== null) {
                    if (columns.includes(order)) {
                        result = that.Sorter(result, order, columns);
                    }
                    else if (order.dir) {
                        if (order.keys !== undefined) {
                            for (let c of order.keys) {
                                if (!columns.includes(c)) {
                                    throw new IInsightFacade_1.InsightError("NOT IN HERE");
                                }
                            }
                            result = that.Sorter(result, order, columns);
                        }
                        else {
                            throw new IInsightFacade_1.InsightError("SHIT");
                        }
                    }
                    else {
                        throw new IInsightFacade_1.InsightError("goddam");
                    }
                }
                return resolve(result);
            }
            catch (e) {
                return reject(new IInsightFacade_1.InsightError("Error in reading query " + e));
            }
        });
    }
    applyAverageHelper(sum, setVal) {
        for (let values of setVal) {
            sum = sum.add(new decimal_js_1.Decimal(values));
        }
        return Number((Number(sum) / setVal.length).toFixed(2));
    }
    applySumHelper(total, setVal) {
        for (let values of setVal) {
            total = total.add(new decimal_js_1.Decimal(values));
        }
        return Number(total.toFixed(2));
    }
    applyMaxHelper(value, setVal) {
        for (let values of setVal) {
            if (typeof values !== "number") {
                throw new IInsightFacade_1.InsightError("MAX uses nubmers only");
            }
            else {
                if (values > value) {
                    value = values;
                }
            }
        }
        return value;
    }
    applyMinHelper(value, setVal) {
        for (let values of setVal) {
            if (typeof values !== "number") {
                throw new IInsightFacade_1.InsightError("MAX uses nubmers only");
            }
            else {
                if (values < value) {
                    value = values;
                }
            }
        }
        return value;
    }
    Sorter(result, order, columns) {
        let key = order;
        let sorted;
        if (typeof order === "string") {
            if (columns.includes(key)) {
                result.sort((left, right) => {
                    if (left[key] > right[key]) {
                        return 1;
                    }
                    else if (left[key] < right[key]) {
                        return -1;
                    }
                });
            }
            else {
                throw new Error("Order key MUST BE IN COLUMNS");
            }
            sorted = result;
        }
        else {
            let keyOrder = order.keys;
            let cPointer;
            function Larger(left, right, keys) {
                if (!columns.includes(keys)) {
                    throw new IInsightFacade_1.InsightError("Order key MUST BE IN COLUMNS x 2");
                }
                if (left[keys] > right[keys]) {
                    return 1;
                }
                else if (left[keys] < right[keys]) {
                    return -1;
                }
                else {
                    cPointer += 1;
                    if (cPointer < keyOrder.length) {
                        return Larger(left, right, keyOrder[cPointer]);
                    }
                    else {
                        return 0;
                    }
                }
            }
            result.sort((left, right) => {
                cPointer = 0;
                if (order.dir === undefined || order.dir === null) {
                    throw new Error("disgusting");
                }
                else if (order.dir === "DOWN") {
                    return Larger(right, left, keyOrder[cPointer]);
                }
                else if (order.dir === "UP") {
                    return Larger(left, right, keyOrder[cPointer]);
                }
                else {
                    throw new Error("Not even a value");
                }
            });
            sorted = result;
        }
        return sorted;
    }
    static validRoomsKeyHelper(key, id) {
        if (id === COURSES) {
            throw new IInsightFacade_1.InsightError("cannot query courses as rooms");
        }
        switch (key) {
            case id + "_fullname":
                return true;
            case id + "_shortname":
                return true;
            case id + "_number":
                return true;
            case id + "_name":
                return true;
            case id + "_address":
                return true;
            case id + "_lat":
                return true;
            case id + "_lon":
                return true;
            case id + "_seats":
                return true;
            case id + "_type":
                return true;
            case id + "_furniture":
                return true;
            case id + "_href":
                return true;
            default:
                return false;
        }
    }
    static validCourseKeyHelper(key, id) {
        if (id === ROOMS) {
            throw new IInsightFacade_1.InsightError("cannot query rooms as courses");
        }
        switch (key) {
            case id + "_dept":
                return true;
            case id + "_id":
                return true;
            case id + "_instructor":
                return true;
            case id + "_title":
                return true;
            case id + "_uuid":
                return true;
            case id + "_avg":
                return true;
            case id + "_pass":
                return true;
            case id + "_fail":
                return true;
            case id + "_audit":
                return true;
            case id + "_year":
                return true;
            default:
                return false;
        }
    }
    static isSectionValid(filter, section, id) {
        if (filter.hasOwnProperty("AND")) {
            if (filter.AND.length === 0) {
                throw new IInsightFacade_1.InsightError("Not enough conditions for AND");
            }
            for (let insideFilter of filter.AND) {
                if (!this.isSectionValid(insideFilter, section, id)) {
                    return false;
                }
            }
            return true;
        }
        if (filter.hasOwnProperty("OR")) {
            if (filter.OR.length === 0) {
                throw new IInsightFacade_1.InsightError("Not enough conditions for OR");
            }
            for (let insideFilter of filter.OR) {
                if (this.isSectionValid(insideFilter, section, id)) {
                    return true;
                }
            }
            return false;
        }
        if (filter.hasOwnProperty("GT") || filter.hasOwnProperty("LT") || filter.hasOwnProperty("EQ")) {
            let body = Object.values(filter)[0];
            if (typeof Object.values(body)[0] !== "number") {
                throw new IInsightFacade_1.InsightError("Invalid value");
            }
            if (id === "courses") {
                if (!this.validCourseKeyHelper(Object.keys(body)[0], id)) {
                    throw new IInsightFacade_1.InsightError("Invalid Course key");
                }
                switch (Object.keys(body)[0]) {
                    case id + "_dept":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_id":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_instructor":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_title":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_uuid":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    default:
                        break;
                }
            }
            else if (id === "rooms") {
                if (!this.validRoomsKeyHelper(Object.keys(body)[0], id)) {
                    throw new IInsightFacade_1.InsightError("Invalid Rooms key");
                }
                switch (Object.keys(body)[0]) {
                    case id + "_fullname":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_shortname":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_number":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_address":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_type":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_furniture":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_href":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    default:
                        break;
                }
                if (filter.hasOwnProperty("GT")) {
                    if (section[Object.keys(filter.GT)[0]] > Object.values(filter.GT)[0]) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else if (filter.hasOwnProperty("LT")) {
                    if (section[Object.keys(filter.LT)[0]] < Object.values(filter.LT)[0]) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    if (section[Object.keys(filter.EQ)[0]] === Object.values(filter.EQ)[0]) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
            if (filter.hasOwnProperty("GT")) {
                let yup = Object.keys(filter.GT)[0];
                yup = yup.substring(yup.indexOf("_") + 1);
                if (section[yup] > Object.values(filter.GT)[0]) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (filter.hasOwnProperty("LT")) {
                let yup = Object.keys(filter.LT)[0];
                yup = yup.substring(yup.indexOf("_") + 1);
                if (section[yup] < Object.values(filter.LT)[0]) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                let yup = Object.keys(filter.EQ)[0];
                yup = yup.substring(yup.indexOf("_") + 1);
                if (section[yup] === Object.values(filter.EQ)[0]) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        else if (filter.hasOwnProperty("NOT")) {
            return (!this.isSectionValid(filter.NOT, section, id));
        }
        else if (filter.hasOwnProperty("IS")) {
            let key = Object.keys(filter.IS)[0];
            let value = Object.values(filter.IS)[0];
            if (typeof value !== "string") {
                throw new IInsightFacade_1.InsightError("Invalid type");
            }
            if (id === "courses") {
                if (!this.validCourseKeyHelper(key, id)) {
                    throw new IInsightFacade_1.InsightError("Invalid Course key");
                }
                switch (key) {
                    case id + "_avg":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_pass":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_fail":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_year":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_audit":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    default:
                        break;
                }
            }
            else if (id === "rooms") {
                if (!this.validRoomsKeyHelper(key, id)) {
                    throw new IInsightFacade_1.InsightError("Invalid Rooms key");
                }
                switch (key) {
                    case id + "_lat":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_lon":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    case id + "_seats":
                        throw new IInsightFacade_1.InsightError("Not valid key");
                    default:
                        break;
                }
                let actualRoom = section[key];
                if (value.includes("*")) {
                    let valueArray = value.split("*");
                    if (valueArray.length === 2) {
                        if (valueArray[0] === "") {
                            if (valueArray.length > 2) {
                                throw new IInsightFacade_1.InsightError("Asterisks cannot be in the middle");
                            }
                            if (value.startsWith("*")) {
                                return actualRoom.endsWith(value.substring(1));
                            }
                        }
                        if (valueArray[1] === "") {
                            if (valueArray.length > 2) {
                                throw new IInsightFacade_1.InsightError("Asterisks cannot be ");
                            }
                            if (value.endsWith("*")) {
                                return actualRoom.startsWith(value.substring(0, value.length - 1));
                            }
                        }
                        else {
                            throw new IInsightFacade_1.InsightError("Asterisk Error Occured");
                        }
                    }
                    if (valueArray.length === 3 && valueArray[0] === "" && valueArray[2] === "") {
                        if (value.startsWith("*") && value.endsWith("*")) {
                            return actualRoom.includes(value.substring(1, value.length - 1));
                        }
                    }
                    else {
                        throw new IInsightFacade_1.InsightError("Asteriks cannot be in the middle");
                    }
                }
                return value === actualRoom;
            }
            let actualRes = section[key.substring(key.indexOf("_") + 1)];
            if (value.includes("*")) {
                let valueArray = value.split("*");
                if (valueArray.length === 2) {
                    if (valueArray[0] === "") {
                        if (valueArray.length > 2) {
                            throw new IInsightFacade_1.InsightError("Asterisks cannot be in the middle");
                        }
                        if (value.startsWith("*")) {
                            return actualRes.endsWith(value.substring(1));
                        }
                    }
                    if (valueArray[1] === "") {
                        if (valueArray.length > 2) {
                            throw new IInsightFacade_1.InsightError("Asterisks cannot be ");
                        }
                        if (value.endsWith("*")) {
                            return actualRes.startsWith(value.substring(0, value.length - 1));
                        }
                    }
                    else {
                        throw new IInsightFacade_1.InsightError("Asterisk Error Occured");
                    }
                }
                if (valueArray.length === 3 && valueArray[0] === "" && valueArray[2] === "") {
                    if (value.startsWith("*") && value.endsWith("*")) {
                        return actualRes.includes(value.substring(1, value.length - 1));
                    }
                }
                else {
                    throw new IInsightFacade_1.InsightError("Asteriks cannot be in the middle");
                }
            }
            return value === actualRes;
        }
        else {
            if (filter.constructor === Object && Object.keys(filter).length === 0) {
                return false;
            }
            else {
                throw new IInsightFacade_1.InsightError("Did not match any of the keys");
            }
        }
    }
    listDatasets() {
        let that = this;
        return new Promise(function (resolve, reject) {
            let result2 = [];
            for (let id of that.coursesMap.keys()) {
                let crows = that.coursesMap.get(id).length;
                result2.push({ id, kind: IInsightFacade_1.InsightDatasetKind.Courses, numRows: crows });
            }
            for (let id of that.roomsMap.keys()) {
                let crows = that.roomsMap.get(id).length;
                result2.push({ id, kind: IInsightFacade_1.InsightDatasetKind.Rooms, numRows: crows });
            }
            return resolve(result2);
        });
    }
}
InsightFacade.instancefacade = new InsightFacade();
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map