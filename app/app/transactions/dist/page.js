"use strict";
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
var auth_1 = require("@/utils/auth");
var db_1 = require("@/utils/db");
var client_1 = require("@prisma/client");
var themes_1 = require("@radix-ui/themes");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var Transactions = function () { return __awaiter(void 0, void 0, void 0, function () {
    var session, transactions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, auth_1.getAuthServerSession()];
            case 1:
                session = _a.sent();
                if (!(session === null || session === void 0 ? void 0 : session.user.id)) {
                    return [2 /*return*/, navigation_1.redirect("/api/auth/signin")];
                }
                return [4 /*yield*/, db_1.db.transaction.findMany({
                        where: { userId: session.user.id }
                    })];
            case 2:
                transactions = _a.sent();
                return [2 /*return*/, (React.createElement(themes_1.Grid, { className: "my-6" }, transactions.map(function (transaction) { return (React.createElement(themes_1.Card, { asChild: true },
                        React.createElement(link_1["default"], { href: "/app/transactions/edit/" + transaction.id },
                            React.createElement(themes_1.Flex, { gap: "3", align: "center" },
                                React.createElement(themes_1.Avatar, { size: "3", src: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop", radius: "full", fallback: "T" }),
                                React.createElement(themes_1.Box, null,
                                    React.createElement(themes_1.Text, { as: "p", size: "2", weight: "bold" }, transaction.title),
                                    React.createElement(themes_1.Text, { as: "p", size: "2", color: "gray" },
                                        transaction.type === client_1.TransactionType.INCOME ? "+" : "-",
                                        " ",
                                        transaction.amount,
                                        " PLN")))))); })))];
        }
    });
}); };
exports["default"] = Transactions;
