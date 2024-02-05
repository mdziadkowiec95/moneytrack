import { getCurrentLocale } from "./locale";

export const getMonthNames = () => {
  const monthNames = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(2000, index);
    const monthName = new Intl.DateTimeFormat(getCurrentLocale(), {
      month: "long",
    }).format(date);

    return monthName;
  });

  return monthNames;
};

export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 0);
  const daysInMonth = date.getDate();
  const daysArray = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );
  return daysArray;
};
