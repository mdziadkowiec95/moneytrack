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
import { addNewAccount, addNewTransaction } from "../actions";

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
let firstFinanceSourceHistoryRecord: FinanceSourceHistory;

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
  // await restoreDB();

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
  // await restoreDB();

  await db.$disconnect();
});

describe("adding first transaction", () => {
  test.only("should create new transaction properly when no transactions added yet", async () => {
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
      date: new Date("2024-02-06T23:00:00.000Z"),
      description: null,
      financeSourceId: financeSource.id,
      title: "Integration Test 1 INCOME",
      type: TransactionType.INCOME,
      userId: user.id,
    });
  });

  test.only("should create related finance source history entry with updated balance", async () => {
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

describe("updating balance", () => {
  afterEach(async () => {
    await restoreTransactions();
  });

  test.only("should update balance history properly when adding new transaction in the future", async () => {
    const formData = new FormData();

    formData.append("title", "Integration Test 1 INCOME");
    formData.append("amount", "300");
    formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
    formData.append("type", TransactionType.INCOME);
    formData.append("financeSourceId", financeSource.id);

    // Add first transaction
    await addNewTransaction(formData);

    const financeSourceHistoriesAfterFristTransaction =
      await db.financeSourceHistory.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
      });

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

  test.only("should update balance history properly when adding new transaction in the past", async () => {
    const formData = new FormData();

    formData.append("title", "Integration Test 1 INCOME");
    formData.append("amount", "500");
    formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
    formData.append("type", TransactionType.INCOME);
    formData.append("financeSourceId", financeSource.id);

    // Add first transaction
    await addNewTransaction(formData);

    const financeSourceHistoriesAfterFristTransaction =
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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

  test.only("should update balance history properly when adding new transaction in the exactly the same time as existing history record", async () => {
    const formData = new FormData();

    formData.append("title", "Integration Test 1 INCOME");
    formData.append("amount", "500");
    formData.append("date", new Date(2024, 1, 7, 0, 0, 0).toISOString());
    formData.append("type", TransactionType.INCOME);
    formData.append("financeSourceId", financeSource.id);

    // Add first transaction
    await addNewTransaction(formData);

    const financeSourceHistoriesAfterFristTransaction =
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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
      await db.financeSourceHistory.findMany({
        where: {
          financeSourceId: financeSource.id,
          userId: user.id,
        },
        orderBy: {
          transaction: {
            date: "asc",
          },
        },
      });

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
