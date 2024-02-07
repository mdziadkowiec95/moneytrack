import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { db } from "@/utils/db";
import {
  FinanceSource,
  FinanceSourceHistory,
  FinanceSourceType,
  Transaction,
  TransactionType,
  User,
} from "@prisma/client";
import { getAuthServerSession } from "@/utils/auth";
import {
  addNewAccount,
  addNewTransaction,
  updateTransaction,
} from "../actions";
import { a } from "vitest/dist/suite-ghspeorC.js";
import { add } from "date-fns";

vi.mock("@/utils/auth", () => {
  return {
    getAuthServerSession: vi.fn(async () => ({
      user: {
        id: 1,
      },
    })),
  };
});

vi.mock("next/navigation", () => {
  return {
    redirect: vi.fn(),
  };
});

let financeSource: FinanceSource;
let user: User;

const getFinanceSourceHistories = async () =>
  db.financeSourceHistory.findMany({
    where: {
      financeSourceId: financeSource.id,
      userId: user.id,
    },
    include: {
      transaction: true,
    },
    orderBy: [
      {
        transaction: {
          date: "asc",
        },
      },
      {
        transaction: {
          updatedAt: "asc",
        },
      },
    ],
  });

const getAllTransactions = async () =>
  db.transaction.findMany({
    orderBy: {
      date: "asc",
    },
  });

const restoreTransactions = async () => {
  const deleteTransactions = db.transaction.deleteMany();
  const deleteFinanceSourceHistories = db.financeSourceHistory.deleteMany();
  // const deleteFinanceSources = db.financeSource.deleteMany();

  await db.$transaction([
    deleteTransactions,
    deleteFinanceSourceHistories,
    // deleteFinanceSources,
  ]);
};

const restoreDB = async () => {
  const deleteTransactions = db.transaction.deleteMany();
  const deleteFinanceSources = db.financeSource.deleteMany();
  const deleteFinanceSourceHistories = db.financeSourceHistory.deleteMany({});

  const deleteUsers = db.user.deleteMany();

  await db.$transaction([
    deleteTransactions,
    deleteFinanceSourceHistories,
    deleteFinanceSources,
    deleteUsers,
  ]);
};

const createAccount = async () => {
  const accountFormData = new FormData();

  accountFormData.append("name", "Cash");
  accountFormData.append("financeSourceType", FinanceSourceType.CASH);

  await addNewAccount(accountFormData);

  return await db.financeSource.findFirst({
    where: {
      name: "Cash",
    },
  });
};

beforeEach(async () => {
  user = await db.user.create({
    data: {
      email: "integration_test_1@mailinator.com",
      password: "test1234",
      username: "integration_test_1",
      firstName: "Integration",
      lastName: "Test",
    },
  });

  //@ts-expect-error - fix this later
  getAuthServerSession.mockResolvedValue({ user });

  financeSource = await createAccount();
});

