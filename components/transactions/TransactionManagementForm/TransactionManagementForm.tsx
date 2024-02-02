"use client";

import { useRef, useState } from "react";
import * as Form from "@radix-ui/react-form";
import { MinusCircledIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Button, Heading, TextField } from "@radix-ui/themes";

import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { addNewTransaction, updateTransaction } from "@/app/actions";
import { TransactionType } from "@prisma/client";

type TransationManagementFormState = {
  type: TransactionType;
  date: DateValueType;
  amount?: number;
  title: string;
};

type InitialData = TransationManagementFormState & {
  id: string;
  date: Date;
};

const isIncome = (type: TransactionType) => type === TransactionType.INCOME;

const toggleGroupItemClasses =
  "hover:bg-black-200 color-mauve11 flex h-[35px] px-3 items-center justify-center data-[state=on]:bg-white data-[state=on]:text-black text-base leading-4 first:rounded-l last:rounded-r focus:z-10 ";

const TransactionManagementForm = ({
  initialData,
}: {
  initialData?: InitialData;
}) => {
  const [formState, updateFormState] = useState<TransationManagementFormState>(
    () => {
      const initialState: TransationManagementFormState = {
        type: TransactionType.INCOME,
        date: {
          startDate: new Date(new Date()),
          endDate: new Date(new Date()),
        },
        amount: undefined,
        title: "",
      };

      if (initialData) {
        initialState.type = initialData.type;

        if (initialData.date) {
          initialState.date = {
            startDate: new Date(initialData.date),
            endDate: new Date(initialData.date),
          };
        }

        initialState.amount = initialData.amount;
        initialState.title = initialData.title;
      }

      return initialState;
    }
  );

  const prevAmount = useRef(formState.amount || 0);

  const onDateChange = (newDate: DateValueType) => {
    console.log("onDateChang");
    updateFormState((state) => ({
      ...state,
      date: newDate,
    }));
  };

  const onSimpleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormState((state) => ({
      ...state,
      [event.target.name]: event.target.value,
    }));
  };

  const onAmountFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    let newValue = Number(value);

    if (isNaN(Number(value)) || !Number.isSafeInteger(Number(value))) {
      newValue = prevAmount.current;
    }

    if (newValue && newValue < 0) {
      newValue = 0;
    }

    prevAmount.current = newValue;

    updateFormState((state) => ({
      ...state,
      [event.target.name]: newValue,
    }));
  };

  const onSubmit = (formData: FormData) => {
    const transactionDate = formState.date?.startDate
      ? new Date(formState.date.startDate)
      : new Date();

    formData.set("date", transactionDate.toISOString());
    formData.set("type", formState.type);

    if (!initialData) {
      addNewTransaction(formData);
    } else {
      formData.set("id", initialData.id);

      updateTransaction(formData);
    }
  };

  return (
    <div>
      <Heading size="4">
        Add new {isIncome(formState.type) ? "Income" : "Outcome"}
      </Heading>
      <Form.Root className="w-[260px]" action={onSubmit}>
        <ToggleGroup.Root
          className="inline-flex rounded  shadow-gray-500 shadow-[0_1px_2px] "
          type="single"
          defaultValue="outcome"
          onValueChange={(selectedType: TransactionType) => {
            // Only allow changing tab when there is a value selected
            if (selectedType) {
              updateFormState({
                ...formState,
                type: selectedType,
              });
            }
          }}
          value={formState.type}
          aria-label="Text alignment"
        >
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value={TransactionType.OUTCOME}
            aria-label="Center aligned"
          >
            Outcome
          </ToggleGroup.Item>
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value={TransactionType.INCOME}
            aria-label="Left aligned"
          >
            Income
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <Form.Field className="grid mb-[10px]" name="amount">
          <div className="flex items-baseline justify-between">
            <Form.Label>Amount</Form.Label>
          </div>
          <div className="relative">
            <TextField.Root>
              <TextField.Slot gap="6">
                {!isIncome(formState.type) ? (
                  <MinusCircledIcon className="text-red-500" />
                ) : (
                  <PlusCircledIcon className="text-green-500" />
                )}
              </TextField.Slot>
              <Form.Control asChild>
                <TextField.Input
                  size="3"
                  className="pl-6"
                  required
                  onChange={onAmountFieldChange}
                  value={formState.amount}
                  min={0}
                  type="text"
                  inputMode="numeric"
                  placeholder="Amount"
                />
              </Form.Control>
            </TextField.Root>
          </div>
        </Form.Field>

        <Form.Field className="grid mb-[10px]" name="title">
          <div className="flex items-baseline justify-between">
            <Form.Label>Title</Form.Label>
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
              value={formState.title}
              placeholder="Title"
            />
          </Form.Control>
        </Form.Field>
        <Form.Field className="grid mb-[10px]" name="title">
          <Form.Label>Date</Form.Label>
          {formState.date && (
            <Datepicker
              inputName="date"
              useRange={false}
              asSingle={true}
              value={formState.date}
              onChange={onDateChange}
            />
          )}
        </Form.Field>

        <Form.Submit asChild>
          <Button>Save</Button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default TransactionManagementForm;
