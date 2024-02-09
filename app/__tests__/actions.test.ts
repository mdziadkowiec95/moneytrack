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
      {
        transaction: {
          createdAt: "asc",
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

const addNewTransactionUsingAction = async (
  data: Partial<
    Transaction & {
      date: Date;
    }
  >
) => {
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

const updateTransactionUsingAction = async (data: Partial<Transaction>) => {
  const formData = new FormData();

  formData.append("id", data.id);
  formData.append("title", data.title);
  formData.append("amount", data.amount);
  formData.append("description", data.description);
  formData.append("date", data.date?.toISOString());
  formData.append("type", data.type);
  formData.append("financeSourceId", financeSource.id);

  await updateTransaction(formData);
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
      await addNewTransactionUsingAction({
        title: "Integration Test 1 INCOME",
        amount: 1000,
        date: new Date(2024, 1, 7, 0, 0, 0),
        type: TransactionType.INCOME,
        financeSourceId: financeSource.id,
      });

      const transactionsInDB = await db.transaction.findMany({
        where: { title: "Integration Test 1 INCOME" },
      });

      expect(transactionsInDB).toHaveLength(1);

      expect(transactionsInDB[0]).toEqual({
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
      await addNewTransactionUsingAction({
        title: "Integration Test 1 INCOME",
        amount: 1000,
        date: new Date(2024, 1, 7, 0, 0, 0),
        type: TransactionType.INCOME,
        financeSourceId: financeSource.id,
      });

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
      // Add first transaction
      await addNewTransactionUsingAction({
        title: "Integration Test 1 INCOME",
        amount: "300",
        date: new Date(2024, 1, 7, 0, 0, 0),
        type: TransactionType.INCOME,
        financeSourceId: financeSource.id,
      });

      const financeSourceHistoriesAfterFristTransaction =
        await getFinanceSourceHistories();

      expect(financeSourceHistoriesAfterFristTransaction).toHaveLength(1);
      expect(financeSourceHistoriesAfterFristTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 300,
        })
      );

      // Add second transaction
      await addNewTransactionUsingAction({
        title: "Integration Test 2 OUTCOME",
        amount: "50",
        date: new Date(2024, 1, 7, 2, 0, 0),
        type: TransactionType.OUTCOME,
        financeSourceId: financeSource.id,
      });

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
      // Add first transaction
      await addNewTransactionUsingAction({
        title: "Integration Test 1 INCOME",
        amount: "500",
        date: new Date(2024, 1, 7, 0, 0, 0),
        type: TransactionType.INCOME,
        financeSourceId: financeSource.id,
      });

      const financeSourceHistoriesAfterFristTransaction =
        await getFinanceSourceHistories();

      expect(financeSourceHistoriesAfterFristTransaction).toHaveLength(1);
      expect(financeSourceHistoriesAfterFristTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );

      await addNewTransactionUsingAction({
        title: "Integration Test 2 OUTCOME",
        amount: "150",
        date: new Date(2024, 1, 8, 2, 0, 0),
        type: TransactionType.OUTCOME,
        financeSourceId: financeSource.id,
      });

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

      await addNewTransactionUsingAction({
        title: "Integration Test 3 OUTCOME",
        amount: "20",
        date: new Date(2024, 1, 3, 2, 0, 0),
        type: TransactionType.OUTCOME,
        financeSourceId: financeSource.id,
      });

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
      await addNewTransactionUsingAction({
        title: "Integration Test 1 INCOME",
        amount: "500",
        date: new Date(2024, 1, 7, 0, 0, 0),
        type: TransactionType.INCOME,
        financeSourceId: financeSource.id,
      });

      const financeSourceHistoriesAfterFristTransaction =
        await getFinanceSourceHistories();
      expect(financeSourceHistoriesAfterFristTransaction).toHaveLength(1);
      expect(financeSourceHistoriesAfterFristTransaction[0]).toEqual(
        expect.objectContaining({
          balance: 500,
        })
      );

      await addNewTransactionUsingAction({
        title: "Integration Test 2 OUTCOME",
        amount: "150",
        date: new Date(2024, 1, 8, 2, 0, 0),
        type: TransactionType.OUTCOME,
        financeSourceId: financeSource.id,
      });

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
      await addNewTransactionUsingAction({
        title: "Integration Test 1 INCOME",
        amount: "10",
        date: new Date(2024, 1, 7, 0, 0, 0),
        type: TransactionType.INCOME,
        financeSourceId: financeSource.id,
      });

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
    await addNewTransactionUsingAction({
      title: "Integration Test 1 INCOME",
      amount: "500",
      date: new Date(2024, 1, 7, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
    });

    const [firstTransaction] = await getAllTransactions();

    await updateTransactionUsingAction({
      id: firstTransaction.id,
      title: "Integration Test 1 INCOME Updated",
      amount: 1000,
      description: "Example description",
      date: new Date(2024, 1, 7, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
    });

    const allTransactions = await getAllTransactions();

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

  test("should update balances properly when updating transaction which is the most recent and date does not change", async () => {
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

    await updateTransactionUsingAction({
      id: secondTransaction.id,
      title: "Integration Test 2 OUTCOME Updated",
      amount: 700,
      description: "Example description",
      date: new Date(2024, 1, 7, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
    });

    const allTransactionsAfterUpdate = await db.transaction.findMany({
      orderBy: {
        date: "asc",
      },
    });

    const financeSourceHistories = await getFinanceSourceHistories();

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

  test("should update balances properly when updating transaction which is the most recent and changing date to the past", async () => {
    await addNewTransactionUsingAction({
      title: "Integration Test 1 INCOME",
      amount: 150,
      date: new Date(2024, 1, 5, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Integration Test 2 OUTCOME",
      amount: 400,
      date: new Date(2024, 1, 6, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Integration Test 3 INCOME",
      amount: 300,
      date: new Date(2024, 1, 7, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    const initialTransactions = await getAllTransactions();

    const [, , thirdTransaction] = initialTransactions;

    expect(initialTransactions).toHaveLength(3);

    await updateTransactionUsingAction({
      id: thirdTransaction.id,
      title: "Integration Test 3 OUTCOME Updated",
      amount: 700,
      description: "Example description",
      date: new Date(2024, 1, 3, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
    });

    const allTransactionsAfterUpdate = await getAllTransactions();

    const financeSourceHistories = await getFinanceSourceHistories();

    expect(allTransactionsAfterUpdate).toHaveLength(3);
    expect(allTransactionsAfterUpdate[0]).toEqual({
      amount: 700,
      createdAt: expect.any(Date),
      date: new Date("2024-02-02T23:00:00.000Z"),
      description: "Example description",
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[0].id,
      title: "Integration Test 3 OUTCOME Updated",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(financeSourceHistories).toHaveLength(3);
    expect(financeSourceHistories[0]).toEqual(
      expect.objectContaining({ balance: -700 })
    );
    expect(financeSourceHistories[1]).toEqual(
      expect.objectContaining({ balance: -550 })
    );
    expect(financeSourceHistories[2]).toEqual(
      expect.objectContaining({ balance: -950 })
    );
  });

  test("should update balances properly when updating transaction which is the oldest one changing date to the future as last one", async () => {
    await addNewTransactionUsingAction({
      title: "Test 1 OUTCOME",
      amount: 150,
      date: new Date(2024, 1, 6, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 2 INCOME",
      amount: 500,
      date: new Date(2024, 1, 7, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 3 INCOME",
      amount: 300,
      date: new Date(2024, 1, 5, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    const financeSourceHistoriesBefore = await getFinanceSourceHistories();

    const initialTransactions = await getAllTransactions();

    const [oldestTransaction] = initialTransactions;

    expect(initialTransactions).toHaveLength(3);

    await updateTransactionUsingAction({
      id: oldestTransaction.id,
      title: "Test 3 OUTCOME Updated",
      amount: 350,
      description: "Example description",
      date: new Date(2024, 1, 8, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
    });

    const allTransactionsAfterUpdate = await getAllTransactions();
    const financeSourceHistories = await getFinanceSourceHistories();

    expect(allTransactionsAfterUpdate).toHaveLength(3);
    expect(allTransactionsAfterUpdate[0]).toEqual({
      amount: 150,
      createdAt: expect.any(Date),
      date: new Date(2024, 1, 6, 0, 0, 0),
      description: null,
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[0].id,
      title: "Test 1 OUTCOME",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(allTransactionsAfterUpdate[2]).toEqual({
      amount: 350,
      createdAt: expect.any(Date),
      date: new Date(2024, 1, 8, 0, 0, 0),
      description: "Example description",
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[2].id,
      title: "Test 3 OUTCOME Updated",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(financeSourceHistories).toHaveLength(3);
    expect(financeSourceHistories[0]).toEqual(
      expect.objectContaining({ balance: -150 })
    );
    expect(financeSourceHistories[1]).toEqual(
      expect.objectContaining({ balance: 350 })
    );
    expect(financeSourceHistories[2]).toEqual(
      expect.objectContaining({ balance: 0 })
    );
  });

  test("should update balances properly when updating transaction which is the oldest changing date to the future but middle", async () => {
    await addNewTransactionUsingAction({
      title: "Test 1 OUTCOME",
      amount: 800,
      date: new Date(2024, 1, 6, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 2 INCOME",
      amount: 200,
      date: new Date(2024, 1, 9, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 3 INCOME",
      amount: 500,
      date: new Date(2024, 1, 13, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    const financeSourceHistoriesBefore = await getFinanceSourceHistories();

    const initialTransactions = await getAllTransactions();

    const [firstTransaction] = initialTransactions;

    expect(initialTransactions).toHaveLength(3);

    await updateTransactionUsingAction({
      id: firstTransaction.id,
      title: "Test 1 OUTCOME Updated",
      amount: 400,
      description: "Example description",
      date: new Date(2024, 1, 11, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
    });

    const allTransactionsAfterUpdate = await getAllTransactions();
    const financeSourceHistories = await getFinanceSourceHistories();

    expect(allTransactionsAfterUpdate).toHaveLength(3);
    expect(allTransactionsAfterUpdate[0]).toEqual({
      amount: 200,
      createdAt: expect.any(Date),
      date: new Date(2024, 1, 9, 0, 0, 0),
      description: null,
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[0].id,
      title: "Test 2 INCOME",
      type: TransactionType.INCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(allTransactionsAfterUpdate[2]).toEqual({
      amount: 500,
      createdAt: expect.any(Date),
      date: new Date(2024, 1, 13, 0, 0, 0),
      description: null,
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[2].id,
      title: "Test 3 INCOME",
      type: TransactionType.INCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(financeSourceHistories).toHaveLength(3);
    expect(financeSourceHistories[0]).toEqual(
      expect.objectContaining({ balance: 200 })
    );
    expect(financeSourceHistories[1]).toEqual(
      expect.objectContaining({ balance: -200 })
    );
    expect(financeSourceHistories[2]).toEqual(
      expect.objectContaining({ balance: 300 })
    );

    // -800 -> -600 -> -100
    // 200 -> -200 -> 300
  });
  test("should update balances properly when updating transaction which is in the middle recent and changing date to the same date as many others in the future", async () => {
    await addNewTransactionUsingAction({
      title: "Test 1 OUTCOME",
      amount: 100,
      date: new Date(2024, 1, 6, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 2 INCOME",
      amount: 300,
      date: new Date(2024, 1, 8, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 3 INCOME",
      amount: 200,
      date: new Date(2024, 1, 9, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    await addNewTransactionUsingAction({
      title: "Test 4 INCOME",
      amount: 500,
      date: new Date(2024, 1, 13, 0, 0, 0),
      type: TransactionType.INCOME,
      financeSourceId: financeSource.id,
      userId: user.id,
    });

    const financeSourceHistoriesBefore = await getFinanceSourceHistories();

    const initialTransactions = await getAllTransactions();

    const [, secondTransaction] = initialTransactions;

    expect(initialTransactions).toHaveLength(4);

    await updateTransactionUsingAction({
      id: secondTransaction.id,
      title: "Test 2 INCOME Updated",
      amount: 400,
      description: "Example description",
      date: new Date(2024, 1, 9, 0, 0, 0),
      type: TransactionType.OUTCOME,
      financeSourceId: financeSource.id,
    });

    const allTransactionsAfterUpdate = await getAllTransactions();
    const financeSourceHistories = await getFinanceSourceHistories();

    expect(allTransactionsAfterUpdate).toHaveLength(4);
    expect(allTransactionsAfterUpdate[0]).toEqual({
      amount: 100,
      createdAt: expect.any(Date),
      date: new Date(2024, 1, 6, 0, 0, 0),
      description: null,
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[0].id,
      title: "Test 1 OUTCOME",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(allTransactionsAfterUpdate[2]).toEqual({
      amount: 400,
      createdAt: expect.any(Date),
      date: new Date(2024, 1, 9, 0, 0, 0),
      description: "Example description",
      financeSourceId: financeSource.id,
      id: allTransactionsAfterUpdate[2].id,
      title: "Test 2 INCOME Updated",
      type: TransactionType.OUTCOME,
      updatedAt: expect.any(Date),
      userId: user.id,
    });

    expect(financeSourceHistories).toHaveLength(4);
    expect(financeSourceHistories[0]).toEqual(
      expect.objectContaining({ balance: -100 })
    );
    expect(financeSourceHistories[1]).toEqual(
      expect.objectContaining({ balance: 100 })
    );
    expect(financeSourceHistories[2]).toEqual(
      expect.objectContaining({ balance: -300 })
    );
    expect(financeSourceHistories[3]).toEqual(
      expect.objectContaining({ balance: 200 })
    );
  });
});
