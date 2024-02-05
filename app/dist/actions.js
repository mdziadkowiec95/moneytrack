"use server";
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
exports.addNewAccount = exports.updateTransaction = exports.addNewTransaction = void 0;
var auth_1 = require("@/utils/auth");
var db_1 = require("@/utils/db");
var client_1 = require("@prisma/client");
var navigation_1 = require("next/navigation");
var zod_1 = require("zod");
var baseTransactionSchema = zod_1.z.object({
    title: zod_1.z.string(),
    amount: zod_1.z.number(),
    date: zod_1.z.string(),
    type: zod_1.z["enum"]([client_1.TransactionType.INCOME, client_1.TransactionType.OUTCOME])
});
var addTransactionSchema = baseTransactionSchema;
var editTransactionSchema = baseTransactionSchema.merge(zod_1.z.object({
    id: zod_1.z.string()
}));
function addNewTransaction(formData) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var session, transaction, transactions, lastTransaction, balance, createNewTransactionQuery, balanceUpdateAction, updateAffectedFinanceSourceHistoryBalancesQuery;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, auth_1.getAuthServerSession()];
                case 1:
                    session = _c.sent();
                    // @TODO try to type the user object in auth
                    if (!(session === null || session === void 0 ? void 0 : session.user.id)) {
                        throw new Error("User not authenticated");
                    }
                    transaction = {
                        title: formData.get("title"),
                        amount: Number(formData.get("amount")),
                        date: formData.get("date"),
                        type: formData.get("type"),
                        financeSourceId: formData.get("financeSourceId")
                    };
                    addTransactionSchema.parse(transaction); // Validate the transaction data
                    return [4 /*yield*/, db_1.db.transaction.findMany({
                            where: {
                                date: {
                                    lte: new Date(transaction.date)
                                }
                            },
                            include: {
                                financeSourceHistory: true
                            },
                            orderBy: {
                                date: "desc"
                            },
                            take: 1
                        })];
                case 2:
                    transactions = _c.sent();
                    lastTransaction = transactions[0];
                    balance = 0;
                    // If there is previous transaction THEN calculate the new balance based on the previous transaction balance
                    if (lastTransaction) {
                        balance = (_a = lastTransaction.financeSourceHistory) === null || _a === void 0 ? void 0 : _a.balance;
                    }
                    createNewTransactionQuery = db_1.db.transaction.create({
                        data: {
                            title: transaction.title,
                            amount: transaction.amount,
                            date: transaction.date,
                            type: transaction.type,
                            userId: session === null || session === void 0 ? void 0 : session.user.id,
                            financeSourceId: transaction.financeSourceId,
                            financeSourceHistory: {
                                create: {
                                    financeSourceId: transaction.financeSourceId,
                                    balance: balance,
                                    userId: session === null || session === void 0 ? void 0 : session.user.id
                                }
                            }
                        }
                    });
                    balanceUpdateAction = transaction.type === client_1.TransactionType.INCOME ? "increment" : "decrement";
                    updateAffectedFinanceSourceHistoryBalancesQuery = db_1.db.financeSourceHistory.updateMany({
                        where: {
                            financeSourceId: transaction.financeSourceId,
                            transaction: {
                                date: {
                                    gte: new Date(transaction.date)
                                }
                            }
                        },
                        data: {
                            balance: (_b = {},
                                _b[balanceUpdateAction] = transaction.amount,
                                _b)
                        }
                    });
                    return [4 /*yield*/, db_1.db.$transaction([
                            createNewTransactionQuery,
                            updateAffectedFinanceSourceHistoryBalancesQuery,
                        ])];
                case 3:
                    _c.sent();
                    navigation_1.redirect("/app/transactions");
                    return [2 /*return*/];
            }
        });
    });
}
exports.addNewTransaction = addNewTransaction;
function updateTransaction(formData) {
    return __awaiter(this, void 0, void 0, function () {
        var session, transaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auth_1.getAuthServerSession()];
                case 1:
                    session = _a.sent();
                    // @TODO try to type the user object in auth
                    if (!(session === null || session === void 0 ? void 0 : session.user.id)) {
                        throw new Error("User not authenticated");
                    }
                    transaction = {
                        id: formData.get("id"),
                        title: formData.get("title"),
                        amount: Number(formData.get("amount")),
                        date: formData.get("date"),
                        type: formData.get("type"),
                        financeSourceId: formData.get("financeSourceId")
                    };
                    editTransactionSchema.parse(transaction); // Validate the transaction data
                    if (!transaction.id) return [3 /*break*/, 3];
                    return [4 /*yield*/, db_1.db.transaction.update({
                            where: {
                                id: transaction.id,
                                userId: session === null || session === void 0 ? void 0 : session.user.id
                            },
                            data: {
                                id: transaction.id,
                                title: transaction.title,
                                amount: transaction.amount,
                                date: transaction.date,
                                type: transaction.type,
                                financeSourceId: transaction.financeSourceId
                            }
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    // TODO - should redirect to transaction VIEW page
                    navigation_1.redirect("/app/transactions");
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateTransaction = updateTransaction;
function addNewAccount(formData) {
    return __awaiter(this, void 0, void 0, function () {
        var session, account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, auth_1.getAuthServerSession()];
                case 1:
                    session = _a.sent();
                    // @TODO try to type the user object in auth
                    if (!(session === null || session === void 0 ? void 0 : session.user.id)) {
                        throw new Error("User not authenticated");
                    }
                    account = {
                        name: formData.get("name"),
                        financeSourceType: formData.get("financeSourceType")
                    };
                    return [4 /*yield*/, db_1.db.financeSource.create({
                            data: {
                                name: account.name,
                                currency: "PLN",
                                type: account.financeSourceType,
                                balance: 0,
                                userId: session === null || session === void 0 ? void 0 : session.user.id,
                                financeSourceHistories: {
                                    create: {
                                        balance: 0,
                                        userId: session === null || session === void 0 ? void 0 : session.user.id
                                    }
                                }
                            }
                        })];
                case 2:
                    _a.sent();
                    navigation_1.redirect("/app/accounts");
                    return [2 /*return*/];
            }
        });
    });
}
exports.addNewAccount = addNewAccount;