afterEach(async () => {
  vi.clearAllMocks();

  await restoreDB();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("addNewTransaction", () => {
  describe("when adding first transaction", () => {
    test("should create new transaction properly when no transactions added yet", async () => {
      const formData = new FormData();

      formData.append("title", "Integration Test 1 INCOME");
      formData.append("amount", "1000");
      formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
      formData.append("type", TransactionType.INCOME);
      formData.append("financeSourceId", financeSource.id);

      await addNewTransaction(formData);

      const tranasctionsInDB = await db.transaction.findMany({
        where: { title: "Integration Test 1 INCOME" },
      });

      expect(tranasctionsInDB).toHaveLength(1);

      expect(tranasctionsInDB[0]).toEqual({
        id: expect.any(String),
        amount: 1000,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        date: new Date("2024-02-06T23:00:00.000Z"),
        description: null,
        financeSourceId: financeSource.id,
        title: "Integration Test 1 INCOME",
        type: TransactionType.INCOME,
        userId: user.id,
      });
    });

    test("should create related finance source history entry with updated balance", async () => {
      const formData = new FormData();

      formData.append("title", "Integration Test 1 INCOME");
      formData.append("amount", "1000");
      formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
      formData.append("type", TransactionType.INCOME);
      formData.append("financeSourceId", financeSource.id);

      await addNewTransaction(formData);

      const transactions = await db.transaction.findMany({
        include: {
          financeSourceHistory: true,
        },
      });

      expect(transactions).toHaveLength(1);

      expect(transactions[0].financeSourceHistory).toEqual({
        id: expect.any(String),
        balance: 1000,
        financeSourceId: financeSource.id,
        transactionId: transactions[0].id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userId: user.id,
      });
    });
  });

  describe("when updating balance", () => {
    test("should update balance history properly when adding new transaction in the future", async () => {
      const formData = new FormData();

      formData.append("title", "Integration Test 1 INCOME");
      formData.append("amount", "300");
      formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
      formData.append("type", TransactionType.INCOME);
      formData.append("financeSourceId", financeSource.id);

      // Add first transaction
      await addNewTransaction(formData);

      const financeSourceHistoriesAfterFristTransaction =
        await getFinanceSourceHistories();

      expect(financeSourceHistoriesAfterFristTransaction).toHaveLength(1);
      expect(financeSourceHistoriesAfterFristTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 300,
        })
      );

      const formData2 = new FormData();

      formData2.append("title", "Integration Test 2 OUTCOME");
      formData2.append("amount", "50");
      formData2.append("date", new Date(2024, 1, 7, 2, 0, 0).toISOString());
      formData2.append("type", TransactionType.OUTCOME);
      formData2.append("financeSourceId", financeSource.id);

      // Add second transaction
      await addNewTransaction(formData2);

      const financeSourceHistoriesAfterSecondTransaction =
        await getFinanceSourceHistories();
      // Verify balance
      expect(financeSourceHistoriesAfterSecondTransaction).toHaveLength(2);
      expect(financeSourceHistoriesAfterSecondTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 300,
        })
      );
      expect(financeSourceHistoriesAfterSecondTransaction[1]).toEqual(
        expect.objectContaining({
          balance: 250,
        })
      );
    });

    test("should update balance history properly when adding new transaction in the past", async () => {
      const formData = new FormData();

      formData.append("title", "Integration Test 1 INCOME");
      formData.append("amount", "500");
      formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
      formData.append("type", TransactionType.INCOME);
      formData.append("financeSourceId", financeSource.id);

      // Add first transaction
      await addNewTransaction(formData);

      const financeSourceHistoriesAfterFristTransaction =
        await getFinanceSourceHistories();

      expect(financeSourceHistoriesAfterFristTransaction).toHaveLength(1);
      expect(financeSourceHistoriesAfterFristTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );

      const formData2 = new FormData();

      formData2.append("title", "Integration Test 2 OUTCOME");
      formData2.append("amount", "150");
      formData2.append("date", new Date(2024, 1, 8, 2, 0, 0).toISOString());
      formData2.append("type", TransactionType.OUTCOME);
      formData2.append("financeSourceId", financeSource.id);

      // Add second transaction
      await addNewTransaction(formData2);

      const financeSourceHistoriesAfterSecondTransaction =
        await getFinanceSourceHistories();

      // Verify balance
      expect(financeSourceHistoriesAfterSecondTransaction).toHaveLength(2);

      expect(financeSourceHistoriesAfterSecondTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );
      expect(financeSourceHistoriesAfterSecondTransaction[1]).toEqual(
        expect.objectContaining({
          balance: 350,
        })
      );

      const formData3 = new FormData();

      formData3.append("title", "Integration Test 3 OUTCOME");
      formData3.append("amount", "20");
      formData3.append("date", new Date(2024, 1, 3, 2, 0, 0).toISOString());
      formData3.append("type", TransactionType.OUTCOME);
      formData3.append("financeSourceId", financeSource.id);

      // Add second transaction
      await addNewTransaction(formData3);

      const financeSourceHistoriesAfterThirdTransaction =
        await getFinanceSourceHistories();

      // Verify balance
      expect(financeSourceHistoriesAfterThirdTransaction).toHaveLength(3);
      expect(financeSourceHistoriesAfterThirdTransaction[0]).toEqual(
        expect.objectContaining({
          balance: -20,
        })
      );
      expect(financeSourceHistoriesAfterThirdTransaction[1]).toEqual(
        expect.objectContaining({
          balance: 480,
        })
      );
      expect(financeSourceHistoriesAfterThirdTransaction[2]).toEqual(
        expect.objectContaining({
          balance: 330,
        })
      );
    });

    test("should update balance history properly when adding new transaction in the exactly the same time as existing history record", async () => {
      const formData = new FormData();

      formData.append("title", "Integration Test 1 INCOME");
      formData.append("amount", "500");
      formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
      formData.append("type", TransactionType.INCOME);
      formData.append("financeSourceId", financeSource.id);

      // Add first transaction
      await addNewTransaction(formData);

      const financeSourceHistoriesAfterFristTransaction =
        await getFinanceSourceHistories();
      expect(financeSourceHistoriesAfterFristTransaction).toHaveLength(1);
      expect(financeSourceHistoriesAfterFristTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );

      const formData2 = new FormData();

      formData2.append("title", "Integration Test 2 OUTCOME");
      formData2.append("amount", "150");
      formData2.append("date", new Date(2024, 1, 8, 2, 0, 0).toISOString());
      formData2.append("type", TransactionType.OUTCOME);
      formData2.append("financeSourceId", financeSource.id);

      // Add second transaction
      await addNewTransaction(formData2);

      const financeSourceHistoriesAfterSecondTransaction =
        await getFinanceSourceHistories();
      // Verify balance
      expect(financeSourceHistoriesAfterSecondTransaction).toHaveLength(2);

      expect(financeSourceHistoriesAfterSecondTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );
      expect(financeSourceHistoriesAfterSecondTransaction[1]).toEqual(
        expect.objectContaining({
          balance: 350,
        })
      );

      // Add third transaction with the same date as the first transaction
      const formData3 = new FormData();

      formData3.append("title", "Integration Test 1 INCOME");
      formData3.append("amount", "10");
      formData3.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
      formData3.append("type", TransactionType.INCOME);
      formData3.append("financeSourceId", financeSource.id);

      // Add first transaction
      await addNewTransaction(formData3);

      const financeSourceHistoriesAfterThirdTransaction =
        await getFinanceSourceHistories();

      expect(financeSourceHistoriesAfterThirdTransaction).toHaveLength(3);
      expect(financeSourceHistoriesAfterThirdTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );
      expect(financeSourceHistoriesAfterThirdTransaction[1]).toEqual(
        expect.objectContaining({
          balance: 510,
        })
      );
      expect(financeSourceHistoriesAfterThirdTransaction[2]).toEqual(
        expect.objectContaining({
          balance: 360,
        })
      );
    });
  });
});

