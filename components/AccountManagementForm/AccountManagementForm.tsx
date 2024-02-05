"use client";

import { use, useEffect, useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Button, Heading, Select, TextField } from "@radix-ui/themes";

import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import {
  addNewAccount,
  addNewTransaction,
  updateTransaction,
} from "@/app/actions";
import {
  FinanceSource,
  FinanceSourceType,
  TransactionType,
} from "@prisma/client";
import { db } from "@/utils/db";
import { useSession } from "next-auth/react";

const ACCOUNTS = [
  {
    name: "Cash",
    value: FinanceSourceType.CASH,
  },
  {
    name: "Bank",
    value: FinanceSourceType.BANK_ACCOUNT,
  },
  {
    name: "Investment",
    value: FinanceSourceType.INVESTMENT,
  },
];

type TransationManagementFormState = {
  name?: string;
  financeSourceType?: FinanceSourceType;
};

type InitialData = TransationManagementFormState & {
  id: string;
  financeSourceType: FinanceSourceType;
};

const toggleGroupItemClasses =
  "hover:bg-black-200 color-mauve11 flex h-[35px] px-3 items-center justify-center data-[state=on]:bg-white data-[state=on]:text-black text-base leading-4 first:rounded-l last:rounded-r focus:z-10 ";

const AccountManagementForm = ({
  initialData,
}: {
  initialData?: InitialData;
}) => {
  const session = useSession();
  const [formState, updateFormState] = useState<TransationManagementFormState>(
    () => {
      const initialState: TransationManagementFormState = {
        name: undefined,
        financeSourceType: ACCOUNTS[0].value,
      };

      return initialState;
    }
  );

  const [accounts, setAccounts] = useState<FinanceSourceType[]>([
    "CASH",
    "BANK_ACCOUNT",
    "INVESTMENT",
  ]);

  const onAccountChange = (financeSourceType: FinanceSourceType) => {
    if (!financeSourceType) return;

    updateFormState((state) => ({
      ...state,
      financeSourceType,
    }));
  };

  const onSimpleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }));
  };

  const onSubmit = (formData: FormData) => {
    console.log(formData.get("name"));
    console.log(formData.get("accountType"));

    addNewAccount(formData);
    // const transactionDate = formState.date?.startDate
    //   ? new Date(formState.date.startDate)
    //   : new Date();
    // formData.set("date", transactionDate.toISOString());
    // formData.set("type", formState.type);
    // if (!initialData) {
    //   addNewTransaction(formData);
    // } else {
    //   formData.set("id", initialData.id);
    //   updateTransaction(formData);
    // }
  };

  return (
    <div>
      <Heading size="4">Add new Account</Heading>
      <Form.Root className="w-[260px]" action={onSubmit}>
        <Form.Field name="financeSourceId">
          <div className="flex items-baseline justify-between">
            <Form.Label>Account</Form.Label>
          </div>

          <Select.Root
            name="financeSourceType"
            // defaultValue={formState.accountId}
            value={formState.financeSourceType}
            onValueChange={onAccountChange}
          >
            <Select.Trigger />
            <Select.Content>
              {ACCOUNTS.map((accountType) => (
                <Select.Item key={accountType.value} value={accountType.value}>
                  {accountType.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Form.Field>

        <Form.Field className="grid mb-[10px]" name="name">
          <div className="flex items-baseline justify-between">
            <Form.Label>Name</Form.Label>
            {/* <Form.Message
            className="text-[13px] text-black opacity-[0.8]"
            match="valueMissing"
          >
            Please enter a question
          </Form.Message> */}
          </div>
          <Form.Control asChild>
            <TextField.Input
              size="3"
              required
              onChange={onSimpleFieldChange}
              value={formState.name}
              placeholder="Name"
            />
          </Form.Control>
        </Form.Field>

        <Form.Submit asChild>
          <Button>Save</Button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default AccountManagementForm;
