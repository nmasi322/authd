export default (date: { minutes?: number; hours?: number; days?: number }) => {
  let totalTimeInMillsec = 0;
  if (date.minutes && typeof date.minutes === "number") {
    totalTimeInMillsec += date.minutes * 1000 * 60;
  }
  if (date.hours && typeof date.hours === "number") {
    totalTimeInMillsec += date.hours * 1000 * 60 * 60;
  }
  if (date.days && typeof date.days === "number") {
    totalTimeInMillsec += date.days * 1000 * 60 * 60 * 24;
  }
  return totalTimeInMillsec;
};