describe("updateTransaction", () => {
  test("should update transaction properly", async () => {
    const formData = new FormData();

    formData.append("title", "Integration Test 1 INCOME");
    formData.append("amount", "500");
    formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
    formData.append("type", TransactionType.INCOME);
    formData.append("financeSourceId", financeSource.id);

    await addNewTransaction(formData);

    const [firstTransaction] = await getAllTransactions();

    const formDataUpdate = new FormData();

    formDataUpdate.append("id", firstTransaction.id);
    formDataUpdate.append("title", "Integration Test 1 INCOME Updated");
    formDataUpdate.append("amount", "1000");
    formDataUpdate.append("description", "Example description");
    formDataUpdate.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
    formDataUpdate.append("type", TransactionType.OUTCOME);
    formDataUpdate.append("financeSourceId", financeSource.id);

    // Mock any dependencies or external functions used by the action

    // Call the updateTransaction action
    await updateTransaction(formDataUpdate);

    const allTransactions = await getAllTransactions();

    console.log({ allTransactions });

    expect(allTransactions).toHaveLength(1);
    expect(allTransactions[0]).toEqual({
      amount: 1000,
      createdAt: expect.any(Date),
      date: new Date("2024-02-06T23:00:00.000Z"),
      description: "Example description",
      financeSourceId: financeSource.id,
      id: firstTransaction.id,
      title: "Integration Test 1 INCOME Updated",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });
  });

  test("should update balances properly when updating transaction which is the most recent without changing date", async () => {
    const addNewTransactionUsingAction = async (data: Partial<Transaction>) => {
      const formData = new FormData();

      formData.append("id", data.id);
      formData.append("title", data.title);
      formData.append("amount", data.amount);
      formData.append("description", data.description);
      formData.append("date", data.date?.toISOString());
      formData.append("type", data.type);
      formData.append("financeSourceId", financeSource.id);

      await addNewTransaction(formData);
    };

    await addNewTransactionUsingAction({
      title: "Integration Test 1 INCOME",
      amount: 150,
      date: new Date(2024, 1, 6, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Integration Test 2 OUTCOME",
      amount: 300,
      date: new Date(2024, 1, 7, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    const initialTransactions = await getAllTransactions();

    const [, secondTransaction] = initialTransactions;

    expect(initialTransactions).toHaveLength(2);

    const formData = new FormData();

    formData.append("id", secondTransaction.id);
    formData.append("title", "Integration Test 2 OUTCOME Updated");
    formData.append("amount", "700");
    formData.append("description", "Example description");
    formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
    formData.append("type", TransactionType.OUTCOME);
    formData.append("financeSourceId", financeSource.id);

    // Call the updateTransaction action
    await updateTransaction(formData);

    const allTransactionsAfterUpdate = await db.transaction.findMany({
      orderBy: {
        date: "asc",
      },
    });

    const financeSourceHistories = await getFinanceSourceHistories();

    console.log({ financeSourceHistories });

    expect(allTransactionsAfterUpdate).toHaveLength(2);
    expect(allTransactionsAfterUpdate[1]).toEqual({
      amount: 700,
      createdAt: expect.any(Date),
      date: new Date("2024-02-06T23:00:00.000Z"),
      description: "Example description",
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[1].id,
      title: "Integration Test 2 OUTCOME Updated",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(financeSourceHistories).toHaveLength(2);
    expect(financeSourceHistories[0]).toEqual(
      expect.objectContaining({ balance: 150 })
    );
    expect(financeSourceHistories[1]).toEqual(
      expect.objectContaining({ balance: -550 })
    );
  });

  // test("should update balances properly when updating transaction which is the most recent and changing date to the past", async () => {});
  // test("should update balances properly when updating transaction which is the oldest one changing date to the future", async () => {});
  // test("should update balances properly when updating transaction which is in the middle recent and changing date to the future", async () => {});
  // test("should update balances properly when updating transaction which is in the middle recent and changing date to the same date as many others", async () => {});
});
