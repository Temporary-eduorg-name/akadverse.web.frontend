import React from "react";

type CourseLecturerAvatarProps = {
  name: string;
  size?: "sm" | "lg";
};

const SIZE_STYLES = {
  sm: {
    wrapper: "h-12 w-12 text-sm",
    ring: "ring-2",
  },
  lg: {
    wrapper: "h-20 w-20 text-xl",
    ring: "ring-4",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function CourseLecturerAvatar({
  name,
  size = "lg",
}: CourseLecturerAvatarProps) {
  const styles = SIZE_STYLES[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#60a5fa] via-[#2563eb] to-[#1d4ed8] font-bold text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)] ring-white ${styles.wrapper} ${styles.ring}`}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
