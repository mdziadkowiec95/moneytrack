"use client";

import { useState } from "react";
import * as Form from "@radix-ui/react-form";
import {
  MinusCircledIcon,
  PlusCircledIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
} from "@radix-ui/react-icons";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { Heading } from "@radix-ui/themes";

import Datepicker from "react-tailwindcss-datepicker";
import { addNewTransaction } from "@/app/actions";

// id          String          @id @default(uuid())
// type        TransactionType
// title       String
// description String?
// createdAt   DateTime        @default(now())
// date        DateTime
// }

type TransactionType = "income" | "outcome";

type AddNewTransationFormState = {
  type: TransactionType;
};

const isIncome = (type: TransactionType) => type === "income";

const toggleGroupItemClasses =
  "hover:bg-violet3 color-mauve11 bg-violet flex h-[35px] px-3 items-center justify-center bg-white data-[state=on]:bg-violet-200 text-base leading-4 first:rounded-l last:rounded-r focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none";

const AddNewTransactionForm = () => {
  const [formState, updateFormState] = useState<AddNewTransationFormState>({
    type: "income",
    date: {
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  return (
    <div>
      <Heading size="4">
        Add new {isIncome(formState.type) ? "Income" : "Outcome"}
      </Heading>
      <Form.Root
        className="w-[260px]"
        action={(formData) => {
          formData.set("date", formState.date.startDate);

          addNewTransaction(formData);
        }}
      >
        <ToggleGroup.Root
          className="inline-flex bg-mauve6 rounded shadow-[0_2px_10px] shadow-blackA4 space-x-px"
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
            value="outcome"
            aria-label="Center aligned"
          >
            Outcome
          </ToggleGroup.Item>
          <ToggleGroup.Item
            className={toggleGroupItemClasses}
            value="income"
            aria-label="Left aligned"
          >
            Income
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <Form.Field className="grid mb-[10px]" name="title">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-[15px] font-medium leading-[35px] text-black">
              Amount
            </Form.Label>
          </div>
          <div className="relative">
            {!isIncome(formState.type) ? (
              <MinusCircledIcon className="absolute text-red-500 bottom-1/2 left-2 translate-y-1/2" />
            ) : (
              <PlusCircledIcon className="absolute text-green-500 bottom-1/2 left-2 translate-y-1/2" />
            )}
            <Form.Control asChild>
              <input
                type="number"
                min={0}
                onChange={(event) => {
                  console.log(`-${event.target.value}`);
                }}
                className="pl-7 box-border w-full bg-blackA2 shadow-blackA6 inline-flex appearance-none items-center justify-center rounded-[4px] p-[10px] text-[15px] leading-none text-black shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA6 resize-none"
                required
              />
            </Form.Control>
          </div>
        </Form.Field>

        <Form.Field className="grid mb-[10px]" name="title">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-[15px] font-medium leading-[35px] text-black">
              Title
            </Form.Label>
            {/* <Form.Message
            className="text-[13px] text-black opacity-[0.8]"
            match="valueMissing"
          >
            Please enter a question
          </Form.Message> */}
          </div>
          <Form.Control asChild>
            <input
              className="box-border w-full bg-blackA2 shadow-blackA6 inline-flex appearance-none items-center justify-center rounded-[4px] p-[10px] text-[15px] leading-none text-black shadow-[0_0_0_1px] outline-none hover:shadow-[0_0_0_1px_black] focus:shadow-[0_0_0_2px_black] selection:color-white selection:bg-blackA6 resize-none"
              required
            />
          </Form.Control>
        </Form.Field>
        {console.log(formState.date)}
        <Datepicker
          useRange={false}
          asSingle={true}
          value={formState.date}
          onChange={(newDate) => {
            console.log(newDate);
            updateFormState((s) => ({
              ...s,
              date: newDate,
            }));

            console.log(newDate);
          }}
        />

        <Form.Submit asChild>
          <button className="box-border w-full text-violet11 shadow-blackA4 hover:bg-mauve3 inline-flex h-[35px] items-center justify-center rounded-[4px] bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none mt-[10px]">
            Save
          </button>
        </Form.Submit>
      </Form.Root>
    </div>
  );
};

export default AddNewTransactionForm;
