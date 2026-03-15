/**
 * Calculate the expected delivery date based on service days and service times
 * @param serviceDays - Comma-separated string of days (e.g., "Monday, Wednesday, Friday")
 * @param serviceTimes - Time range string (e.g., "3PM to 7PM" or "9AM to 5PM")
 * @returns Date object representing the expected delivery date
 */
export function calculateDeliveryDate(
  serviceDays: string,
  serviceTimes: string
): Date {
  const now = new Date();
  
  // Parse service days
  const availableDays = serviceDays
    .split(",")
    .map((day) => day.trim().toLowerCase());
  
  // Parse service times
  const timeMatch = serviceTimes.match(/(\d+)\s*(AM|PM)\s*to\s*(\d+)\s*(AM|PM)/i);
  console.log(timeMatch)
  
  if (!timeMatch) {
    // If time format is invalid, return next available day
    return getNextAvailableDay(now, availableDays);
  }
  
  const startHour = convertTo24Hour(parseInt(timeMatch[1]), timeMatch[2]);
  const endHour = convertTo24Hour(parseInt(timeMatch[3]), timeMatch[4]);
  
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentDayName = getDayName(now.getDay()).toLowerCase();
  
  // Check if today is a service day
  if (availableDays.includes(currentDayName)) {
    // Check if current time is within service hours
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    const endTimeInMinutes = endHour * 60;
    
    if (currentTimeInMinutes < endTimeInMinutes) {
      // Order can be delivered today
      return now;
    }
  }
  
  // Order cannot be delivered today, find next available day
  return getNextAvailableDay(now, availableDays);
}

/**
 * Get the next available service day
 */
function getNextAvailableDay(currentDate: Date, availableDays: string[]): Date {
  const dayNameMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  
  // Convert available days to day numbers
  const availableDayNumbers = availableDays
    .map((day) => dayNameMap[day])
    .filter((num) => num !== undefined)
    .sort((a, b) => a - b);
  
  if (availableDayNumbers.length === 0) {
    // No valid service days, return tomorrow
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  const currentDay = currentDate.getDay();
  let daysToAdd = 0;
  
  // Find the next available day
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (availableDayNumbers.includes(nextDay)) {
      daysToAdd = i;
      break;
    }
  }
  
  const deliveryDate = new Date(currentDate);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  deliveryDate.setHours(0, 0, 0, 0); // Set to start of day
  
  return deliveryDate;
}

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(hour: number, period: string): number {
  if (period.toUpperCase() === "PM" && hour !== 12) {
    return hour + 12;
  }
  if (period.toUpperCase() === "AM" && hour === 12) {
    return 0;
  }
  return hour;
}

/**
 * Get day name from day number
 */
function getDayName(dayNumber: number): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayNumber];
}

/**
 * Format delivery date for display
 * @param date - Date object
 * @returns Formatted string (e.g., "Monday, March 4, 2026")
 */
export function formatDeliveryDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Get relative delivery time string
 * @param date - Date object
 * @returns String like "Today", "Tomorrow", or formatted date
 */
export function getRelativeDeliveryTime(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deliveryDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = deliveryDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else if (diffDays <= 7) {
    return `in ${diffDays} days`;
  } else {
    return formatDeliveryDate(date);
  }
}
