"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var pg_1 = require("pg");
var lodash_1 = require("lodash");
// During run, initialize app with pool. Each request gets a new AppDbTx.
// During tests, initialize app with AppDBTx. Each request get a nested AppDBTx
// WARNING: This is not parallelizable. In other words, a transaction should
// only safely spawn transactions from the same thread.
var DBTxManager = /** @class */ (function () {
    function DBTxManager(client) {
        this.savepoint = 0;
        this.client = client;
    }
    DBTxManager.prototype.begin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var txNumber;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.savepoint === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.query('BEGIN')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.client.query("SAVEPOINT sp" + this.savepoint)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        txNumber = this.savepoint;
                        this.savepoint += 1;
                        return [2 /*return*/, txNumber];
                }
            });
        });
    };
    DBTxManager.prototype.rollbackTx = function (savepoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(savepoint === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.query('ROLLBACK')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.client.query("ROLLBACK TO SAVEPOINT sp" + savepoint)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.savepoint = savepoint;
                        return [2 /*return*/];
                }
            });
        });
    };
    DBTxManager.prototype.commit = function (savepoint) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(savepoint === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.query('COMMIT')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.client.query("RELEASE SAVEPOINT sp" + savepoint)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        this.savepoint = savepoint;
                        return [2 /*return*/];
                }
            });
        });
    };
    return DBTxManager;
}());
exports.DBTxManager = DBTxManager;
var DBClientManager = /** @class */ (function () {
    function DBClientManager(pool) {
        this.pool = pool;
    }
    DBClientManager.prototype.releaseClient = function (client) {
        client.release();
    };
    DBClientManager.prototype.newConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, txManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        txManager = new DBTxManager(client);
                        return [2 /*return*/, [client, txManager]];
                }
            });
        });
    };
    return DBClientManager;
}());
exports.DBClientManager = DBClientManager;
var TestDBClientManager = /** @class */ (function (_super) {
    __extends(TestDBClientManager, _super);
    function TestDBClientManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TestDBClientManager.prototype.releaseClient = function (_client) {
        // do not release clients during testing, so we can roll the
        // transactions back in tests rather than on the server.
    };
    TestDBClientManager.prototype.newConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client, txManager;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.client === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        this.client = client;
                        _a.label = 2;
                    case 2:
                        if (!(this.txManager == undefined)) return [3 /*break*/, 4];
                        txManager = new DBTxManager(this.client);
                        return [4 /*yield*/, txManager.begin()];
                    case 3:
                        _a.sent();
                        this.txManager = txManager;
                        _a.label = 4;
                    case 4: return [2 /*return*/, [this.client, this.txManager]];
                }
            });
        });
    };
    TestDBClientManager.prototype.rollbackAndRelease = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.txManager !== undefined) {
                    this.txManager.rollbackTx(0);
                }
                if (this.client !== undefined) {
                    this.client.release();
                }
                return [2 /*return*/];
            });
        });
    };
    return TestDBClientManager;
}(DBClientManager));
exports.TestDBClientManager = TestDBClientManager;
exports.makeDBPool = function () { return new pg_1.Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
    database: process.env.PGDATABASE,
    // ssl: { ca: '', cert: '', },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
}); };
exports.makeDBClientManager = function () { return new DBClientManager(exports.makeDBPool()); };
exports.prepareDBInsert = function (values) {
    var dbColumns = {};
    values.forEach(function (insert) { return Object.keys(insert).forEach(function (k) { return dbColumns[k] = true; }); });
    var columns = Object.keys(dbColumns);
    var prep = values.map(function (_val, i) {
        return '(' + columns.map(function (_k, j) {
            return "$" + (i * columns.length + j + 1);
        }).join(', ') + ')';
    }).join(', ');
    var pgValues = lodash_1.flatten(values.map(function (val) { return columns.map(function (c) { return val[c]; }); }));
    return {
        columns: columns.map(function (c) { return lodash_1.snakeCase(c); }).join(', '),
        prep: prep,
        values: pgValues
    };
};
exports.prepareDBUpdate = function (values) {
    var definedValues = lodash_1.pickBy(values, function (v) { return v !== undefined; });
    var dbValues = Object.keys(definedValues).reduce(function (prev, k) {
        var _a;
        return (__assign(__assign({}, prev), (_a = {}, _a[lodash_1.snakeCase(k)] = definedValues[k], _a)));
    }, {});
    var dbColumns = Object.keys(dbValues);
    var prep = dbColumns.map(function (c, i) { return c + " = $" + (i + 1); }).join(', ');
    var pgValues = dbColumns.map(function (c) { return dbValues[c]; });
    return { prep: prep, values: pgValues };
};
exports.makeDBFields = function (attrs) { return attrs.map(function (attr) { return lodash_1.snakeCase(attr); }); };
exports.makeSelectFields = function (dbFields, table) {
    return dbFields.map(function (field) { return table + "." + field; }).join(', ');
};
var makeDBFieldsToAttr = function (attrs) {
    return attrs.reduce(function (prev, attr) {
        var _a;
        return (__assign(__assign({}, prev), (_a = {}, _a[lodash_1.snakeCase(attr)] = attr, _a)));
    }, {});
};
exports.makeDBDataToObject = function (attrs, __typename) {
    var dbFieldsToAttr = makeDBFieldsToAttr(attrs);
    return function (row) {
        return Object.keys(row).reduce(function (prev, dbField) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[dbFieldsToAttr[dbField]] = row[dbField], _a)));
        }, { __typename: __typename });
    };
};
